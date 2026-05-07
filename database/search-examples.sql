-- Requetes prevues pour le futur backend Express.
-- Utiliser des parametres prepares cote Node.js, pas de concatenation SQL.

USE cbca_annuaire;

-- Pagination: GET /api/pastors?page=1&limit=20
SELECT
  id,
  nom,
  degre,
  poste,
  telephone,
  email,
  date_affectation
FROM pastors
ORDER BY nom ASC
LIMIT 20 OFFSET 0;

-- Recherche prefixee rapide: GET /api/pastors/search?q=mu
-- Les index B-tree peuvent aider avec LIKE 'terme%'.
SET @q = 'mu';

SELECT
  id,
  nom,
  degre,
  poste,
  telephone,
  email,
  date_affectation
FROM pastors
WHERE nom LIKE CONCAT(@q, '%')
   OR degre LIKE CONCAT(@q, '%')
   OR poste LIKE CONCAT(@q, '%')
   OR nom LIKE CONCAT('%', @q, '%')
   OR poste LIKE CONCAT('%', @q, '%')
ORDER BY nom ASC
LIMIT 20 OFFSET 0;

-- Recherche textuelle plus souple si l'utilisateur saisit plusieurs mots.
SET @text_query = 'pasteur goma';

SELECT
  id,
  nom,
  degre,
  poste,
  telephone,
  email,
  date_affectation,
  MATCH(nom, degre, poste) AGAINST (@text_query IN NATURAL LANGUAGE MODE) AS score
FROM pastors
WHERE MATCH(nom, degre, poste) AGAINST (@text_query IN NATURAL LANGUAGE MODE)
ORDER BY score DESC, nom ASC
LIMIT 20 OFFSET 0;

-- Filtre rapide par degre ou region/poste.
SET @degre = 'Révérend';
SET @poste = 'Goma';

SELECT
  id,
  nom,
  degre,
  poste,
  telephone,
  email,
  date_affectation
FROM pastors
WHERE (@degre IS NULL OR degre = @degre)
  AND (@poste IS NULL OR poste LIKE CONCAT('%', @poste, '%'))
ORDER BY nom ASC
LIMIT 20 OFFSET 0;
