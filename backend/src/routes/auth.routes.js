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

    if (!username || !password) {
      throw httpError(400, 'Email et mot de passe requis.');
    }

    if (!username.includes('@')) {
      throw httpError(400, 'Email invalide.');
    }

    if (password.length < 6) {
      throw httpError(400, 'Le mot de passe doit avoir au moins 6 caracteres.');
    }

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const [result] = await pool.execute(
        `INSERT INTO users (username, password_hash, role)
         VALUES (:username, :passwordHash, 'admin')`,
        { username, passwordHash }
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

export default router;
