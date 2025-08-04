const mongoose = require('mongoose');
const logger = require('../utils/logger');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    logger('MongoDB connected');
  } catch (error) {
    logger('MongoDB connection error', error);
    process.exit(1);
  }
};

module.exports = connectDB;
