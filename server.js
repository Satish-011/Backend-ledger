require("dotenv").config();
const mongoose = require("mongoose");
const app = require("./app");
const logger = require("./utils/logger");

const PORT = process.env.PORT || 3000;

mongoose
  .connect(process.env.MONGO_URL)
  .then(() => logger.info("MongoDB Database connected successfully!"))
  .catch((error) => logger.error("MongoDB connection error:", error));

app.listen(PORT, () => {
  logger.info(`Server is running on port ${PORT}`);
});
