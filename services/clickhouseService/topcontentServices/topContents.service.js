const { queryClickHouse } = require('../../../utils/clickhouseConnect');
const { redisConnect } = require('../../../utils/redisConnect');
const { timestamp } = require('../../../utils/timestamp'); // ✅ Add timestamp utility

exports.topContentsService = async (startDate, endDate, filters = []) => {
  try {
    const allowedColumns = [
      'show_name',
      'video_name',
      'genre',
      'content_type',
      'country',
      'platform',
      'source'
    ];

    const filtersKeyPart = Array.isArray(filters)
      ? filters.map(f => `${f.col}_${f.op}_${Array.isArray(f.val) ? f.val.join('-') : f.val}`).join('_')
      : 'nofilters';

    const cacheKey = `top_contents_${startDate}_${endDate}_${filtersKeyPart}`;

    const redis = await redisConnect();

    const cachedData = await redis.get(cacheKey);
    const currentTime = timestamp(); // ✅ Use consistent timestamp

    if (cachedData) {
      return {
        success: true,
        message: 'Top contents data served from cache',
        data: JSON.parse(cachedData),
        cached: true,
        cached_time: currentTime
      };
    }

    let whereConditions = [
      `event_name = 'pb_end'`,
      `event_time >= toDateTime({startDate:String})`,
      `event_time < toDateTime({endDate:String})`
    ];

    if (Array.isArray(filters) && filters.length > 0) {
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

    const query = `
      SELECT
        video_name,
        show_name,
        uniqExact(if((subscription_status = 'active') AND (trigger_event = 'first_watch'), u_id, NULL)) AS Subs_First_Watch,
        uniqExact(u_id) AS Active_Users,
        uniqExact(concat(event_time, '_', u_id, '_', value)) AS Views,
        round(sum(value) / 60) AS Duration_In_Mins,
        round(sum(value) / 60) / nullIf(uniqExact(concat(event_time, '_', u_id, '_', value)), 0) AS Duration_Per_View
      FROM 
        default.analytics_events
      WHERE 
        ${whereClause}
      GROUP BY 
        video_id, video_name, show_name, genre, content_type, country, platform, source
      ORDER BY Duration_In_Mins DESC
      LIMIT 100
    `;

    const params = { startDate, endDate };

    const result = await queryClickHouse(query, params);

    // Cache result
    await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

    return {
      success: true,
      message: 'Top contents data fetched successfully',
      data: result,
      cached: false,
      cached_time: currentTime
    };

  } catch (error) {
    console.error('❌ Error in topContentsService:', error);
    throw error;
  }
};
