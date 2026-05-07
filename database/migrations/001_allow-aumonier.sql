USE cbca_annuaire;

ALTER TABLE pastors
  DROP CONSTRAINT chk_pastors_degre;

ALTER TABLE pastors
  ADD CONSTRAINT chk_pastors_degre CHECK (
    degre IN ('Révérend', 'Pasteur', 'Évangéliste', 'Aumônier', 'Stagiaire')
  );
