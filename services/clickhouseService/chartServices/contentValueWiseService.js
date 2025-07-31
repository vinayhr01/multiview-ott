const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp util

exports.getContentValueWise = async (startDate, endDate) => {

  try {
    // 1️⃣ Build unique cache key for this query
    const cacheKey = `contentValueWise_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Content Value Wise fetched successfully from Cache",
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ Add timestamp even when reading from cache
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT
        content_value,
        ROUND(SUM(value)/60) AS duration_in_mins,
        COUNT(DISTINCT CASE
          WHEN event_name = 'pb_end' THEN CONCAT(event_time, '_', u_id, '_', value)
        END) AS views,
        COUNT(DISTINCT u_id) AS viewers
      FROM 
        default.analytics_events
      WHERE 
        event_name IN ('pb_end')
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
        AND content_value NOT IN ('NA')
      GROUP BY 
        content_value
      ORDER BY 
        duration_in_mins DESC
      LIMIT 100;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    // 5️⃣ Cache the result with TTL (5 mins)
    const time = timestamp(); // ✅ Get timestamp once

    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
    return {
      success: true,
      message: "Content Value Wise fetched successfully",
      data: result,
      cached: false,
      cached_time: time // ✅ Include timestamp on fresh fetch
    };
  } catch (error) {
    console.error(`❌ Error fetching Content Value Wise:`, error);
    throw error;
  }
};
