const mongoose = require("mongoose");
const { logger } = require("../utils/logger");
const { autoAbsent, updateCasualLeaveCount, remindDuetask } = require("./cronJobs");
require("dotenv").config();

const connectDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    // Do NOT start cron jobs here. Cron jobs should be initialized
    // only by the persistent server process (see services/cronService.js).
    logger.info(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    logger.error(`Error connecting to MongoDB: ${error.message}`);
    console.error(`Error connecting to MongoDB: ${error.message}`);
    process.exit(1);
  }
};

module.exports = { connectDB };
