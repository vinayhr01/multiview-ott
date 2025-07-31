const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.durationInMinsService = async (startDate, endDate, filters) => {
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

    const cacheKey = `duration_in_mins_${startDate}_${endDate}_${filtersKeyPart}`;

    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return {
        success: true,
        message: `Data fetched successfully for duration in mins from cache`,
        data: parsed.data,
        cached: true,
        cached_time: parsed.cached_time
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
      SELECT 
        ROUND(SUM(toUInt32(event_time_new - event_time)) / 60, 2) AS duration_in_mins
      FROM analytics_events
      ${whereClause}
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const value = result[0]?.duration_in_mins || 0;
    const currentTime = timestamp();

    const cachePayload = {
      data: value,
      cached_time: currentTime
    };

    await redis.set(cacheKey, JSON.stringify(cachePayload), 'EX', 300);

    return {
      success: true,
      message: `Data fetched successfully for duration in mins`,
      data: value,
      cached: false,
      cached_time: currentTime
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};
