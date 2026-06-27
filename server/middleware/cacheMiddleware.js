import { redisClient } from '../config/redis.js';

export const cacheMiddleware = (ttlSeconds = 3600) => {
  return async (req, res, next) => {
    // Only cache GET requests
    if (req.method !== 'GET') {
      return next();
    }

    if (!redisClient || !redisClient.isOpen) {
      return next(); // Bypass if Redis is not connected
    }

    const key = `cache:${req.originalUrl}`;

    try {
      const cachedData = await redisClient.get(key);
      if (cachedData) {
        console.log(`[Redis] Cache Hit: ${key}`);
        return res.json(JSON.parse(cachedData));
      }

      console.log(`[Redis] Cache Miss: ${key}`);
      
      // Override res.json to intercept and cache the response
      const originalJson = res.json.bind(res);
      res.json = (body) => {
        // Only cache successful responses
        if (res.statusCode >= 200 && res.statusCode < 300) {
          redisClient.setEx(key, ttlSeconds, JSON.stringify(body)).catch(err => {
            console.error('[Redis] Cache Write Error:', err);
          });
        }
        return originalJson(body);
      };

      next();
    } catch (err) {
      console.error('[Redis] Cache Middleware Error:', err);
      next(); // Fallback to DB on error
    }
  };
};

export const clearCache = async (pattern) => {
  if (!redisClient || !redisClient.isOpen) return;
  try {
    const keys = await redisClient.keys(`cache:${pattern}`);
    if (keys.length > 0) {
      await redisClient.del(keys);
      console.log(`[Redis] Cleared cache for pattern: ${pattern}`);
    }
  } catch (err) {
    console.error('[Redis] Clear Cache Error:', err);
  }
};
