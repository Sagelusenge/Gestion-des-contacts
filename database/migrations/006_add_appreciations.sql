-- Ajouter les appreciations envoyees par les clients.

CREATE TABLE IF NOT EXISTS appreciations (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  nom VARCHAR(100) NOT NULL,
  quartier VARCHAR(100) NULL,
  note TINYINT UNSIGNED NOT NULL DEFAULT 5,
  message TEXT NOT NULL,
  status ENUM('pending', 'approved', 'rejected') NOT NULL DEFAULT 'pending',
  submitted_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  KEY idx_appreciations_status (status),
  KEY idx_appreciations_note (note),
  KEY idx_appreciations_created_at (created_at),
  CONSTRAINT fk_appreciations_submitted_by
    FOREIGN KEY (submitted_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
