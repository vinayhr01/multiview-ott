const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.activeLast6HoursService = async () => {
  try {
    // 1️⃣ Build a unique cache key
    const cacheKey = 'active_last_6_hours';

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Try to get from Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      parsed.message = 'Total active users in the last 6 hours (served from cache)';
      parsed.cached = true;
      return parsed;
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT COUNT(DISTINCT u_id) AS active_last_6_hours
      FROM default.analytics_events
      WHERE event_time >= now() - INTERVAL 6 HOURS
    `;

    const result = await queryClickHouse(query);

    // 5️⃣ Store in Redis with TTL (e.g., 5 mins)
    const response = {
      success: true,
      data: result[0]?.active_last_6_hours || 0,      
      message: 'Total active users in the last 6 hours',
      cached: false,
      cached_time: timestamp()
    };


    await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);

    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to fetch total active users in the last 6 hours',
      error: error.message
    };
  }
};
