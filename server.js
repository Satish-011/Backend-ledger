const dotenv = require("dotenv");
dotenv.config();

const app = require("./src/app");
const connectDB = require("./src/config/db");
const logger = require("./src/config/logger");

// Start the email worker (processes queued emails in the background)
require("./src/queues/email.worker");

const port = process.env.PORT || 3000;

const startServer = async () => {
  try {
    await connectDB();
    app.listen(port, () => {
      logger.info(`Server is running on port ${port}`);
    });
  } catch (error) {
    logger.error("Error starting the server:", error);
  }
};

startServer();
