const app = require('./src/app');
const { connectDB } = require('./src/config/sequelize');
const { setupModels } = require('./src/models');
const config = require('./src/config');

let server;

const startServer = async () => {
  try {
    // Connect to MySQL
    const sequelize = await connectDB();
    
    // Setup models and associations
    setupModels(sequelize);
    await sequelize.sync();
    console.log('Database schema verified');

    // Start Express Server
    server = app.listen(config.app.port, () => {
      console.log(`
╔════════════════════════════════════════╗
║  CBCA Pastor Management API            ║
║  Environment: ${config.app.env.padEnd(22)} ║
║  Port: ${config.app.port.toString().padEnd(26)} ║
║  Database: MySQL                        ║
╚════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
};

// Handle unhandled rejections
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Rejection:', err);
  process.exit(1);
});

process.on('SIGTERM', () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

process.on('SIGINT', () => {
  if (server) {
    server.close(() => process.exit(0));
  } else {
    process.exit(0);
  }
});

startServer();
