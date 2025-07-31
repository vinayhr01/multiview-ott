const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.totalWatchTimeService = async (startDate, endDate) => {
  try {
    const cacheKey = `total_watch_time_${startDate}_to_${endDate}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: `Data fetched successfully for Total Watch Time from ${startDate} to ${endDate} from cache`,
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp(),
      };
    }

    const query = `
      SELECT 
        sum(value)/60 AS Total_Watch_Time_in_Mins_cca0e1
      FROM 
        default.analytics_events
      WHERE 
        event_name = 'pb_end'
        AND toDate(event_time) >= toDateTime({startDate:String})
        AND toDate(event_time) <= toDateTime({endDate:String})
      LIMIT 50000;
    `;
    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const data = result?.[0]?.Total_Watch_Time_in_Mins_cca0e1 || 0;

    await redis.set(cacheKey, JSON.stringify(data), 'EX', 300);

    return {
      success: true,
      message: `Data fetched successfully for Total Watch Time from ${startDate} to ${endDate}`,
      data: data,
      cached: false,
      cached_time: timestamp(),
    };
  } catch (error) {
    console.error('Error in totalWatchTimeService:', error);
    throw error;
  }
};
