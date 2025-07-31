const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Ensure this exists

exports.freeUserMinService = async (startDate, endDate) => {
  try {
    // 1️⃣ Build a dynamic cache key
    const cacheKey = `free_user_min_${startDate}_to_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Try to get from Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      
      return {
        success: true,
        message: 'Free user minutes served from Redis cache',
        data: parseInt(JSON.parse(cachedData)?.Duration || 0),
        cached: true,
        cached_time: timestamp()
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        round(SUM(value) / 60) AS Duration_in_Mins_f3ba0d
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
        AND subscription_status NOT IN ('active', 'Active')
      LIMIT 50000
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const duration = parseInt(result[0]?.Duration || 0);

    // 5️⃣ Store in Redis with TTL (5 mins)
    await redis.set(cacheKey, JSON.stringify({ Duration: duration }), 'EX', 300);

    
    return {
      success: true,
      message: 'Free user minutes fetched successfully',
      data: duration,
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error('❌ Error in freeUserMinService:', error);
    return {
      success: false,
      message: `Something went wrong in freeuserMin: ${error}`,
    };
  }
};
