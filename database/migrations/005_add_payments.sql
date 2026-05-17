-- Ajouter les preuves de paiement Mobile Money envoyees depuis l'app mobile.

CREATE TABLE IF NOT EXISTS payments (
  id INT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider VARCHAR(40) NOT NULL,
  amount DECIMAL(12, 2) NULL,
  currency ENUM('CDF', 'USD') NOT NULL DEFAULT 'CDF',
  payer_phone VARCHAR(30) NULL,
  trans_id VARCHAR(120) NOT NULL,
  note VARCHAR(255) NULL,
  status ENUM('pending', 'confirmed', 'rejected') NOT NULL DEFAULT 'pending',
  submitted_by INT UNSIGNED NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uq_payments_trans_id (trans_id),
  KEY idx_payments_status (status),
  KEY idx_payments_provider (provider),
  KEY idx_payments_created_at (created_at),
  CONSTRAINT fk_payments_submitted_by
    FOREIGN KEY (submitted_by) REFERENCES users(id)
    ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
