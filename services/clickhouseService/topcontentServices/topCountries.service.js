const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add this

exports.topCountriesService = async (startDate, endDate, filters = []) => {
  try {
    // ✅ 1️⃣ Allowed filters list
    const allowedColumns = [
      'country',
      'platform',
      'source',
      'content_type',
      'genre',
      'show_name',
      'video_name'
    ];

    // ✅ 2️⃣ Build unique cache key
    const filtersKeyPart = filters.map(f => `${f.col}_${f.op}_${Array.isArray(f.val) ? f.val.join('-') : f.val}`).join('_') || 'nofilters';
    const cacheKey = `top_countries_${startDate}_${endDate}_${filtersKeyPart}`;

    // ✅ 3️⃣ Connect to Redis
    const redis = await redisConnect();
    const currentTime = timestamp(); // ✅ Timestamp once

    // ✅ 4️⃣ Check Redis
    const cachedData = await redis.get(cacheKey);
    if (cachedData) {
      return {
        success: true,
        message: 'Top countries data served from cache',
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: currentTime
      };
    }

    // ✅ 5️⃣ Build WHERE conditions
    let whereConditions = [
      `event_time >= toDateTime({startDate:String})`,
      `event_time < toDateTime({endDate:String})`
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

    const whereClause = whereConditions.join(' AND ');

    // ✅ 6️⃣ ClickHouse query
    const query = `
      SELECT 
        country AS Country,
        COUNT(DISTINCT u_id) AS Active_Users,
        COUNT(DISTINCT CASE
          WHEN event_name = 'pb_end' AND value >= 3 THEN CONCAT(event_time, '_', u_id, '_', value)
        END) AS Views,
        ROUND(SUM(CASE
          WHEN event_name = 'pb_end' AND value >= 3 THEN value
        END) / 60) AS Duration_Mins,
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
      WHERE ${whereClause}
      GROUP BY country
      ORDER BY Active_Users DESC
      LIMIT 100
    `;

    const params = { startDate, endDate };

    // ✅ 7️⃣ Run query
    const result = await queryClickHouse(query, params);

    // ✅ 8️⃣ Cache result
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    // ✅ 9️⃣ Return standardized response
    return {
      success: true,
      message: 'Top countries data fetched successfully',
      data: result,
      cached: false,
      cached_time: currentTime
    };

  } catch (error) {
    console.error('❌ Error in topCountriesService:', error);
    throw error;
  }
};
