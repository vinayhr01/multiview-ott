const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.hviewsService = async (startDate, endDate, filters) => {
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

    const cacheKey = `hviews_${startDate}_${endDate}_${filtersKeyPart}`;
    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      const totalViews = Array.isArray(parsed)
        ? parseInt(parsed[0]?.total_views ?? 0)
        : parseInt(parsed?.total_views ?? 0);

      return {
        success: true,
        message: 'Views fetched successfully from cache',
        data: totalViews,
        cached: true,
        cached_time: timestamp()
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
        COUNT(*) AS total_views
      FROM default.analytics_events
      ${whereClause}
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);

    const responseToCache = { total_views: result[0]?.total_views ?? "0" };
    await redis.set(cacheKey, JSON.stringify(responseToCache), 'EX', 300);

    return {
      success: true,
      message: 'Views fetched successfully',
      data: parseInt(responseToCache.total_views),
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};
