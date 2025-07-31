const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp util

exports.topCitiesService = async (startDate, endDate, filters) => {
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

    // ✅ Build cache key
    const filtersKeyPart = filters && Array.isArray(filters)
      ? filters.map(f =>
          `${f.col}_${f.op}_${Array.isArray(f.val) ? f.val.join('-') : f.val}`
        ).join('_')
      : 'nofilters';

    const cacheKey = `top_cities:${startDate}:${endDate}:${filtersKeyPart}`;

    // ✅ Connect Redis
    const redis = await redisConnect();

    // ✅ Try fetching from cache
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      
      return {
        success: true,
        message: 'Top cities data served from cache',
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: timestamp() // ✅ Use timestamp util
      };
    }

    // ✅ Build WHERE clause
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

    // ✅ Final query
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

    // ✅ Execute query
    const result = await queryClickHouse(query, params);

    // ✅ Cache result
    const time = timestamp(); // ✅ Use same timestamp for response
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: 'Top cities data fetched successfully',
      data: result,
      cached: false,
      cached_time: time
    };

  } catch (error) {
    console.error(`❌ Error in topCitiesService:`, error);
    throw error;
  }
};
