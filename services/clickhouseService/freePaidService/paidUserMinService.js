const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.paidUserMinService = async (startDate, endDate) => {
  try {
    const cacheKey = `paid_user_min_${startDate}_to_${endDate}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      
      return {
        success: true,
        message: 'Paid user minutes served from Redis cache',
        data: parseInt(parsed?.Duration_in_Mins_f3ba0d || 0),
        cached: true,
        cached_time: timestamp()
      };
    }

    const query = `
      SELECT 
        round(SUM(value) / 60) AS Duration_in_Mins_f3ba0d
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
        AND subscription_status IN ('active', 'Active')
      LIMIT 50000
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const duration = parseInt(result[0]?.Duration_in_Mins_f3ba0d || 0);

    await redis.set(cacheKey, JSON.stringify(result[0]), 'EX', 300);
    

    return {
      success: true,
      message: 'Paid user minutes fetched successfully',
      data: duration,
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error('❌ Error in paidUserMinService:', error);
    return {
      success: false,
      message: `Something went wrong in Paid User Minutes service: ${error}`
    };
  }
};
