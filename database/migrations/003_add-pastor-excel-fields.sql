-- Champs supplementaires pour conserver les informations des fichiers Excel CBCA.

ALTER TABLE pastors
  ADD COLUMN id_serviteur VARCHAR(40) NULL AFTER id;

ALTER TABLE pastors
  ADD COLUMN entite VARCHAR(120) NULL AFTER poste;

CREATE INDEX idx_pastors_id_serviteur ON pastors (id_serviteur);
CREATE INDEX idx_pastors_entite ON pastors (entite);
