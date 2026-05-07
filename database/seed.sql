-- Annuaire CBCA - donnees de depart minimales

USE cbca_annuaire;

INSERT INTO users (username, password_hash, role)
VALUES
  (
    'sagelusenge@gmail.com',
    '$2a$10$Uj.EfrB/UtvH670IZW3rvOG3JTkCm.QktT6d8eTUg.GkgnjAL2qmW',
    'admin'
  )
ON DUPLICATE KEY UPDATE
  password_hash = VALUES(password_hash),
  role = VALUES(role);
