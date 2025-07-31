const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");

exports.userdataService = async ({ u_id, phone_number }) => {
  try {
    const cacheKey = `user_data_${u_id || phone_number}`;

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
        u_id,
        phone_number
      FROM
        default.analytics_events
      WHERE
        ${whereCondition}
      LIMIT 1
    `;

    const result = await queryClickHouse(query);

    await redis.set(cacheKey, JSON.stringify(result[0]), 'EX', 300);

    return result[0];

  } catch (error) {
    console.error(error);
    throw error;
  }
};
