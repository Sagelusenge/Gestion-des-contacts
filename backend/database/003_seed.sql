USE cbca_pastors;

-- Seed minimal SQL pour la géographie. Pour les utilisateurs avec mots de passe hachés,
-- exécuter plutôt le script Node officiel : npm run db:init

INSERT INTO Communautes (nom, code, description, pays, region, telephone, email, siteWeb, nombrePostes, logo, couleur1, couleur2)
VALUES ('Communauté Baptiste au Centre de l’Afrique - Nord-Kivu', 'CBCA-NK', 'Base de pilotage pastoral et administratif', 'République Démocratique du Congo', 'Nord-Kivu', '+243970000000', 'secretariat@cbca.cd', 'https://cbca-kanisa.org', 4, '/cbca-logo.jpg', '#0B5CAB', '#B68A2C')
ON DUPLICATE KEY UPDATE nom = VALUES(nom), logo = VALUES(logo);

INSERT INTO Postes (nom, code, communauteId, telephone, email, adresse)
SELECT 'Poste de Goma', 'GOM', id, '+243970000100', 'poste.goma@cbca.cd', 'Goma, Nord-Kivu' FROM Communautes WHERE code = 'CBCA-NK'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Postes (nom, code, communauteId, telephone, email, adresse)
SELECT 'Poste de Beni', 'BEN', id, '+243970000200', 'poste.beni@cbca.cd', 'Beni, Nord-Kivu' FROM Communautes WHERE code = 'CBCA-NK'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Sections (nom, code, posteId, telephone)
SELECT 'Section Centre', 'GOM-C', id, '+243970001100' FROM Postes WHERE code = 'GOM'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Sections (nom, code, posteId, telephone)
SELECT 'Section Mulekera', 'BEN-M', id, '+243970002100' FROM Postes WHERE code = 'BEN'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Paroisses (nom, code, sectionId, posteId, nombreMembers)
SELECT 'Paroisse Baraka', 'BAR', s.id, p.id, 1680
FROM Sections s INNER JOIN Postes p ON p.id = s.posteId
WHERE s.code = 'GOM-C'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Paroisses (nom, code, sectionId, posteId, nombreMembers)
SELECT 'Paroisse Cité Belge', 'CBG', s.id, p.id, 1435
FROM Sections s INNER JOIN Postes p ON p.id = s.posteId
WHERE s.code = 'BEN-M'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
