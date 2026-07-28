import jwt from 'jsonwebtoken';

/**
 * Generates an Access Token (short-lived)
 * @param {String} userId 
 * @returns {String}
 */
export const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId }, 
    process.env.JWT_SECRET || 'jwt_access_secret_key', 
    { expiresIn: process.env.JWT_ACCESS_EXPIRE || '15m' }
  );
};

/**
 * Generates a Refresh Token (long-lived)
 * @param {String} userId 
 * @returns {String}
 */
export const generateRefreshToken = (userId) => {
  return jwt.sign(
    { id: userId, salt: Math.random().toString(36).substring(2) + Date.now() }, 
    process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key', 
    { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
  );
};
