import bcrypt from 'bcryptjs';
import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { pool } from '../config/db.js';
import { env } from '../config/env.js';
import { authenticate } from '../middleware/auth.js';
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

export default router;
