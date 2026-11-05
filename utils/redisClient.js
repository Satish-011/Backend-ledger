// utils/redisClient.js
const { Redis } = require('ioredis');

// Default options (localhost:6379 par connect karega)
const redis = new Redis({
    host: '127.0.0.1',
    port: 6379,
    maxRetriesPerRequest: null // BullMQ ke liye ye zaroori hai
});

redis.on('connect', () => console.log('Redis connected successfully!'));
redis.on('error', (err) => console.error('Redis connection error:', err));

module.exports = redis;