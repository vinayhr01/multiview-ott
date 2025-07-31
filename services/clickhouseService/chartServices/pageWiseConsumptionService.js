const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this!

exports.getPageWiseConsumption = async (startDate, endDate) => {
  

  try {
    // 1️⃣ Build a unique cache key for this query
    const cacheKey = `pageWiseConsumption_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Page Wise Completion fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ From cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        source AS source_36cd38,
        COUNT(DISTINCT (event_time, u_id, value)) AS Video_Plays_423e42
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND source != 'share'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        source
      ORDER BY 
        Video_Plays_423e42 DESC
      LIMIT 1000;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Store the result in Redis with TTL (5 mins)
    const time = timestamp(); // ✅ Once only
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Page Wise Completion fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Fresh fetch
    };

  } catch (error) {
    console.error(`❌ Error fetching Page Wise Consumption:`, error);
    throw error;
  }
};
