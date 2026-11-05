// utils/emailQueue.js
const { Queue, Worker } = require('bullmq');
const sendEmail = require('./mailer'); // Aapka purana mailer logic
const redis = require('./redisClient');

// 1. Queue Banana (Jobs add karne ke liye)
const emailQueue = new Queue('email-queue', { connection: redis });

// 2. Worker Banana (Background mein queue se jobs uthakar execute karne ke liye)
const emailWorker = new Worker('email-queue', async (job) => {
    console.log(`[Queue] Processing email job for: ${job.data.email}`);
    // sendEmail wahi function hai jo humne pehle mailer.js mein banaya tha
    await sendEmail(job.data);
}, { connection: redis });

emailWorker.on('completed', (job) => {
    console.log(`[Queue] Job ${job.id} completed! Email sent.`);
});

emailWorker.on('failed', (job, err) => {
    console.error(`[Queue] Job ${job.id} failed:`, err.message);
});

module.exports = emailQueue;