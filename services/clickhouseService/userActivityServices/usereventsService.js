const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");


exports.usereventsService = async ({ u_id, phone_number }) => {
  try {
    const cacheKey = `user_events_${u_id || phone_number}`;

    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
        
      return JSON.parse(cachedData);
    }

    let whereCondition = '';
    if (u_id) {
      whereCondition = `u_id = '${u_id}'`;
    } else if (phone_number) {
      whereCondition = `phone_number = '${phone_number}'`;
    }

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
      LIMIT 500
    `;

    const result = await queryClickHouse(query);

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    

    return result;

  } catch (error) {
    console.error(error);
    throw error;
  }
};
