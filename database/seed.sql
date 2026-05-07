-- Annuaire CBCA - donnees de depart

USE cbca_annuaire;

INSERT INTO users (username, password_hash, role)
VALUES
  (
    'admin',
    '$2b$10$Q03wnzbcweEJWDz7F1SUYuEx.2HZ0wpKkJchLdr2CWX0TR0jBFInG',
    'admin'
  )
ON DUPLICATE KEY UPDATE
  role = VALUES(role);

INSERT INTO postes (nom, region, description)
VALUES
  ('Goma', 'Goma', 'Poste ecclesiastique de Goma'),
  ('Kinshasa', 'Kinshasa', 'Poste ecclesiastique de Kinshasa'),
  ('Bukavu', 'Bukavu', 'Poste ecclesiastique de Bukavu'),
  ('Beni', 'Beni', 'Poste ecclesiastique de Beni'),
  ('Butembo', 'Butembo', 'Poste ecclesiastique de Butembo'),
  ('Lubero', 'Lubero', 'Poste ecclesiastique de Lubero'),
  ('Oicha', 'Oicha', 'Poste ecclesiastique de Oicha'),
  ('Kayna', 'Kayna', 'Poste ecclesiastique de Kayna'),
  ('Minova', 'Minova', 'Poste ecclesiastique de Minova'),
  ('Masisi', 'Masisi', 'Poste ecclesiastique de Masisi'),
  ('Rutshuru', 'Rutshuru', 'Poste ecclesiastique de Rutshuru'),
  ('Walikale', 'Walikale', 'Poste ecclesiastique de Walikale'),
  ('Paroisse CBCA Goma Centre', 'Goma', 'Paroisse principale de Goma Centre'),
  ('Poste CBCA Beni', 'Beni', 'Poste pastoral de Beni'),
  ('Département Jeunesse', NULL, 'Département jeunesse CBCA'),
  ('Paroisse CBCA Butembo', 'Butembo', 'Paroisse CBCA Butembo')
ON DUPLICATE KEY UPDATE
  region = VALUES(region),
  description = VALUES(description);

INSERT INTO grades (nom, description)
VALUES
  ('Révérend', 'Grade pastoral'),
  ('Pasteur', 'Grade pastoral'),
  ('Évangéliste', 'Grade ministeriel'),
  ('Aumônier', 'Service pastoral specialise'),
  ('Stagiaire', 'Stage pastoral')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);

INSERT INTO pastors (nom, degre, poste, telephone, email, date_affectation)
VALUES
  ('Jean Mukendi', 'Révérend', 'Paroisse CBCA Goma Centre', '+243970000001', 'jean.mukendi@example.org', '2024-01-15'),
  ('Paul Kambale', 'Pasteur', 'Poste CBCA Beni', '+243970000002', 'paul.kambale@example.org', '2023-09-01'),
  ('Samuel Balume', 'Évangéliste', 'Département Jeunesse', '+243970000003', 'samuel.balume@example.org', NULL),
  ('Daniel Kasereka', 'Stagiaire', 'Paroisse CBCA Butembo', '+243970000004', NULL, '2025-03-10')
ON DUPLICATE KEY UPDATE
  nom = VALUES(nom),
  degre = VALUES(degre),
  poste = VALUES(poste),
  telephone = VALUES(telephone),
  email = VALUES(email),
  date_affectation = VALUES(date_affectation);
