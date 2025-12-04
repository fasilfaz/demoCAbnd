/*
  server.js - start a persistent server (for local / non-serverless deployments)
  The Express `app` (middleware + routes) lives in `src/app.js` so it can be
  reused by serverless platforms like Vercel which import the app directly.
*/

const { config } = require('dotenv');
config();

const { logger } = require('./utils/logger');
const { connectDB } = require('./config/db');
const cronService = require('./services/cronService');
const websocketService = require('./utils/websocket');
const seedSuperAdmin = require('./utils/seedSuperAdmin').seedSuperAdmin;

// Import the Express app (no listening, no cron, no websockets)
const app = require('./app');

// Start server (only for persistent runtimes)
const PORT = process.env.PORT || 5001;
const server = app.listen(PORT, async () => {
    logger.info(`Server running on port ${PORT}`);
    console.log(`Server running on port ${PORT}`);

    try {
        await connectDB();
        logger.info('Database connected successfully');

        console.log('🔍 Checking for superadmin...');
        await seedSuperAdmin();
        console.log('✅ Superadmin check completed');

        // Initialize cron service for persistent server
        try {
            await cronService.init();
            logger.info('Cron service initialized successfully');
        } catch (err) {
            logger.error('Failed to initialize cron service:', err);
        }

        // Initialize WebSocket server (only when running a persistent server)
        try {
            websocketService.init(server);
            logger.info('WebSocket initialized');
        } catch (err) {
            logger.error('Failed to initialize websocket:', err);
        }

    } catch (error) {
        logger.error('Failed to initialize server:', error);
        console.error('❌ Server initialization failed:', error.message);
        process.exit(1);
    }
});

// Handle unhandled promise rejections
process.on('unhandledRejection', (err) => {
    logger.error(`Error: ${err?.message || err}`);
    // Close server & exit process
    try {
        server.close(() => process.exit(1));
    } catch (e) {
        process.exit(1);
    }
});

module.exports = { server };