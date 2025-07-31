const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.activeLast1HourService = async () => {
  try {
    // 1️⃣ Build a unique cache key
    const cacheKey = 'active_last_1_hour';

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Try to get from Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      parsed.message = 'Total active users in the last 1 hour (served from cache)';
      parsed.cached = true;
      return parsed;
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT COUNT(DISTINCT u_id) AS active_last_1_hour
      FROM default.analytics_events
      WHERE event_time >= now() - INTERVAL 1 HOUR
    `;

    const result = await queryClickHouse(query);
    const response = {
      success: true,
      data: result[0]?.active_last_1_hour || 0,      
      message: 'Total active users in the last 1 hour',
      cached: false,
      cached_time: timestamp()
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to fetch total active users in the last 1 hour',
      error: error.message
    };
  }
};
