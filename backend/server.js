import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });
import dns from 'dns';
dns.setServers([
  "8.8.8.8",
  "1.1.1.1"
]);

import http from 'http';
import app from './app.js';
import connectDB from './config/db.js';
import { configureCloudinary } from './config/cloudinary.js';
import { initSocket } from './socket/socket.js';
import { startPruningJobs } from './jobs/deleteExpiredTokens.js';
import { startAbandonedCartPruningJob } from './jobs/deleteGuestCart.js';
import { startReminderJob } from './jobs/sendReminderEmails.js';
import { startStockAlertJob } from './jobs/stockAlert.js';
import logger from './utils/logger.js';

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // Wait for MongoDB first
    await connectDB();

    configureCloudinary();

    const server = http.createServer(app);

    initSocket(server);

    startPruningJobs();
    startAbandonedCartPruningJob();
    startReminderJob();
    startStockAlertJob();

    server.listen(PORT, () => {
      logger.info(
        `Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`
      );
    });
  } catch (err) {
    logger.error('Failed to start server', err);
    process.exit(1);
  }
}

startServer();