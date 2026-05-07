-- Utilisateur applicatif pour eviter d'utiliser root dans Express.
-- A executer avec un compte MySQL administrateur.

CREATE USER IF NOT EXISTS 'cbca_app'@'localhost'
  IDENTIFIED BY 'cbca_password';

GRANT SELECT, INSERT, UPDATE, DELETE
ON cbca_annuaire.*
TO 'cbca_app'@'localhost';

FLUSH PRIVILEGES;
