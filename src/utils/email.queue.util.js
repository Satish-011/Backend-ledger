const { Queue } = require("bullmq");

let emailQueue;

const getEmailQueue = () => {
  if (!emailQueue) {
    const redisConnection = require("../config/redis");
    emailQueue = new Queue("email", { connection: redisConnection });
  }

  return emailQueue;
};

async function queueRegistrationEmail(userEmail, name) {
  await getEmailQueue().add("registration", { userEmail, name });
}

async function queueTransactionEmail(userEmail, name, amount, toAccount) {
  await getEmailQueue().add("transaction-success", {
    userEmail,
    name,
    amount,
    toAccount,
  });
}

async function queueTransactionFailedEmail(userEmail, name, amount, toAccount) {
  await getEmailQueue().add("transaction-failed", {
    userEmail,
    name,
    amount,
    toAccount,
  });
}

module.exports = {
  queueRegistrationEmail,
  queueTransactionEmail,
  queueTransactionFailedEmail,
};
