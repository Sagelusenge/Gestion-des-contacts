import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

/**
 * Toutes les routes de postes nécessitent une authentification.
 * Donc pas besoin de remettre authenticate dans chaque route.
 */
router.use(authenticate);

/**
 * GET /api/postes
 * Accessible à admin et utilisateur standard.
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const region = String(req.query.region || '').trim();

    const params = {};
    const filters = [];

    if (region) {
      filters.push('region LIKE :region');
      params.region = `${region}%`;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';

    const [postes] = await pool.execute(
      `SELECT id, nom, region, description, created_at, updated_at
       FROM postes
       ${where}
       ORDER BY nom ASC`,
      params
    );

    res.json({
      data: postes
    });
  })
);

/**
 * GET /api/postes/:id
 * Accessible à admin et utilisateur standard.
 */
router.get(
  '/:id',
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant poste invalide.');
    }

    const [rows] = await pool.execute(
      `SELECT id, nom, region, description, created_at, updated_at
       FROM postes
       WHERE id = :id`,
      { id }
    );

    if (rows.length === 0) {
      throw httpError(404, 'Poste introuvable.');
    }

    res.json({
      data: rows[0]
    });
  })
);

/**
 * POST /api/postes
 * Réservé à l'admin.
 */
router.post(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const nom = String(req.body.nom || '').trim();
    const region = req.body.region ? String(req.body.region).trim() : null;
    const description = req.body.description
      ? String(req.body.description).trim()
      : null;

    if (!nom) {
      throw httpError(400, 'Le nom du poste est requis.');
    }

    const [result] = await pool.execute(
      `INSERT INTO postes (nom, region, description, created_by)
       VALUES (:nom, :region, :description, :createdBy)`,
      {
        nom,
        region,
        description,
        createdBy: req.user.id
      }
    );

    const [rows] = await pool.execute(
      `SELECT id, nom, region, description, created_at, updated_at
       FROM postes
       WHERE id = :id`,
      {
        id: result.insertId
      }
    );

    res.status(201).json({
      message: 'Poste créé avec succès.',
      data: rows[0]
    });
  })
);

/**
 * PUT /api/postes/:id
 * Réservé à l'admin.
 */
router.put(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const nom = String(req.body.nom || '').trim();
    const region = req.body.region ? String(req.body.region).trim() : null;
    const description = req.body.description
      ? String(req.body.description).trim()
      : null;

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant poste invalide.');
    }

    if (!nom) {
      throw httpError(400, 'Le nom du poste est requis.');
    }

    const [result] = await pool.execute(
      `UPDATE postes
       SET nom = :nom,
           region = :region,
           description = :description
       WHERE id = :id`,
      {
        id,
        nom,
        region,
        description
      }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Poste introuvable.');
    }

    const [rows] = await pool.execute(
      `SELECT id, nom, region, description, created_at, updated_at
       FROM postes
       WHERE id = :id`,
      {
        id
      }
    );

    res.json({
      message: 'Poste modifié avec succès.',
      data: rows[0]
    });
  })
);

/**
 * DELETE /api/postes/:id
 * Réservé à l'admin.
 */
router.delete(
  '/:id',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant poste invalide.');
    }

    const [result] = await pool.execute(
      `DELETE FROM postes
       WHERE id = :id`,
      {
        id
      }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Poste introuvable.');
    }

    res.json({
      message: 'Poste supprimé avec succès.'
    });
  })
);

export default router;