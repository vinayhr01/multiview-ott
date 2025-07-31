const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.activeService = async () => {
  try {
    const cacheKey = 'active_users_last_1_day';
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        data: JSON.parse(cachedData)?.active_users,
        message: 'Total active users in the last 5 days (served from cache)',
        cached: true,
        cached_time: timestamp()
      };
    }

    const query = `
      SELECT COUNT(DISTINCT u_id) AS active_users
      FROM default.analytics_events
      WHERE event_time >= now() - INTERVAL 5 DAYS
    `;

    const result = await queryClickHouse(query);

    const response = {
      success: true,
      data: result[0]?.active_users || 0,
      message: 'Total active users in the last 5 days',
      cached: false,
      cached_time: timestamp()
    };

    await redis.set(cacheKey, JSON.stringify(result[0]), 'EX', 300);

    return response;

  } catch (error) {
    console.error(error);
    return {
      success: false,
      message: 'Failed to fetch total active users in the last 5 days',
      error: error.message
    };
  }
};
