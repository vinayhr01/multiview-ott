const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this

exports.getTop10Movies = async (startDate, endDate) => {
  

  try {
    // 🔑 Build unique cache key
    const cacheKey = `top10Movies_${startDate}_${endDate}`;
    const redis = await redisConnect();

    // 🔍 Try reading from Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return {
        success: true,
      message: "Top 10 Movies fetched successfully from Cache",
        data: parsed.data,
        cached: true,
        cached_time: parsed.cached_time,
      };
    }

    // 🧠 Query ClickHouse if not in cache
    const query = `
      SELECT 
        video_name AS video_name_26435e,
        COUNT(DISTINCT (event_time, u_id, value)) AS Views_ed4832
      FROM 
        default.analytics_events
      WHERE 
        content_type = 'movie'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        video_name
      ORDER BY 
        Views_ed4832 DESC
      LIMIT 10;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const time = timestamp();

    // 💾 Store in Redis with metadata
    await redis.set(
      cacheKey,
      JSON.stringify({
        success: true,
        data: result,
        cached: false,
        cached_time: time,
      }),
      'EX',
      300 // 5 minutes TTL
    );

    return {
      success: true,
      message: "Top 10 Movies fetched successfully",
      data: result,
      cached: false,
      cached_time: time,
    };
  } catch (error) {
    console.error("❌ Error fetching Top 10 Movies:", error);
    throw error;
  }
};
