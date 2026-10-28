const { Worker } = require("bullmq");
const redisConnection = require("../config/redis");
const emailService = require("../services/email.service");
const logger = require("../config/logger");

const emailWorker = new Worker(
  "email",
  async (job) => {
    const { userEmail, name, amount, toAccount } = job.data;

    switch (job.name) {
      case "registration":
        await emailService.sendRegistrationEmail(userEmail, name);
        break;
      case "transaction-success":
        await emailService.sendTransactionEmail(userEmail, name, amount, toAccount);
        break;
      case "transaction-failed":
        await emailService.sendTransactionFailedEmail(userEmail, name, amount, toAccount);
        break;
      default:
        logger.warn(`Unknown email job type: ${job.name}`);
    }
  },
  {
    connection: redisConnection,
    concurrency: 5,
    removeOnComplete: { count: 100 },
    removeOnFail: { count: 50 },
  },
);

emailWorker.on("completed", (job) => {
  logger.info(`Email job ${job.id} (${job.name}) completed`);
});

emailWorker.on("failed", (job, err) => {
  logger.error(`Email job ${job.id} (${job.name}) failed: ${err.message}`);
});

module.exports = emailWorker;
