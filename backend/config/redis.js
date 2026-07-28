import Redis from 'ioredis';
import logger from '../utils/logger.js';

const redisConfig = {
  host: process.env.REDIS_HOST || '127.0.0.1',
  port: parseInt(process.env.REDIS_PORT || '6379', 10),
  password: process.env.REDIS_PASSWORD || undefined,
  maxRetriesPerRequest: null, // REQUIRED for BullMQ
};

let redisConnection = null;

if (process.env.USE_REDIS === 'true') {
  try {
    redisConnection = new Redis(redisConfig);

    redisConnection.on('connect', () => {
      logger.info('Successfully connected to Redis broker');
    });

    redisConnection.on('error', (error) => {
      logger.error('Redis Broker Error:', error);
    });
  } catch (err) {
    logger.error('Failed to initialize Redis client:', err);
  }
} else {
  logger.info('Redis caching and queue features are DISABLED (USE_REDIS is not set to true)');
}

export { redisConfig, redisConnection };
export default redisConnection;
