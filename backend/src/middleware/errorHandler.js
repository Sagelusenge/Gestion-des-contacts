import { env } from '../config/env.js';

export function notFound(req, _res, next) {
  const error = new Error(`Route introuvable: ${req.method} ${req.originalUrl}`);
  error.status = 404;
  next(error);
}

export function errorHandler(error, _req, res, _next) {
  const status = error.status || 500;

  res.status(status).json({
    message: status === 500 ? 'Erreur interne du serveur.' : error.message,
    ...(env.nodeEnv === 'development' ? { detail: error.message } : {})
  });
}
