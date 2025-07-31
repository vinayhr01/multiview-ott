const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this

exports.getTop10ShowsDuration = async (startDate, endDate) => {
  

  try {
    // 1️⃣ Build unique cache key
    const cacheKey = `top10ShowsDuration_${startDate}_${endDate}`;

    // 2️⃣ Connect to Redis
    const redis = await redisConnect();

    // 3️⃣ Check Redis cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return { 
        success: true,
        message: "Top 10 Shows Duration fetched successfully from Cache",
        data: JSON.parse(cachedData), 
        cached: true, 
        cached_time: timestamp() 
      };
    }

    // 4️⃣ If not cached, run ClickHouse query
    const query = `
      SELECT 
        show_name AS show_name_236d11,
        ROUND(SUM(value)/60) AS Duration_in_Mins_f3ba0d
      FROM 
        default.analytics_events
      WHERE 
        content_type IN ('episode')
        AND event_name IN ('pb_end')
        AND event_time >= toDateTime({startDate:String})
        AND event_time < toDateTime({endDate:String})
      GROUP BY 
        show_name
      ORDER BY 
        Duration_in_Mins_f3ba0d DESC
      LIMIT 10;
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    const time = timestamp();

    // 5️⃣ Store result in Redis with TTL (5 mins)
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return { 
      success: true,
      message: "Top 10 Shows Duration fetched successfully", 
      data: result, 
      cached: false, 
      cached_time: time 
    };

  } catch (error) {
    console.error(`❌ Error fetching Top 10 Shows Duration:`, error);
    throw error;
  }
};
