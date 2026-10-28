const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const emailQueue = new Queue("email", { connection: redisConnection });

/**
 * Add a registration welcome email to the queue.
 */
async function queueRegistrationEmail(userEmail, name) {
  await emailQueue.add("registration", { userEmail, name });
}

/**
 * Add a transaction success email to the queue.
 */
async function queueTransactionEmail(userEmail, name, amount, toAccount) {
  await emailQueue.add("transaction-success", {
    userEmail,
    name,
    amount,
    toAccount,
  });
}

/**
 * Add a transaction failed email to the queue.
 */
async function queueTransactionFailedEmail(userEmail, name, amount, toAccount) {
  await emailQueue.add("transaction-failed", {
    userEmail,
    name,
    amount,
    toAccount,
  });
}

module.exports = {
  emailQueue,
  queueRegistrationEmail,
  queueTransactionEmail,
  queueTransactionFailedEmail,
};

