import { env } from '../config/env.js';

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export function isWhatsAppCloudConfigured() {
  return Boolean(env.whatsapp.accessToken && env.whatsapp.phoneNumberId);
}

async function sendTextMessage({ to, body }) {
  const response = await fetch(
    `https://graph.facebook.com/${env.whatsapp.graphVersion}/${env.whatsapp.phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${env.whatsapp.accessToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: {
          preview_url: false,
          body
        }
      })
    }
  );

  const payload = await response.json().catch(() => ({}));

  if (!response.ok) {
    const message = payload.error?.message || payload.message || `Erreur WhatsApp API ${response.status}`;
    const error = new Error(message);
    error.status = response.status;
    error.payload = payload;
    throw error;
  }

  return payload;
}

export async function sendBroadcastMessages(recipients) {
  const batchSize = Math.max(1, Math.min(env.whatsapp.batchSize || 10, 50));
  const batchDelayMs = Math.max(0, env.whatsapp.batchDelayMs || 0);
  const results = [];

  for (let index = 0; index < recipients.length; index += batchSize) {
    const batch = recipients.slice(index, index + batchSize);
    const settled = await Promise.allSettled(
      batch.map((recipient) => sendTextMessage({
        to: recipient.whatsappPhone,
        body: recipient.message
      }))
    );

    settled.forEach((result, resultIndex) => {
      const recipient = batch[resultIndex];
      if (result.status === 'fulfilled') {
        results.push({
          id: recipient.id,
          nom: recipient.nom,
          phone: recipient.whatsappPhone,
          status: 'sent',
          providerId: result.value.messages?.[0]?.id || null
        });
      } else {
        results.push({
          id: recipient.id,
          nom: recipient.nom,
          phone: recipient.whatsappPhone,
          status: 'failed',
          error: result.reason?.message || 'Erreur inconnue'
        });
      }
    });

    if (index + batchSize < recipients.length && batchDelayMs > 0) {
      await sleep(batchDelayMs);
    }
  }

  return results;
}
