import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { withCommunicationLinks } from '../utils/communicationLinks.js';
import { httpError } from '../utils/httpError.js';
import { getPagination, toPaginationMeta } from '../utils/pagination.js';

const router = Router();

const PASTOR_FIELDS = `
  id,
  nom,
  degre,
  poste,
  telephone,
  email,
  date_affectation,
  created_at,
  updated_at
`;

router.use(authenticate);

async function readPastorPayload(body) {
  const payload = {
    nom: String(body.nom || '').trim(),
    degre: String(body.degre || '').trim(),
    poste: String(body.poste || '').trim(),
    telephone: String(body.telephone || '').trim(),
    email: body.email ? String(body.email).trim() : null,
    date_affectation: body.date_affectation ? String(body.date_affectation).trim() : null
  };

  if (!payload.nom) {
    throw httpError(400, 'Le nom du pasteur est requis.');
  }

  const [gradeRows] = await pool.execute(
    'SELECT id FROM grades WHERE nom = :degre LIMIT 1',
    { degre: payload.degre }
  );

  if (!gradeRows[0]) {
    throw httpError(400, 'Degre invalide.');
  }

  if (!payload.poste) {
    throw httpError(400, "Le poste est requis. Il doit etre ajoute par l'admin.");
  }

  if (!payload.telephone) {
    throw httpError(400, 'Le telephone est requis.');
  }

  return payload;
}

function buildPastorFilters(query) {
  const params = {};
  const filters = [];
  const q = String(query.q || '').trim();
  const degre = String(query.degre || '').trim();
  const poste = String(query.poste || '').trim();

  if (q) {
    filters.push('(nom LIKE :qPrefix OR degre LIKE :qPrefix OR poste LIKE :qPrefix OR nom LIKE :qContains OR poste LIKE :qContains)');
    params.qPrefix = `${q}%`;
    params.qContains = `%${q}%`;
  }

  if (degre) {
    filters.push('degre = :degre');
    params.degre = degre;
  }

  if (poste) {
    filters.push('poste LIKE :poste');
    params.poste = `%${poste}%`;
  }

  return {
    where: filters.length ? `WHERE ${filters.join(' AND ')}` : '',
    params
  };
}

async function listPastors(req, res) {
  const { page, limit, offset } = getPagination(req.query);
  const { where, params } = buildPastorFilters(req.query);

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total
     FROM pastors
     ${where}`,
    params
  );

  const [rows] = await pool.execute(
    `SELECT ${PASTOR_FIELDS}
     FROM pastors
     ${where}
     ORDER BY nom ASC
     LIMIT :limit OFFSET :offset`,
    { ...params, limit, offset }
  );

  res.json({
    data: rows.map(withCommunicationLinks),
    meta: toPaginationMeta({
      page,
      limit,
      total: countRows[0].total
    })
  });
}

router.get('/', asyncHandler(listPastors));
router.get('/search', asyncHandler(listPastors));

router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant pasteur invalide.');
    }

    const [rows] = await pool.execute(
      `SELECT ${PASTOR_FIELDS}
       FROM pastors
       WHERE id = :id
       LIMIT 1`,
      { id }
    );

    if (!rows[0]) {
      throw httpError(404, 'Pasteur introuvable.');
    }

    res.json({ data: withCommunicationLinks(rows[0]) });
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const payload = await readPastorPayload(req.body);

    const [result] = await pool.execute(
      `INSERT INTO pastors (nom, degre, poste, telephone, email, date_affectation)
       VALUES (:nom, :degre, :poste, :telephone, :email, :date_affectation)`,
      payload
    );

    const [rows] = await pool.execute(
      `SELECT ${PASTOR_FIELDS}
       FROM pastors
       WHERE id = :id`,
      { id: result.insertId }
    );

    res.status(201).json({ data: withCommunicationLinks(rows[0]) });
  })
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const payload = await readPastorPayload(req.body);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant pasteur invalide.');
    }

    const [result] = await pool.execute(
      `UPDATE pastors
       SET nom = :nom,
           degre = :degre,
           poste = :poste,
           telephone = :telephone,
           email = :email,
           date_affectation = :date_affectation
       WHERE id = :id`,
      { ...payload, id }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Pasteur introuvable.');
    }

    const [rows] = await pool.execute(
      `SELECT ${PASTOR_FIELDS}
       FROM pastors
       WHERE id = :id`,
      { id }
    );

    res.json({ data: withCommunicationLinks(rows[0]) });
  })
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant pasteur invalide.');
    }

    const [result] = await pool.execute('DELETE FROM pastors WHERE id = :id', { id });

    if (result.affectedRows === 0) {
      throw httpError(404, 'Pasteur introuvable.');
    }

    res.status(204).send();
  })
);

export default router;
