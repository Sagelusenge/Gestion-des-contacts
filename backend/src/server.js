import { app } from './app.js';
import { env } from './config/env.js';
import { pingDatabase } from './config/db.js';

async function startServer() {
  try {
    await pingDatabase();
    app.listen(env.port, () => {
      console.log(`API CBCA demarree sur http://localhost:${env.port}`);
    });
  } catch (error) {
    console.error('Impossible de demarrer le serveur:', error.message);
    process.exit(1);
  }
}

startServer();
