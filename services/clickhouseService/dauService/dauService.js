const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.dauService = async (startDate, endDate, platform) => {
  try {
    // 1️⃣ Build the platform filter
    let platformFilter = ``;
    switch (platform) {
      case "android_mobile":
        platformFilter = `AND platform = 'android_mobile'`;
        break;
      case "ios":
        platformFilter = `AND platform = 'ios'`;
        break;
      case "web":
        platformFilter = `AND platform = 'web'`;
        break;
      case "mweb":
        platformFilter = `AND platform = 'mweb'`;
        break;
      case "tv":
        platformFilter = `AND platform NOT IN ('android_mobile', 'ios', 'web', 'mweb')`;
        break;
      default:
        platformFilter = ``;
    }

    // 2️⃣ Define actual platform name in response
    const platformName = platform || "all";

    // 3️⃣ Build cache key
    const cacheKey = `dau_${platform}_${startDate}_${endDate}`;

    // 4️⃣ Try to get from Redis
    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return {
        success: true,
        message: `Data fetched successfully for platform ${platformName} from cache`,
        data: parsed.data,
        platform: parsed.platform,
        cached: true,
        cached_time: timestamp()
      };
    }

    // 5️⃣ Query from ClickHouse
    const query = `
      WITH dau AS (
        SELECT 
          toDate(event_time) AS day,
          COUNT(DISTINCT u_id) AS daily_count
        FROM analytics_events
        WHERE toDate(event_time) >= toDateTime({startDate:String}) 
          AND toDate(event_time) <= toDateTime({endDate:String})
          ${platformFilter}
        GROUP BY day
      )
      SELECT 
        SUM(daily_count) / COUNT(DISTINCT day) AS data
      FROM dau
    `;

    const params = { startDate, endDate };
    const response = await queryClickHouse(query, params);
    const result = {
      data: response[0].data,
      platform: platformName
    };

    // 6️⃣ Cache the result for 5 minutes
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: `Data fetched successfully for platform ${result.platform}`,
      data: result.data,
      platform: result.platform,
      cached: false,
      cached_time: timestamp()
    };


  } catch (error) {
    console.error(error);
    throw error;
  }
};
