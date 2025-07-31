const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp"); // Ensure this exists

exports.subsFirstWatchService = async (startDate, endDate, filters) => {
  try {
    const allowedColumns = [
      'country',
      'platform',
      'source',
      'content_type',
      'genre',
      'show_name',
      'video_name',
      'city'
    ];

    const filtersKeyPart = filters && Array.isArray(filters)
      ? filters.map(f =>
          `${f.col}_${f.op}_${Array.isArray(f.val) ? f.val.join('-') : f.val}`
        ).join('_')
      : 'nofilters';

    const cacheKey = `subs_first_watch_${startDate}_${endDate}_${filtersKeyPart}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: "Subs first watch count fetched from cache",
        data: parseInt(JSON.parse(cachedData)),
        cached: true,
        cached_time: timestamp()
      };
    }

    let whereConditions = [`event_name = 'Subs_first_watch'`];

    if (startDate && endDate) {
      whereConditions.push(`event_time >= toDateTime({startDate:String})`);
      whereConditions.push(`event_time < toDateTime({endDate:String})`);
    }

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

    const whereClause = whereConditions.length > 0
      ? `WHERE ${whereConditions.join(' AND ')}`
      : '';

    const query = `
      SELECT 
        COUNT(DISTINCT u_id) AS Unique_Users
      FROM default.analytics_events
      ${whereClause}
      LIMIT 50000
    `;

    const params = { startDate, endDate };
    const response = await queryClickHouse(query, params);
    const count = parseInt(response[0]?.Unique_Users || 0);

    await redis.set(cacheKey, JSON.stringify(count), 'EX', 300);


    return {
      success: true,
      message: "Subs first watch count fetched successfully",
      data: count,
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};
