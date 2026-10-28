const { Queue } = require("bullmq");
const redisConnection = require("../config/redis");

const emailQueue = new Queue("email", { connection: redisConnection });

async function queueRegistrationEmail(userEmail, name) {
  await emailQueue.add("registration", { userEmail, name });
}

async function queueTransactionEmail(userEmail, name, amount, toAccount) {
  await emailQueue.add("transaction-success", {
    userEmail,
    name,
    amount,
    toAccount,
  });
}

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
