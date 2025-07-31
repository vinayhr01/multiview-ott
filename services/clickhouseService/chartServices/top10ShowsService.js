const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect'); // ✅ Add this!
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp utility

exports.getTop10Shows = async (startDate, endDate) => {

  try {
    // 1️⃣ Build a unique cache key
    const cacheKey = `top10Shows_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
      message: "Top 10 Shows fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // current timestamp
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        show_name AS show_name_236d11,
        COUNT(DISTINCT (event_time, u_id, value)) AS Video_Plays_423e42
      FROM 
        default.analytics_events
      WHERE 
        content_type = 'episode'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        show_name
      ORDER BY 
        Video_Plays_423e42 DESC
      LIMIT 10;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Store result in Redis with TTL (5 mins)
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Top 10 Shows fetched successfully",
      data: result,
      cached: false,
      cached_time: timestamp() // current timestamp
    };

  } catch (error) {
    console.error(`❌ Error fetching Top 10 Shows:`, error);
    return {
      success: false,
      message: 'Failed to fetch Top 10 Shows',
      error: error.message
    };
  }
};
