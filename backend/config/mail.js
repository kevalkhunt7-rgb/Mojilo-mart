import 'dotenv/config';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: process.env.SMTP_SECURE === 'true', // false for port 587
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false, // Ignore self-signed certificate issues in TLS chain
  },
});

try {
  await transporter.verify();
  logger.info('✅ SMTP server connected successfully.');
} catch (error) {
  logger.error('❌ SMTP verification failed:', error.message);
}

export default transporter;