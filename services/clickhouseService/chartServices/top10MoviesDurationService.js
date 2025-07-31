const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this

exports.getTop10MoviesDuration = async (startDate, endDate) => {

  try {
    // 1️⃣ Build unique cache key
    const cacheKey = `top10MoviesDuration_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Top 10 Movies Duration fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ Timestamp when served from cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        video_name AS video_name_26435e,
        ROUND(SUM(value)/60) AS Duration_in_Mins_f3ba0d
      FROM 
        default.analytics_events
      WHERE 
        content_type IN ('movie')
        AND event_name IN ('pb_end')
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        video_name
      ORDER BY 
        Duration_in_Mins_f3ba0d DESC
      LIMIT 10;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Store result in Redis with TTL (5 mins)
    const time = timestamp(); // ✅ Timestamp for fresh data
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Top 10 Movies Duration fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Timestamp when freshly fetched
    };

  } catch (error) {
    console.error(`❌ Error fetching Top 10 Movies Duration:`, error);
    throw error;
  }
};
