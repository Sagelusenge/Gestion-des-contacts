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

  const [fonctionRows] = await pool.execute(
    'SELECT id FROM grades WHERE nom = :degre LIMIT 1',
    { degre: payload.degre }
  );

  if (!fonctionRows[0]) {
    throw httpError(400, 'Fonction invalide.');
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

function normalizeImportDate(value) {
  if (!value) {
    return null;
  }

  const text = String(value).trim();
  return /^\d{4}-\d{2}-\d{2}/.test(text) ? text.slice(0, 10) : text;
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
     LIMIT ${limit} OFFSET ${offset}`,
    params
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

router.post(
  '/import',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const rows = Array.isArray(req.body.rows) ? req.body.rows : [];

    if (!rows.length) {
      throw httpError(400, 'Aucune ligne a importer.');
    }

    const connection = await pool.getConnection();
    const summary = {
      imported: 0,
      skipped: 0,
      createdFunctions: 0,
      createdPostes: 0,
      errors: []
    };

    try {
      await connection.beginTransaction();

      for (const [index, row] of rows.entries()) {
        const payload = {
          nom: String(row.nom || row.Nom || row.name || '').trim(),
          degre: String(row.degre || row.fonction || row.Fonction || row.grade || row.Grade || '').trim(),
          poste: String(row.poste || row.Poste || '').trim(),
          region: String(row.region || row.Region || '').trim(),
          telephone: String(row.telephone || row.Telephone || row.Téléphone || row.phone || '').trim(),
          email: row.email || row.Email ? String(row.email || row.Email).trim() : null,
          date_affectation: normalizeImportDate(row.date_affectation || row.Affectation || row['Date affectation'])
        };

        if (!payload.nom || !payload.degre || !payload.poste || !payload.telephone) {
          summary.skipped += 1;
          summary.errors.push(`Ligne ${index + 2}: nom, fonction, poste et telephone sont requis.`);
          continue;
        }

        const [fonctionRows] = await connection.execute(
          'SELECT id FROM grades WHERE nom = :nom LIMIT 1',
          { nom: payload.degre }
        );

        if (!fonctionRows[0]) {
          await connection.execute(
            `INSERT INTO grades (nom, description, created_by)
             VALUES (:nom, :description, :createdBy)`,
            {
              nom: payload.degre,
              description: 'Fonction creee par import Excel',
              createdBy: req.user.id
            }
          );
          summary.createdFunctions += 1;
        }

        const [posteRows] = await connection.execute(
          'SELECT id FROM postes WHERE nom = :nom LIMIT 1',
          { nom: payload.poste }
        );

        if (!posteRows[0]) {
          await connection.execute(
            `INSERT INTO postes (nom, region, description, created_by)
             VALUES (:nom, :region, :description, :createdBy)`,
            {
              nom: payload.poste,
              region: payload.region || null,
              description: 'Poste cree par import Excel',
              createdBy: req.user.id
            }
          );
          summary.createdPostes += 1;
        } else if (payload.region) {
          await connection.execute(
            `UPDATE postes
             SET region = COALESCE(NULLIF(region, ''), :region)
             WHERE nom = :nom`,
            { nom: payload.poste, region: payload.region }
          );
        }

        await connection.execute(
          `INSERT INTO pastors (nom, degre, poste, telephone, email, date_affectation)
           VALUES (:nom, :degre, :poste, :telephone, :email, :date_affectation)
           ON DUPLICATE KEY UPDATE
             nom = VALUES(nom),
             degre = VALUES(degre),
             poste = VALUES(poste),
             telephone = VALUES(telephone),
             email = VALUES(email),
             date_affectation = VALUES(date_affectation)`,
          {
            nom: payload.nom,
            degre: payload.degre,
            poste: payload.poste,
            telephone: payload.telephone,
            email: payload.email || null,
            date_affectation: payload.date_affectation || null
          }
        );

        summary.imported += 1;
      }

      await connection.commit();
      res.status(201).json({ data: summary });
    } catch (error) {
      await connection.rollback();
      throw error;
    } finally {
      connection.release();
    }
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
