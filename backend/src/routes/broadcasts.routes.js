import { Router } from 'express';
import { pool } from '../config/db.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';
import { asyncHandler } from '../utils/asyncHandler.js';
import { httpError } from '../utils/httpError.js';
import { normalizePhoneForWhatsApp } from '../utils/communicationLinks.js';
import {
  buildBroadcastMessage,
  isWhatsAppCloudConfigured,
  sendBroadcastMessages
} from '../services/whatsappCloud.js';

const router = Router();

router.use(authenticate);
router.use(requireAdmin);

function normalizeIds(ids) {
  if (!Array.isArray(ids)) {
    return [];
  }

  return [...new Set(ids
    .map((id) => Number.parseInt(id, 10))
    .filter((id) => Number.isInteger(id) && id > 0))];
}

router.post(
  '/whatsapp',
  asyncHandler(async (req, res) => {
    const message = String(req.body.message || '').trim();
    const ids = normalizeIds(req.body.ids);

    if (!message) {
      throw httpError(400, 'Le message a envoyer est requis.');
    }

    if (!ids.length) {
      throw httpError(400, 'Aucun destinataire selectionne.');
    }

    if (!isWhatsAppCloudConfigured()) {
      throw httpError(503, "WhatsApp Cloud API n'est pas configuree. Ajoutez WHATSAPP_ACCESS_TOKEN et WHATSAPP_PHONE_NUMBER_ID dans Render.");
    }

    const placeholders = ids.map((_, index) => `:id${index}`).join(', ');
    const params = ids.reduce((accumulator, id, index) => {
      accumulator[`id${index}`] = id;
      return accumulator;
    }, {});

    const [rows] = await pool.execute(
      `SELECT id, nom, degre, poste, telephone
       FROM pastors
       WHERE id IN (${placeholders})
       ORDER BY nom ASC`,
      params
    );

    const recipients = rows
      .map((pastor) => ({
        id: pastor.id,
        nom: pastor.nom,
        whatsappPhone: normalizePhoneForWhatsApp(pastor.telephone),
        message: buildBroadcastMessage(pastor, message)
      }))
      .filter((pastor) => pastor.whatsappPhone);

    if (!recipients.length) {
      throw httpError(400, 'Aucun destinataire avec numero WhatsApp valide.');
    }

    const results = await sendBroadcastMessages(recipients);
    const sent = results.filter((result) => result.status === 'sent').length;
    const failed = results.filter((result) => result.status === 'failed').length;
    const skipped = ids.length - recipients.length;

    res.json({
      data: {
        total: ids.length,
        recipients: recipients.length,
        sent,
        failed,
        skipped,
        errors: results
          .filter((result) => result.status === 'failed')
          .slice(0, 10)
      }
    });
  })
);

export default router;
