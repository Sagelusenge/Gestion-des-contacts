import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

router.use(authenticate);

router.get(
  '/',
  asyncHandler(async (_req, res) => {
    const [grades] = await pool.execute(
      `SELECT id, nom, description, created_at, updated_at
       FROM grades
       ORDER BY nom ASC`
    );

    res.json({ data: grades });
  })
);

router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const nom = String(req.body.nom || '').trim();
    const description = req.body.description ? String(req.body.description).trim() : null;

    if (!nom) {
      throw httpError(400, 'Le nom du grade est requis.');
    }

    const [result] = await pool.execute(
      `INSERT INTO grades (nom, description, created_by)
       VALUES (:nom, :description, :createdBy)`,
      { nom, description, createdBy: req.user.id }
    );

    const [rows] = await pool.execute(
      `SELECT id, nom, description, created_at, updated_at
       FROM grades
       WHERE id = :id`,
      { id: result.insertId }
    );

    res.status(201).json({ data: rows[0] });
  })
);

router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const nom = String(req.body.nom || '').trim();
    const description = req.body.description ? String(req.body.description).trim() : null;

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant grade invalide.');
    }

    if (!nom) {
      throw httpError(400, 'Le nom du grade est requis.');
    }

    const [result] = await pool.execute(
      `UPDATE grades
       SET nom = :nom, description = :description
       WHERE id = :id`,
      { id, nom, description }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Grade introuvable.');
    }

    const [rows] = await pool.execute(
      `SELECT id, nom, description, created_at, updated_at
       FROM grades
       WHERE id = :id`,
      { id }
    );

    res.json({ data: rows[0] });
  })
);

router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant grade invalide.');
    }

    const [rows] = await pool.execute('SELECT nom FROM grades WHERE id = :id', { id });

    if (!rows[0]) {
      throw httpError(404, 'Grade introuvable.');
    }

    const [usedRows] = await pool.execute(
      'SELECT COUNT(*) AS total FROM pastors WHERE degre = :degre',
      { degre: rows[0].nom }
    );

    if (usedRows[0].total > 0) {
      throw httpError(409, 'Ce grade est utilise par des pasteurs.');
    }

    await pool.execute('DELETE FROM grades WHERE id = :id', { id });
    res.status(204).send();
  })
);

export default router;
