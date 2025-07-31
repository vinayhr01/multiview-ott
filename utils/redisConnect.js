const redis = require("../config/redis.config");

exports.redisConnect = async () => {
  try {
    if (!redis.status || redis.status !== "ready") {
      await redis.connect();
      console.log("Connected to Redis");
    }
    return redis;
  } catch (err) {
    console.error("Redis connection error", err);
    throw err;
  }
};