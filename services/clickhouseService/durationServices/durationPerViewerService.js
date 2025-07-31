const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.durationPerViewerService = async (startDate, endDate, filters) => {
  try {
    const allowedColumns = [
      'country',
      'platform',
      'source',
      'content_type',
      'genre',
      'show_name',
      'video_name'
    ];

    const filtersKeyPart = filters && Array.isArray(filters)
      ? filters.map(f =>
          `${f.col}_${f.op}_${Array.isArray(f.val) ? f.val.join('-') : f.val}`
        ).join('_')
      : 'nofilters';

    const cacheKey = `duration_per_viewer_${startDate}_${endDate}_${filtersKeyPart}`;

    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const parsedData = JSON.parse(cachedData);
      return {
        success: true,
        message: `Data fetched successfully for duration per viewer from cache`,
        data: parsedData.data,
        cached: true,
        cached_time: parsedData.cached_time
      };
    }

    let whereConditions = [
      `event_name = 'pb_end'`,
      `toDate(event_time) >= toDateTime({startDate:String})`,
      `toDate(event_time) <= toDateTime({endDate:String})`
    ];

    if (filters && Array.isArray(filters) && filters.length > 0) {
      filters.forEach(filter => {
        const { col, op, val } = filter;
        if (!allowedColumns.includes(col)) {
          throw new Error(`❌ Invalid filter column: ${col}`);
        }
        if (op === 'IN' && Array.isArray(val)) {
          const formattedVals = val.map(v => `'${v}'`).join(', ');
          whereConditions.push(`${col} IN (${formattedVals})`);
        } else if (op === '=') {
          whereConditions.push(`${col} = '${val}'`);
        } else if (op === 'LIKE') {
          whereConditions.push(`${col} LIKE '%${val}%'`);
        } else {
          throw new Error(`❌ Unsupported operator: ${op}`);
        }
      });
    }

    const whereClause = `WHERE ${whereConditions.join(' AND ')}`;

    const query = `
      WITH viewer_counts AS (
        SELECT 
          COUNT(DISTINCT u_id) AS unique_viewers,
          SUM(toUInt32(abs(event_time_new - event_time))) AS total_duration_seconds
        FROM analytics_events
        ${whereClause}
      )
      SELECT
        ROUND(
          if(unique_viewers = 0, 0, total_duration_seconds / 60 / unique_viewers), 
          2
        ) AS duration_per_viewer_in_mins
      FROM viewer_counts
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const value = result[0]?.duration_per_viewer_in_mins || 0;
    const currentTime = timestamp();

    const responseToCache = {
      data: value,
      cached_time: currentTime
    };

    await redis.set(cacheKey, JSON.stringify(responseToCache), 'EX', 300);

    return {
      success: true,
      message: `Data fetched successfully for duration per viewer`,
      data: value,
      cached: false,
      cached_time: currentTime
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};
