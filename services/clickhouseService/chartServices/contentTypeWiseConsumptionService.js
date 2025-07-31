const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp util

exports.getContentTypeWiseConsumption = async (startDate, endDate) => {

  try {
    // 1️⃣ Build a unique cache key
    const cacheKey = `contentTypeWiseConsumption_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Content Type Wise Consumption fetched from cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ Add timestamp when from cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT
        content_type AS content_type_eae05b,
        COUNT(DISTINCT (event_time, u_id, value)) AS No_of_video_plays_3c1642,
        COUNT(DISTINCT u_id) AS No_of_viewers_c13843
      FROM 
        default.analytics_events
      WHERE 
        content_type != 'NA'
        AND event_name = 'pb_end'
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
        AND content_type <> ''
      GROUP BY
        content_type
      ORDER BY 
        No_of_viewers_c13843 DESC
      LIMIT 1000
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Cache the result with TTL (5 mins)
    const time = timestamp(); // ✅ Timestamp once
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: "Content Type Wise Consumption fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Add timestamp when newly cached
    };

  } catch (error) {
    console.error(`❌ Error fetching Content Type Wise Consumption:`, error);
    throw error;
  }
};
