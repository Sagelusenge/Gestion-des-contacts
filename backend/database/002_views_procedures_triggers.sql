USE cbca_pastors;

DROP VIEW IF EXISTS v_pasteurs_carte;
CREATE VIEW v_pasteurs_carte AS
SELECT p.id, p.matricule, p.numeroIdentifiant, CONCAT(p.prenom, ' ', p.nom) AS nomComplet,
       p.grade, p.responsabilite, p.fonction, p.telephone, p.email, p.dateOrdination, p.statut,
       po.nom AS poste, s.nom AS section, pa.nom AS paroisse, p.etatCivil,
       JSON_UNQUOTE(JSON_EXTRACT(p.conjoint, '$.nom')) AS conjointNom
FROM Pasteurs p
LEFT JOIN Postes po ON po.id = p.posteId
LEFT JOIN Sections s ON s.id = p.sectionId
LEFT JOIN Paroisses pa ON pa.id = p.paroisseId;

DROP VIEW IF EXISTS v_whatsapp_messages;
CREATE VIEW v_whatsapp_messages AS
SELECT mr.id, mr.messageId, mr.pasteurId, CONCAT(p.prenom, ' ', p.nom) AS pasteur,
       p.telephone, p.grade, p.responsabilite, m.objet, m.contenu, m.priorite, m.canal, m.sentAt
FROM MessageRecipients mr
INNER JOIN Messages m ON m.id = mr.messageId
INNER JOIN Pasteurs p ON p.id = mr.pasteurId
WHERE m.canal IN ('WHATSAPP', 'MIXTE');

DROP VIEW IF EXISTS v_dashboard_grades;
CREATE VIEW v_dashboard_grades AS
SELECT grade, responsabilite, statut, COUNT(*) AS total
FROM Pasteurs
GROUP BY grade, responsabilite, statut;

DROP VIEW IF EXISTS v_couverture_postes;
CREATE VIEW v_couverture_postes AS
SELECT po.id, po.code, po.nom AS poste,
       COUNT(DISTINCT p.id) AS pasteurs,
       COUNT(DISTINCT s.id) AS sections,
       COUNT(DISTINCT pa.id) AS paroisses
FROM Postes po
LEFT JOIN Pasteurs p ON p.posteId = po.id
LEFT JOIN Sections s ON s.posteId = po.id
LEFT JOIN Paroisses pa ON pa.posteId = po.id
GROUP BY po.id, po.code, po.nom;

DROP VIEW IF EXISTS v_alertes_mandat;
CREATE VIEW v_alertes_mandat AS
SELECT m.id, p.id AS pasteurId, CONCAT(p.prenom, ' ', p.nom) AS pasteur,
       po.nom AS posteCourant, m.dateFin AS dateFinMandat,
       DATEDIFF(m.dateFin, CURDATE()) AS joursRestants
FROM Mouvements m
INNER JOIN Pasteurs p ON p.id = m.pasteurId
INNER JOIN Postes po ON po.id = m.posteCibleId
WHERE m.statut = 'Effectué'
  AND m.dateFin IS NOT NULL
  AND m.dateFin BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 6 MONTH);

DELIMITER //

DROP PROCEDURE IF EXISTS sp_dashboard_resume//
CREATE PROCEDURE sp_dashboard_resume()
BEGIN
  SELECT (SELECT COUNT(*) FROM Pasteurs) AS totalPasteurs,
         (SELECT COUNT(*) FROM Postes) AS totalPostes,
         (SELECT COUNT(*) FROM Sections) AS totalSections,
         (SELECT COUNT(*) FROM Paroisses) AS totalParoisses,
         (SELECT COUNT(*) FROM v_alertes_mandat) AS alertesMandats,
         (SELECT COUNT(*) FROM MessageRecipients WHERE canalLivraison = 'WHATSAPP') AS messagesWhatsApp;
END//

DROP PROCEDURE IF EXISTS sp_search_pasteurs//
CREATE PROCEDURE sp_search_pasteurs(IN searchTerm VARCHAR(120))
BEGIN
  SELECT *
  FROM v_pasteurs_carte
  WHERE searchTerm IS NULL OR searchTerm = ''
     OR nomComplet LIKE CONCAT('%', searchTerm, '%')
     OR matricule LIKE CONCAT('%', searchTerm, '%')
     OR poste LIKE CONCAT('%', searchTerm, '%')
     OR responsabilite LIKE CONCAT('%', searchTerm, '%')
  ORDER BY nomComplet ASC;
END//

DROP PROCEDURE IF EXISTS sp_affecter_pasteur//
CREATE PROCEDURE sp_affecter_pasteur(IN inPasteurId INT, IN inPosteCibleId INT, IN inDateDebut DATE, IN inDateFin DATE, IN inCreatedById INT)
BEGIN
  INSERT INTO Mouvements (pasteurId, posteSourceId, posteCibleId, typeMovement, dateDebut, dateFin, statut, createdById, createdAt, updatedAt)
  SELECT p.id, p.posteId, inPosteCibleId, 'Transfert', inDateDebut, inDateFin, 'Effectué', inCreatedById, NOW(), NOW()
  FROM Pasteurs p WHERE p.id = inPasteurId;

  UPDATE Pasteurs SET posteId = inPosteCibleId, updatedById = inCreatedById, updatedAt = NOW()
  WHERE id = inPasteurId;
END//

DROP TRIGGER IF EXISTS trg_pasteurs_after_update_audit//
CREATE TRIGGER trg_pasteurs_after_update_audit
AFTER UPDATE ON Pasteurs
FOR EACH ROW
BEGIN
  INSERT INTO AuditLogs (action, entite, entiteId, utilisateurId, utilisateurNom, anciennes, nouvelles, createdAt, updatedAt)
  VALUES ('UPDATE', 'Pasteur', NEW.id, NEW.updatedById, 'TRIGGER_MYSQL',
    JSON_OBJECT('telephone', OLD.telephone, 'posteId', OLD.posteId, 'responsabilite', OLD.responsabilite, 'statut', OLD.statut),
    JSON_OBJECT('telephone', NEW.telephone, 'posteId', NEW.posteId, 'responsabilite', NEW.responsabilite, 'statut', NEW.statut),
    NOW(), NOW());
END//

DROP TRIGGER IF EXISTS trg_mouvements_after_insert_alert//
CREATE TRIGGER trg_mouvements_after_insert_alert
AFTER INSERT ON Mouvements
FOR EACH ROW
BEGIN
  IF NEW.dateFin IS NOT NULL AND NEW.dateFin <= DATE_ADD(CURDATE(), INTERVAL 6 MONTH) THEN
    UPDATE Pasteurs SET alerteFin = TRUE, updatedAt = NOW() WHERE id = NEW.pasteurId;
  END IF;
END//

DROP TRIGGER IF EXISTS trg_message_recipients_after_insert_audit//
CREATE TRIGGER trg_message_recipients_after_insert_audit
AFTER INSERT ON MessageRecipients
FOR EACH ROW
BEGIN
  UPDATE Messages SET updatedAt = NOW() WHERE id = NEW.messageId;
END//

DELIMITER ;
