const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp util

exports.getGenreWiseCompletion = async (startDate, endDate) => {
  try {
    // 1️⃣ Build unique cache key
    const cacheKey = `genreWiseCompletion_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
      message: "Genre wise Completion fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ From cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        genre,
        COUNT(DISTINCT CASE
          WHEN event_name = 'pb_end' THEN CONCAT(event_time, '_', u_id, '_', value)
        END) AS views
      FROM 
        default.analytics_events
      WHERE 
        content_type NOT IN ('live_tv', 'livetv')
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        genre
      ORDER BY 
        views DESC
      LIMIT 100;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Store in Redis with TTL (5 mins)
    const time = timestamp(); // ✅ Generate time once
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Genre wise Completion fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Fresh data
    };

  } catch (error) {
    console.error(`❌ Error fetching Genre Wise Completion:`, error);
    throw error;
  }
};
