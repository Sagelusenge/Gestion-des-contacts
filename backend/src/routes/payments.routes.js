import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';

const router = Router();

router.use(authenticate);

const PAYMENT_FIELDS = `
  p.id,
  p.provider,
  p.amount,
  p.currency,
  p.payer_phone,
  p.trans_id,
  p.note,
  p.status,
  p.submitted_by,
  u.username AS submitted_by_username,
  p.created_at,
  p.updated_at
`;

let schemaReadyPromise;

async function ensurePaymentsTable() {
  if (!schemaReadyPromise) {
    schemaReadyPromise = pool.execute(`
      CREATE TABLE IF NOT EXISTS payments (
        id INT UNSIGNED NOT NULL AUTO_INCREMENT,
        provider VARCHAR(40) NOT NULL,
        amount DECIMAL(12, 2) NULL,
        currency ENUM('CDF', 'USD') NOT NULL DEFAULT 'CDF',
        payer_phone VARCHAR(30) NULL,
        trans_id VARCHAR(120) NOT NULL,
        note VARCHAR(255) NULL,
        status ENUM('pending', 'confirmed', 'rejected') NOT NULL DEFAULT 'pending',
        submitted_by INT UNSIGNED NULL,
        created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
        PRIMARY KEY (id),
        UNIQUE KEY uq_payments_trans_id (trans_id),
        KEY idx_payments_status (status),
        KEY idx_payments_provider (provider),
        KEY idx_payments_created_at (created_at),
        CONSTRAINT fk_payments_submitted_by
          FOREIGN KEY (submitted_by) REFERENCES users(id)
          ON DELETE SET NULL
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
    `);
  }

  return schemaReadyPromise;
}

router.use(asyncHandler(async (_req, _res, next) => {
  await ensurePaymentsTable();
  next();
}));

function readPaymentPayload(body) {
  const provider = String(body.provider || '').trim().toLowerCase();
  const transId = String(body.transId || body.trans_id || '').trim();
  const amountValue = String(body.amount || '').trim();
  const currency = String(body.currency || 'CDF').trim().toUpperCase();
  const payerPhone = body.payerPhone || body.payer_phone
    ? String(body.payerPhone || body.payer_phone).trim()
    : null;
  const note = body.note ? String(body.note).trim() : null;

  if (!['airtel', 'orange', 'mpesa'].includes(provider)) {
    throw httpError(400, 'Mode de paiement invalide.');
  }

  if (!transId) {
    throw httpError(400, 'Le TransID est requis.');
  }

  if (!['CDF', 'USD'].includes(currency)) {
    throw httpError(400, 'Devise invalide.');
  }

  const amount = amountValue ? Number(amountValue.replace(',', '.')) : null;

  if (amount !== null && (!Number.isFinite(amount) || amount < 0)) {
    throw httpError(400, 'Montant invalide.');
  }

  return {
    provider,
    amount,
    currency,
    payerPhone,
    transId,
    note
  };
}

router.get(
  '/',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const status = String(req.query.status || '').trim();
    const params = {};
    const filters = [];

    if (status) {
      if (!['pending', 'confirmed', 'rejected'].includes(status)) {
        throw httpError(400, 'Statut invalide.');
      }

      filters.push('p.status = :status');
      params.status = status;
    }

    const where = filters.length ? `WHERE ${filters.join(' AND ')}` : '';
    const [payments] = await pool.execute(
      `SELECT ${PAYMENT_FIELDS}
       FROM payments p
       LEFT JOIN users u ON u.id = p.submitted_by
       ${where}
       ORDER BY p.created_at DESC
       LIMIT 500`,
      params
    );

    res.json({ data: payments });
  })
);

router.post(
  '/',
  asyncHandler(async (req, res) => {
    const payload = readPaymentPayload(req.body);

    try {
      const [result] = await pool.execute(
        `INSERT INTO payments (provider, amount, currency, payer_phone, trans_id, note, submitted_by)
         VALUES (:provider, :amount, :currency, :payerPhone, :transId, :note, :submittedBy)`,
        {
          ...payload,
          submittedBy: req.user.id
        }
      );

      const [rows] = await pool.execute(
        `SELECT ${PAYMENT_FIELDS}
         FROM payments p
         LEFT JOIN users u ON u.id = p.submitted_by
         WHERE p.id = :id`,
        { id: result.insertId }
      );

      res.status(201).json({ data: rows[0] });
    } catch (error) {
      if (error.code === 'ER_DUP_ENTRY') {
        throw httpError(409, 'Ce TransID existe deja.');
      }

      throw error;
    }
  })
);

router.patch(
  '/:id/status',
  requireAdmin,
  asyncHandler(async (req, res) => {
    const id = Number.parseInt(req.params.id, 10);
    const status = String(req.body.status || '').trim();

    if (!Number.isInteger(id) || id <= 0) {
      throw httpError(400, 'Identifiant paiement invalide.');
    }

    if (!['pending', 'confirmed', 'rejected'].includes(status)) {
      throw httpError(400, 'Statut invalide.');
    }

    const [result] = await pool.execute(
      `UPDATE payments
       SET status = :status
       WHERE id = :id`,
      { id, status }
    );

    if (result.affectedRows === 0) {
      throw httpError(404, 'Paiement introuvable.');
    }

    const [rows] = await pool.execute(
      `SELECT ${PAYMENT_FIELDS}
       FROM payments p
       LEFT JOIN users u ON u.id = p.submitted_by
       WHERE p.id = :id`,
      { id }
    );

    res.json({ data: rows[0] });
  })
);

export default router;
