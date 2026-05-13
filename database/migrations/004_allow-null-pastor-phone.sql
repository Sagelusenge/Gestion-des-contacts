-- Permettre l'import de serviteurs sans numero de telephone.

ALTER TABLE pastors
  MODIFY telephone VARCHAR(20) NULL;

DROP INDEX idx_pastors_id_serviteur ON pastors;

CREATE UNIQUE INDEX uq_pastors_id_serviteur ON pastors (id_serviteur);

DROP INDEX uq_pastors_telephone ON pastors;

CREATE INDEX idx_pastors_telephone ON pastors (telephone);
