import { createClient } from 'redis';
import { env } from './env.js';

let redisClient;

const initRedis = async () => {
  try {
    redisClient = createClient({
      url: env.REDIS_URL || 'redis://localhost:6379',
      socket: {
        reconnectStrategy: (retries) => {
          if (retries > 3) {
            console.warn('[Redis] Max retries reached. Running in cache-bypass mode.');
            return new Error('Max retries reached'); // Stop retrying
          }
          return Math.min(retries * 100, 3000);
        }
      }
    });

    redisClient.on('error', (err) => {
      // Only log the first few errors to avoid console spam
      if (err.message !== 'Max retries reached') {
        console.warn('[Redis] Connection Warning:', err.message);
      }
    });

    redisClient.on('connect', () => {
      console.log('[Redis] Connected successfully');
    });

    await redisClient.connect();
  } catch (err) {
    console.warn('[Redis] Failed to initialize:', err.message);
  }
};

export { redisClient, initRedis };
