const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.totalActiveUsersService = async (startDate, endDate) => {
  try {
    const cacheKey = `total_active_users_${startDate}_to_${endDate}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: `Data fetched successfully for Total Active Users from ${startDate} to ${endDate} from cache`,
        data: JSON.parse(cachedData).data,
        cached: true,
        cached_time: JSON.parse(cachedData).cached_time
      };
    }

    const query = `
      SELECT 
        COUNT(DISTINCT u_id) AS total_active_users
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND toDate(event_time) >= toDateTime({startDate:String})
        AND toDate(event_time) <= toDateTime({endDate:String})
      LIMIT 5000
    `;
    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    const response = {
      success: true,
      message: `Data fetched successfully for Total Active Users from ${startDate} to ${endDate}`,
      data: result[0].total_active_users,
      cached: false,
      cached_time: timestamp()
    };

    await redis.set(cacheKey, JSON.stringify(response), 'EX', 300);
    

    return response;

  } catch (error) {
    console.error(error);
    throw error;
  }
};
