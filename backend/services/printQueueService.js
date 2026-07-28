import { Queue, Worker } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import printRenderService from './printRenderService.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'print-generation';

// Initialize BullMQ Queue only if Redis is enabled
export const printQueue = process.env.USE_REDIS === 'true' && redisConnection
  ? new Queue(QUEUE_NAME, {
      connection: redisConnection,
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000 // 5 seconds initial delay
        },
        removeOnComplete: true,
        removeOnFail: false
      }
    })
  : null;

// Enqueue helper
export const enqueuePrintGeneration = async (orderId) => {
  if (!orderId) return;
  
  if (process.env.USE_REDIS === 'true' && printQueue) {
    logger.info(`Enqueuing print generation job for order (BullMQ): ${orderId}`);
    await printQueue.add('generate-print-files', { orderId }).catch(err => {
      logger.error(`Failed to enqueue job to BullMQ, falling back to local: ${err.message}`);
      fallbackLocalPrint(orderId);
    });
  } else {
    fallbackLocalPrint(orderId);
  }
};

const fallbackLocalPrint = (orderId) => {
  logger.info(`Processing print generation job for order (Local In-Memory Fallback): ${orderId}`);
  printRenderService.generateProductionFiles(orderId).catch(err => {
    logger.error(`Local print generation failed for Order ${orderId}: ${err.message}`, err);
  });
};

// Initialize BullMQ Worker only if Redis is enabled
const worker = process.env.USE_REDIS === 'true' && redisConnection
  ? new Worker(
      QUEUE_NAME,
      async (job) => {
        const { orderId } = job.data;
        logger.info(`Processing job ${job.id}: Generating prints for Order ${orderId}`);
        await printRenderService.generateProductionFiles(orderId);
      },
      {
        connection: redisConnection,
        concurrency: 1 // Single concurrency for CPU-intensive Sharp composites
      }
    )
  : null;

if (worker) {
  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`, err);
  });
}

export default {
  printQueue,
  enqueuePrintGeneration
};
