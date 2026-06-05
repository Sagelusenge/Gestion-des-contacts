import path from 'node:path';
import { fileURLToPath } from 'node:url';
import puppeteer from 'puppeteer';
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
let startupTimer = null;
let idleTimer = null;
let statusStartedAt = new Date().toISOString();

async function getBrowserExecutablePath() {
  if (env.whatsapp.browserExecutablePath) {
    return env.whatsapp.browserExecutablePath;
  }

  try {
    return await puppeteer.executablePath();
  } catch {
    return '';
  }
}

function clearStartupTimer() {
  if (startupTimer) {
    clearTimeout(startupTimer);
    startupTimer = null;
  }
}

function clearIdleTimer() {
  if (idleTimer) {
    clearTimeout(idleTimer);
    idleTimer = null;
  }
}

function scheduleIdleShutdown() {
  clearIdleTimer();
  idleTimer = setTimeout(() => {
    const idleClient = client;
    client = null;
    initializing = false;
    readyAt = null;
    clientInfo = null;
    setStatus('disconnected');
    idleClient?.destroy().catch(() => {});
  }, Math.max(10000, env.whatsapp.idleShutdownMs));
}

function sleep(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function setStatus(nextStatus) {
  status = nextStatus;
  statusStartedAt = new Date().toISOString();
  if (nextStatus !== 'qr') {
    qrCode = '';
    qrDataUrl = '';
    qrUpdatedAt = null;
  }
}

function markStartupTimeoutIfNeeded() {
  if (status !== 'loading' && status !== 'authenticated') {
    return;
  }

  const timeoutMs = Math.max(15000, env.whatsapp.startupTimeoutMs);
  const elapsedMs = Date.now() - new Date(statusStartedAt).getTime();

  if (elapsedMs < timeoutMs) {
    return;
  }

  const staleClient = client;
  clearStartupTimer();
  client = null;
  initializing = false;
  setStatus('failed');
  failureMessage = "WhatsApp Web n'a pas donne de QR code apres 60 secondes. Le serveur ne lance probablement pas Chromium/Chrome. Configurez Chrome sur Render ou utilisez une machine serveur avec navigateur disponible.";
  staleClient?.destroy().catch(() => {});
}

export function buildBroadcastMessage(pastor, message) {
  const fonction = pastor.degre || 'Serviteur';
  const intro = `Bonjour ${fonction} ${pastor.nom}, nous vous saluons au nom du Tout-Puissant.`;
  const body = String(message || '').trim();
  return body ? `${intro}\n${body}` : intro;
}

export function getWhatsAppWebStatus() {
  markStartupTimeoutIfNeeded();

  return {
    status,
    isReady: status === 'ready',
    qrCode,
    qrDataUrl,
    qrUpdatedAt,
    readyAt,
    statusStartedAt,
    failureMessage,
    clientInfo,
    authPath: authRoot
  };
}

export async function initializeWhatsAppWeb() {
  if (client || initializing) {
    return;
  }

  initializing = true;
  failureMessage = '';
  setStatus('loading');
  clearStartupTimer();
  clearIdleTimer();
  const browserExecutablePath = await getBrowserExecutablePath();

  client = new Client({
    authStrategy: new LocalAuth({
      clientId: 'cbca-annuaire',
      dataPath: authRoot
    }),
    puppeteer: {
      headless: true,
      ...(browserExecutablePath ? { executablePath: browserExecutablePath } : {}),
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--no-first-run'
      ]
    }
  });

  startupTimer = setTimeout(() => {
    if (status === 'loading' || status === 'authenticated') {
      const staleClient = client;
      client = null;
      initializing = false;
      setStatus('failed');
      failureMessage = "WhatsApp Web n'a pas donne de QR code apres 60 secondes. Le serveur ne lance probablement pas Chromium/Chrome. Configurez Chrome sur Render ou utilisez une machine serveur avec navigateur disponible.";
      staleClient?.destroy().catch(() => {});
    }
  }, Math.max(15000, env.whatsapp.startupTimeoutMs));

  client.on('qr', async (qr) => {
    clearStartupTimer();
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
    clearStartupTimer();
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
    clearStartupTimer();
    setStatus('auth_failure');
    failureMessage = message || 'Echec authentification WhatsApp.';
  });

  client.on('disconnected', (reason) => {
    clearStartupTimer();
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
      clearStartupTimer();
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
  clearStartupTimer();
  clearIdleTimer();
  client = null;
  initializing = false;
  readyAt = null;
  clientInfo = null;
  failureMessage = '';
  setStatus('loading');

  if (currentClient) {
    await currentClient.destroy().catch(() => {});
  }

  await initializeWhatsAppWeb();
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
  await initializeWhatsAppWeb();

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

  scheduleIdleShutdown();
  return results;
}
