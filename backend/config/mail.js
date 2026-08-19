import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import nodemailer from 'nodemailer';
import logger from '../utils/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Explicitly load .env from backend directory and CWD fallbacks
dotenv.config({ path: path.resolve(__dirname, '../.env') });
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
dotenv.config({ path: path.resolve(process.cwd(), 'backend/.env') });

const createTransporter = () => {
  const smtpUser = process.env.SMTP_USER ? process.env.SMTP_USER.trim() : '';
  const rawPass = process.env.SMTP_PASS || '';
  const smtpPass = rawPass.replace(/\s+/g, '');

  if (!smtpUser || !smtpPass) {
    logger.warn('⚠️ SMTP_USER or SMTP_PASS is missing in environment variables!');
  } else {
    logger.info(`📧 Initializing SMTP transporter for sender account: ${smtpUser}`);
    if ((process.env.SMTP_HOST || 'smtp.gmail.com').includes('gmail') && smtpPass.length !== 16) {
      logger.warn(`⚠️ Gmail App Password length is ${smtpPass.length} characters (Expected: 16 letters generated from https://myaccount.google.com/apppasswords). If authentication fails with 535-5.7.8, please generate a new 16-character App Password for '${smtpUser}'.`);
    }
  }

  const isSecure = process.env.SMTP_SECURE === 'true' || Number(process.env.SMTP_PORT) === 465;

  return nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: Number(process.env.SMTP_PORT) || 587,
    secure: isSecure,
    auth: {
      user: smtpUser,
      pass: smtpPass,
    },
    tls: {
      rejectUnauthorized: false,
    },
  });
};

const transporter = createTransporter();

try {
  await transporter.verify();
  logger.info(`✅ SMTP server connected successfully using ${process.env.SMTP_USER || 'configured user'}.`);
} catch (error) {
  logger.error('❌ SMTP verification failed:', error.message);
}

export default transporter;