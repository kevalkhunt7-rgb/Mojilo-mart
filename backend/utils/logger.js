import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const logDir = path.join(__dirname, '..', 'logs');

if (!fs.existsSync(logDir)) {
  fs.mkdirSync(logDir, { recursive: true });
}

const writeLog = (level, message, obj = '') => {
  const timestamp = new Date().toISOString();
  const stringifiedObj = obj ? ` | ${JSON.stringify(obj)}` : '';
  const logMessage = `[${timestamp}] [${level.toUpperCase()}]: ${message}${stringifiedObj}\n`;

  // Write to console
  if (level === 'error') {
    console.error(`\x1b[31m${logMessage}\x1b[0m`);
  } else if (level === 'warn') {
    console.warn(`\x1b[33m${logMessage}\x1b[0m`);
  } else {
    console.log(`\x1b[32m${logMessage}\x1b[0m`);
  }

  // Write to files
  try {
    fs.appendFileSync(path.join(logDir, 'combined.log'), logMessage);
    if (level === 'error') {
      fs.appendFileSync(path.join(logDir, 'error.log'), logMessage);
    }
  } catch (err) {
    console.error('Failed to write to log file:', err);
  }
};

const logger = {
  info: (message, obj) => writeLog('info', message, obj),
  warn: (message, obj) => writeLog('warn', message, obj),
  error: (message, obj) => writeLog('error', message, obj),
  debug: (message, obj) => writeLog('debug', message, obj),
};

export default logger;
