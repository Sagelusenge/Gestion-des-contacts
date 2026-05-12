-- Annuaire CBCA - schema pour Clever Cloud MySQL
-- Importer ce fichier dans la base creee par l'add-on Clever Cloud.

CREATE TABLE IF NOT EXISTS users (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  username VARCHAR(60) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'viewer') NOT NULL DEFAULT 'viewer',
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_users_username (username),
  KEY idx_users_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS postes (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  region VARCHAR(100) NULL,
  description VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_postes_nom (nom),
  KEY idx_postes_nom (nom),
  KEY idx_postes_region (region),
  CONSTRAINT fk_postes_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS grades (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(50) NOT NULL,
  description VARCHAR(255) NULL,
  created_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_grades_nom (nom),
  KEY idx_grades_nom (nom),
  CONSTRAINT fk_grades_created_by
    FOREIGN KEY (created_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS pastors (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_serviteur VARCHAR(40) NULL,
  nom VARCHAR(100) NOT NULL,
  degre VARCHAR(50) NOT NULL,
  poste VARCHAR(100) NOT NULL,
  entite VARCHAR(120) NULL,
  telephone VARCHAR(20) NOT NULL,
  email VARCHAR(100) NULL,
  date_affectation DATE NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_pastors_nom (nom),
  KEY idx_pastors_id_serviteur (id_serviteur),
  KEY idx_pastors_degre (degre),
  KEY idx_pastors_poste (poste),
  KEY idx_pastors_entite (entite),
  KEY idx_pastors_degre_poste (degre, poste),
  KEY idx_pastors_date_affectation (date_affectation),
  UNIQUE KEY uq_pastors_telephone (telephone),
  FULLTEXT KEY ftx_pastors_search (nom, degre, poste)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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

INSERT INTO grades (nom, description)
VALUES
  ('Reverend', 'Grade pastoral'),
  ('Pasteur', 'Grade pastoral'),
  ('Evangeliste', 'Grade ministeriel'),
  ('Aumonier', 'Service pastoral specialise'),
  ('Stagiaire', 'Stage pastoral')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);
