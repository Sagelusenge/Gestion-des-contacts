import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { httpError } from '../utils/httpError.js';

export function authenticate(req, _res, next) {
  const header = req.headers.authorization || '';
  const [scheme, token] = header.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return next(httpError(401, 'Authentification requise.'));
  }

  try {
    req.user = jwt.verify(token, env.jwt.secret);
    return next();
  } catch {
    return next(httpError(401, 'Session invalide ou expiree.'));
  }
}

export function requireAdmin(req, _res, next) {
  if (req.user?.role !== 'admin') {
    return next(httpError(403, "Acces reserve a l'admin."));
  }

  return next();
}
