import path from 'node:path';
import { fileURLToPath } from 'node:url';
import QRCode from 'qrcode';
import whatsappWeb from 'whatsapp-web.js';
import { env } from '../config/env.js';

const { Client, LocalAuth } = whatsappWeb;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const authRoot = env.whatsapp.webAuthPath
  ? path.resolve(env.whatsapp.webAuthPath)
  : path.resolve(__dirname, '../../.wwebjs_auth');

let client = null;
let initializing = false;
let status = 'disconnected';
let qrCode = '';
let qrDataUrl = '';
let qrUpdatedAt = null;
let readyAt = null;
let failureMessage = '';
let clientInfo = null;

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setStatus(nextStatus) {
  status = nextStatus;
  if (nextStatus !== 'qr') {
    qrCode = '';
    qrDataUrl = '';
    qrUpdatedAt = null;
  }
}

export function buildBroadcastMessage(pastor, message) {
  const fonction = pastor.degre || 'Serviteur';
  const intro = `Bonjour ${fonction} ${pastor.nom}, nous vous saluons au nom du Tout-Puissant.`;
  const body = String(message || '').trim();
  return body ? `${intro}\n${body}` : intro;
}

export function getWhatsAppWebStatus() {
  return {
    status,
    isReady: status === 'ready',
    qrCode,
    qrDataUrl,
    qrUpdatedAt,
    readyAt,
    failureMessage,
    clientInfo,
    authPath: authRoot
  };
}

export function initializeWhatsAppWeb() {
  if (client || initializing) {
    return;
  }

  initializing = true;
  failureMessage = '';
  setStatus('loading');

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'cbca-annuaire',
      dataPath: authRoot
    }),
    puppeteer: {
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage'
      ]
    }
  });

  client.on('qr', async (qr) => {
    qrCode = qr;
    qrUpdatedAt = new Date().toISOString();
    status = 'qr';
    failureMessage = '';
    try {
      qrDataUrl = await QRCode.toDataURL(qr, {
        errorCorrectionLevel: 'M',
        margin: 1,
        width: 280
      });
    } catch (error) {
      qrDataUrl = '';
      failureMessage = error.message;
    }
  });

  client.on('authenticated', () => {
    setStatus('authenticated');
    failureMessage = '';
  });

  client.on('ready', () => {
    setStatus('ready');
    readyAt = new Date().toISOString();
    failureMessage = '';
    clientInfo = client.info
      ? {
          pushname: client.info.pushname || '',
          wid: client.info.wid?._serialized || client.info.wid?.user || ''
        }
      : null;
  });

  client.on('auth_failure', (message) => {
    setStatus('auth_failure');
    failureMessage = message || 'Echec authentification WhatsApp.';
  });

  client.on('disconnected', (reason) => {
    setStatus('disconnected');
    failureMessage = reason || '';
    readyAt = null;
    clientInfo = null;
    client = null;
    initializing = false;
    initializeWhatsAppWeb();
  });

  client.initialize()
    .catch((error) => {
      setStatus('failed');
      failureMessage = error.message;
      client = null;
    })
    .finally(() => {
      initializing = false;
    });
}

export async function restartWhatsAppWeb() {
  const currentClient = client;
  client = null;
  initializing = false;
  readyAt = null;
  clientInfo = null;
  failureMessage = '';
  setStatus('loading');

  if (currentClient) {
    await currentClient.destroy().catch(() => {});
  }

  initializeWhatsAppWeb();
  return getWhatsAppWebStatus();
}

async function sendTextMessage({ to, body }) {
  if (!client || status !== 'ready') {
    throw new Error("WhatsApp Web n'est pas connecte. Scannez le QR code avant l'envoi.");
  }

  const registeredNumber = await client.getNumberId(to);
  if (!registeredNumber) {
    throw new Error('Numero non inscrit sur WhatsApp.');
  }

  const message = await client.sendMessage(registeredNumber._serialized, body);
  return message;
}

export async function sendBroadcastMessages(recipients) {
  initializeWhatsAppWeb();

  if (status !== 'ready') {
    throw new Error("WhatsApp Web n'est pas encore pret. Scannez le QR code et attendez le statut connecte.");
  }

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
          providerId: result.value.id?._serialized || null
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
