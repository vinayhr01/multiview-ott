const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.overallPaidService = async (startDate, endDate) => {
  try {
    const cacheKey = `overall_paid_users_${startDate}_to_${endDate}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      
      return {
        success: true,
        message: 'Overall paid users served from Redis cache',
        data: parseInt(parsed?.Active_users || 0),
        cached: true,
        cached_time: timestamp()
      };
    }

    const query = `
      SELECT 
        COUNT(DISTINCT u_id) AS Active_Users_553eda
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_start'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
        AND subscription_status IN ('active', 'Active')
      LIMIT 50000
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const count = parseInt(result[0]?.Active_users || 0);

    await redis.set(cacheKey, JSON.stringify(result[0]), 'EX', 300);
    

    return {
      success: true,
      message: 'Overall paid users fetched successfully',
      data: count,
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error('Something went wrong in overallPaidService:', error);
    return {
      success: false,
      message: `Something went wrong in overallPaidService: ${error}`
    };
  }
};
