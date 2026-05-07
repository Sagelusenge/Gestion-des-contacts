USE cbca_annuaire;

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

ALTER TABLE pastors
  DROP CONSTRAINT chk_pastors_degre;

INSERT INTO grades (nom, description)
VALUES
  ('Révérend', 'Grade pastoral'),
  ('Pasteur', 'Grade pastoral'),
  ('Évangéliste', 'Grade ministeriel'),
  ('Aumônier', 'Service pastoral specialise'),
  ('Stagiaire', 'Stage pastoral')
ON DUPLICATE KEY UPDATE
  description = VALUES(description);
