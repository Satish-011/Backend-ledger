const Redis = require("ioredis");
const logger = require("./logger");

const redisConnection = new Redis({
  host: process.env.REDIS_HOST || "127.0.0.1",
  port: parseInt(process.env.REDIS_PORT) || 6379,
  maxRetriesPerRequest: null, // Required by BullMQ
});

redisConnection.on("connect", () => {
  logger.info("Connected to Redis");
});

redisConnection.on("error", (err) => {
  logger.error(`Redis connection error: ${err.message}`);
});

module.exports = redisConnection;
