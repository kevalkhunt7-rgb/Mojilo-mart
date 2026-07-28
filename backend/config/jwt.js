export const jwtConfig = {
  secret: process.env.JWT_SECRET || 'jwt_access_secret_key',
  refreshSecret: process.env.JWT_REFRESH_SECRET || 'jwt_refresh_secret_key',
  accessExpiration: process.env.JWT_ACCESS_EXPIRE || '15m',
  refreshExpiration: process.env.JWT_REFRESH_EXPIRE || '7d',
  cookieOptions: {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days (matching refresh token expiration)
  }
};
