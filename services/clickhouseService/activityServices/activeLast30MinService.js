const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.activeLast30MinService = async () => {
  try {
    const cacheKey = 'active_last_30_min';
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      parsed.cached = true;
      parsed.message = 'Total active users in the last 30 minutes (served from cache)';
      return parsed;
    }

    const query = `
      SELECT COUNT(DISTINCT u_id) AS active_last_30_min
      FROM default.analytics_events
      WHERE event_time >= now() - INTERVAL 30 MINUTES
    `;

    const result = await queryClickHouse(query);
    const count = result[0]?.active_last_30_min || 0;

    const response = {
      success: true,
      data: count,
      message: 'Total active users in the last 30 minutes',
      cached: false,
      cached_time: timestamp()
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);
    return response;
  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to fetch total active users in the last 30 mins',
      error: error.message
    };
  }
};

