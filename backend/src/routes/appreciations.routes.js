import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

const APPRECIATION_FIELDS = `
  a.id,
  a.nom,
  a.quartier,
  a.note,
  a.message,
  a.status,
  a.submitted_by,
  u.username AS submitted_by_username,
  a.created_at,
  a.updated_at
`;

let schemaReadyPromise;

async function ensureAppreciationsTable() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.execute(`
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
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  return schemaReadyPromise;
}

router.use(asyncHandler(async (_req, _res, next) => {
  await ensureAppreciationsTable();
  next();
}));

function readAppreciationPayload(body) {
  const nom = String(body.nom || '').trim();
  const quartier = body.quartier ? String(body.quartier).trim() : null;
  const note = Number.parseInt(body.note, 10);
  const message = String(body.message || '').trim();

  if (!nom) {
    throw httpError(400, 'Le nom est requis.');
  }

  if (!Number.isInteger(note) || note < 1 || note > 5) {
    throw httpError(400, 'La note doit etre entre 1 et 5.');
  }

  if (message.length < 8) {
    throw httpError(400, 'Ajoutez une appreciation plus detaillee.');
  }

  return {
    nom,
    quartier,
    note,
    message
  };
}

router.get(
  '/public',
  asyncHandler(async (_req, res) => {
    const [appreciations] = await pool.execute(
      `SELECT id, nom, quartier, note, message, created_at
       FROM appreciations
       WHERE status = 'approved'
       ORDER BY created_at DESC
       LIMIT 4`
    );

    res.json({ data: appreciations });
  })
);

router.use(authenticate);

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || '').trim();
    const params = {};
    const filters = [];

    if (status) {
      if (!['pending', 'approved', 'rejected'].includes(status)) {
        throw httpError(400, 'Statut invalide.');
      }

      filters.push('a.status = :status');
      params.status = status;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [appreciations] = await pool.execute(
      `SELECT ${APPRECIATION_FIELDS}
       FROM appreciations a
       LEFT JOIN users u ON u.id = a.submitted_by
       ${where}
       ORDER BY a.created_at DESC
       LIMIT 500`,
      params
    );

    res.json({ data: appreciations });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = readAppreciationPayload(req.body);
    const [result] = await pool.execute(
      `INSERT INTO appreciations (nom, quartier, note, message, submitted_by)
       VALUES (:nom, :quartier, :note, :message, :submittedBy)`,
      {
        ...payload,
        submittedBy: req.user.id
      }
    );

    const [rows] = await pool.execute(
      `SELECT ${APPRECIATION_FIELDS}
       FROM appreciations a
       LEFT JOIN users u ON u.id = a.submitted_by
       WHERE a.id = :id`,
      { id: result.insertId }
    );

    res.status(201).json({ data: rows[0] });
  })
);

router.patch(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const status = String(req.body.status || '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant appreciation invalide.');
    }

    if (!['pending', 'approved', 'rejected'].includes(status)) {
      throw httpError(400, 'Statut invalide.');
    }

    const [result] = await pool.execute(
      `UPDATE appreciations
       SET status = :status
       WHERE id = :id`,
      { id, status }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Appreciation introuvable.');
    }

    const [rows] = await pool.execute(
      `SELECT ${APPRECIATION_FIELDS}
       FROM appreciations a
       LEFT JOIN users u ON u.id = a.submitted_by
       WHERE a.id = :id`,
      { id }
    );

    res.json({ data: rows[0] });
  })
);

export default router;
