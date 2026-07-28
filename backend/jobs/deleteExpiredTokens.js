import RefreshToken from '../models/RefreshToken.js';
import EmailVerification from '../models/EmailVerification.js';
import PasswordReset from '../models/PasswordReset.js';
import logger from '../utils/logger.js';

export const cleanExpiredTokens = async () => {
  try {
    const now = new Date();
    
    const refreshResult = await RefreshToken.deleteMany({ expiresAt: { $lt: now } });
    const verifyResult = await EmailVerification.deleteMany({ expiresAt: { $lt: now } });
    const resetResult = await PasswordReset.deleteMany({ expiresAt: { $lt: now } });
    
    logger.info(`[JOB] Expired records pruned: ${refreshResult.deletedCount} refresh tokens, ${verifyResult.deletedCount} email verifications, ${resetResult.deletedCount} password resets.`);
  } catch (error) {
    logger.error('[JOB ERROR] Failed to clean expired records:', error);
  }
};

export const startPruningJobs = () => {
  // Run once every 24 hours
  setInterval(cleanExpiredTokens, 24 * 60 * 60 * 1000);
  logger.info('[JOB REGISTER] Token pruning job scheduled to run daily.');
};
