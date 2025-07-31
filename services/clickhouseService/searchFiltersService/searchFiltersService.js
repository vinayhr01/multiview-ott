const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp"); // ✅ Import timestamp

exports.searchFiltersService = async (keyword, filter_type) => {
  try {
    const redis = await redisConnect();

    if (keyword && keyword.length >= 1) {
      const cacheKey = `searchFilters_${filter_type}_${keyword}`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return {
          success: true,
          data: parsed.data,
          filter: filter_type,
          cached: true,
          cached_time: timestamp()
        };
      }

      if (!keyword) {
        return { error: "Please give keyword to search" };
      }

      let q = `
        SELECT DISTINCT ${filter_type} AS filter_type
        FROM default.analytics_events 
        WHERE ${filter_type} ILIKE {keyword:String}
        LIMIT 20
      `;

      let resp = await queryClickHouse(q, { keyword: keyword + "%" });

      if (!resp) {
        return {
          message: `No ${filter_type} matched`,
          filter_types: [],
        };
      }

      const result = {
        data: Array.isArray(resp)
          ? resp.map((each) => each?.filter_type)
          : [resp?.filter_type],
      };

      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);
      return {
        success: true,
        message: `Search filters for '${filter_type}' with keyword '${keyword}' served from cache`,
        data: result.data,
        filter: filter_type,
        cached: false,
        cached_time: timestamp()
      };
    } else {
      const cacheKey = `searchFiltersTop20_${filter_type}_7d`;
      const cachedData = await redis.get(cacheKey);

      if (cachedData) {
        const parsed = JSON.parse(cachedData);
        return {
          success: true,
          data: parsed.data,
          filter: filter_type,
          cached: true,
          cached_time: timestamp()
        };
      }

      let q = `
        WITH top_20 AS (
          SELECT
            ${filter_type},
            count(*) AS count
          FROM default.analytics_events
          WHERE (event_name = 'pb_end')
            AND (event_time >= toDateTime(NOW() - toIntervalDay(7)))
            AND (event_time < toDateTime(NOW()))
          GROUP BY ${filter_type}
          ORDER BY count DESC
          LIMIT 20
        )
        SELECT ${filter_type} AS filter_type FROM top_20
      `;

      let resp = await queryClickHouse(q);

      const result = {
        data: Array.isArray(resp)
          ? resp.map((each) => each?.filter_type)
          : [resp?.filter_type],
      };

      await redis.set(cacheKey, JSON.stringify(result), 'EX', 300);

      return {
        success: true,
        message: `Search filters for '${filter_type}' with keyword '${keyword}'`,
        data: result.data,
        filter: filter_type,
        cached: false,
        cached_time: timestamp()
      };
    }
  } catch (error) {
    console.error("Error fetching search filters:", error);
    throw error;
  }
};
