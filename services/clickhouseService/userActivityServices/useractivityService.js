const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");

exports.useractivityService = async ({ user_id, phone_number, page, pageSize }) => {
  try {
    // Build a unique cache key
    const cacheKey = `user_activity_${user_id || phone_number}_page_${page}_pageSize_${pageSize}`;

    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
        
      return JSON.parse(cachedData);
    }

    // Build dynamic WHERE clause
    let whereCondition = '';
    if (user_id) {
      whereCondition = `u_id = '${user_id}'`;
    } else if (phone_number) {
      whereCondition = `phone_number = '${phone_number}'`;
    }

    const offset = (page - 1) * pageSize;

    const query = `
      SELECT
        event_time,
        event_name,
        u_id,
        phone_number
      FROM
        default.analytics_events
      WHERE
        ${whereCondition}
      ORDER BY
        event_time DESC
      LIMIT ${pageSize} OFFSET ${offset}
    `;

    const result = await queryClickHouse(query);

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    

    return result;

  } catch (error) {
    console.error(error);
    throw error;
  }
};
