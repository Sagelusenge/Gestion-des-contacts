import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

router.post(
  '/login',
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim();
    const password = String(req.body.password || '');

    if (!username || !password) {
      throw httpError(400, 'Nom utilisateur et mot de passe requis.');
    }

    const [users] = await pool.execute(
      `SELECT id, username, password_hash, role
       FROM users
       WHERE username = :username
       LIMIT 1`,
      { username }
    );

    const user = users[0];
    const isValidPassword = user
      ? await bcrypt.compare(password, user.password_hash)
      : false;

    if (!user || !isValidPassword) {
      throw httpError(401, 'Identifiants invalides.');
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      env.jwt.secret,
      { expiresIn: env.jwt.expiresIn }
    );

    res.json({
      token,
      user: {
        id: user.id,
        username: user.username,
        role: user.role
      }
    });
  })
);

router.get('/me', authenticate, (req, res) => {
  res.json({ user: req.user });
});

router.get(
  '/users',
  authenticate,
  requireAdmin,
  asyncHandler(async (_req, res) => {
    const [users] = await pool.execute(
      `SELECT id, username, role, created_at, updated_at
       FROM users
       ORDER BY created_at DESC`
    );

    res.json({ data: users });
  })
);

router.post(
  '/users',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const username = String(req.body.username || '').trim().toLowerCase();
    const password = String(req.body.password || '');
    const role = String(req.body.role || 'viewer').trim().toLowerCase();

    if (!username || !password) {
      throw httpError(400, 'Email et mot de passe requis.');
    }

    if (!username.includes('@')) {
      throw httpError(400, 'Email invalide.');
    }

    if (password.length < 6) {
      throw httpError(400, 'Le mot de passe doit avoir au moins 6 caracteres.');
    }

    if (role !== 'admin' && role !== 'viewer') {
      throw httpError(400, 'Role invalide. Les roles valides sont admin ou viewer.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.execute(
        `INSERT INTO users (username, password_hash, role)
         VALUES (:username, :passwordHash, :role)`,
        { username, passwordHash, role }
      );

      const [rows] = await pool.execute(
        `SELECT id, username, role, created_at, updated_at
         FROM users
         WHERE id = :id`,
        { id: result.insertId }
      );

      res.status(201).json({ data: rows[0] });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw httpError(409, 'Cet email existe deja.');
      }

      throw error;
    }
  })
);

router.patch(
  '/users/:id/role',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);
    const role = String(req.body.role || '').trim().toLowerCase();

    if (isNaN(id)) {
      throw httpError(400, 'ID utilisateur invalide.');
    }

    if (role !== 'admin' && role !== 'viewer') {
      throw httpError(400, 'Role invalide. Les roles valides sont admin ou viewer.');
    }

    if (req.user.id === id && role !== 'admin') {
      throw httpError(400, 'Vous ne pouvez pas retirer votre propre role admin.');
    }

    const [result] = await pool.execute(
      `UPDATE users
       SET role = :role
       WHERE id = :id`,
      { role, id }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Utilisateur non trouve.');
    }

    const [rows] = await pool.execute(
      `SELECT id, username, role, created_at, updated_at
       FROM users
       WHERE id = :id`,
      { id }
    );

    res.json({ data: rows[0] });
  })
);

router.delete(
  '/users/:id',
  authenticate,
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = parseInt(req.params.id, 10);

    if (isNaN(id)) {
      throw httpError(400, 'ID utilisateur invalide.');
    }

    if (req.user.id === id) {
      throw httpError(400, 'Vous ne pouvez pas supprimer votre propre compte.');
    }

    const [result] = await pool.execute(
      `DELETE FROM users
       WHERE id = :id`,
      { id }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Utilisateur non trouve.');
    }

    res.json({ message: 'Utilisateur supprime avec succes.' });
  })
);

export default router;
