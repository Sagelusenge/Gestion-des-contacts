USE cbca_pastors;

-- Les mots de passe de production doivent être générés et hachés par le backend.
-- Le seed complet et haché est disponible via : npm run db:init

INSERT INTO Communautes (nom, code, description, pays, region, telephone, email, siteWeb, nombrePostes, couleur1, couleur2)
VALUES ('Communauté Baptiste au Centre de l’Afrique - Nord-Kivu', 'CBCA-NK', 'Base de pilotage pastoral et administratif', 'République Démocratique du Congo', 'Nord-Kivu', '+243 970 000 000', 'secretariat@cbca.cd', 'https://cbca.cd', 4, '#0B5CAB', '#B68A2C')
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Postes (nom, code, communauteId, telephone, email, adresse)
SELECT 'Poste de Goma', 'GOM', id, '+243 970 000 100', 'poste.goma@cbca.cd', 'Goma, Nord-Kivu' FROM Communautes WHERE code = 'CBCA-NK'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Postes (nom, code, communauteId, telephone, email, adresse)
SELECT 'Poste de Beni', 'BEN', id, '+243 970 000 200', 'poste.beni@cbca.cd', 'Beni, Nord-Kivu' FROM Communautes WHERE code = 'CBCA-NK'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Sections (nom, code, posteId, telephone)
SELECT 'Section Centre', 'GOM-C', id, '+243 970 001 100' FROM Postes WHERE code = 'GOM'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);

INSERT INTO Sections (nom, code, posteId, telephone)
SELECT 'Section Mulekera', 'BEN-M', id, '+243 970 002 100' FROM Postes WHERE code = 'BEN'
ON DUPLICATE KEY UPDATE nom = VALUES(nom);
