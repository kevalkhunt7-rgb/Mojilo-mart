import 'dotenv/config';
import dns from 'dns';
// Fixes DNS resolution issues for MongoDB Atlas SRV records in Windows environments
dns.setDefaultResultOrder('ipv4first');

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

// Connect Database
connectDB();

// Initialize Cloudinary
configureCloudinary();

// Create HTTP Server
const server = http.createServer(app);

// Initialize Socket.io
initSocket(server);

// Start Background Tasks / Cron Intervals
startPruningJobs();
startAbandonedCartPruningJob();
startReminderJob();
startStockAlertJob();

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  logger.info(`Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});