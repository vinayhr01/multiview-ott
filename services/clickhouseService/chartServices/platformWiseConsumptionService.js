const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this

exports.getPlatformWiseConsumption = async (startDate, endDate) => {
  
  try {
    // 1️⃣ Build a unique cache key for this query
    const cacheKey = `platformWiseConsumption_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Platform Wise Completion fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ Timestamp when from cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        platform AS platform_34a6e5,
        COUNT(DISTINCT (event_time, u_id, value)) AS No_of_Video_Plays_dd56b7,
        COUNT(DISTINCT u_id) AS No_of_Viewers_d78bbf
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        platform
      ORDER BY 
        No_of_Video_Plays_dd56b7 DESC
      LIMIT 1000
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Store the result in Redis with TTL (5 mins)
    const time = timestamp(); // ✅ One timestamp for the fresh data
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Platform Wise Completion fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Timestamp when freshly fetched
    };

  } catch (error) {
    console.error(`❌ Error fetching Platform Wise Consumption:`, error);
    throw error;
  }
};
