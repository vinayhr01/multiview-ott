const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp');

exports.htopCitiesService = async (startDate, endDate, filters = []) => {
  try {
    const allowedColumns = [
      'country',
      'city',
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

    const cacheKey = `htop_cities:${startDate}:${endDate}:${filtersKeyPart}`;

    const redis = await redisConnect();
    const cachedData = await redis.get(cacheKey);

    if (cachedData) {
      const parsed = JSON.parse(cachedData);
      return {
        success: true,
        message: 'Top cities data served from cache',
        data: parsed.data,
        cached: true,
        cached_time: parsed.cached_time
      };
    }

    let whereConditions = [];

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
        city AS City,
        COUNT(DISTINCT u_id) AS Active_Users,
        COUNT(DISTINCT CASE
          WHEN event_name = 'pb_end' AND value >= 3 THEN CONCAT(event_time, '_', u_id, '_', value)
        END) AS Views,
        ROUND(SUM(CASE
          WHEN event_name = 'pb_end' AND value >= 3 THEN value
        END) / 60) AS Duration_In_Mins,
        ROUND(
          SUM(CASE
            WHEN event_name = 'pb_end' AND value >= 3 THEN value
          END) / 60
        ) / NULLIF(
          COUNT(DISTINCT CASE
            WHEN event_name = 'pb_end' AND value >= 3 THEN CONCAT(event_time, '_', u_id, '_', value)
          END), 0
        ) AS Duration_Per_View
      FROM default.analytics_events
      ${whereClause}
      GROUP BY city
      ORDER BY Active_Users DESC
      LIMIT 100
    `;

    const params = { startDate, endDate };
    const result = await queryClickHouse(query, params);
    const currentTime = timestamp();

    const responseToCache = {
      data: result,
      cached_time: currentTime
    };

    await redis.set(cacheKey, JSON.stringify(responseToCache), 'EX', 300);

    return {
      success: true,
      message: 'Top cities data fetched successfully',
      data: result,
      cached: false,
      cached_time: currentTime
    };

  } catch (error) {
    console.error(error);
    throw error;
  }
};
