const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");

exports.getEventNamesService = async () => {
  const cacheKey = "event_names:non_ad";

  try {
    const cached = await redis.get(cacheKey);
    if (cached) {
      const parsed = JSON.parse(cached);
      console.log("✅ [Redis] Serving event names");
      return {
        success: true,
        data: parsed.eventNames,
        cached: true,
        cacheTimestamp: parsed.timestamp,
      };
    }

    const query = `SELECT DISTINCT event_name FROM analytics_events WHERE event_name NOT ILIKE 'ad%'`;
    const resp = await queryClickHouse(query);
    const eventNames = resp.stream ? await resp.stream().toArray() : resp;

    const cachePayload = {
      eventNames,
      timestamp: new Date().toISOString(),
    };

    await redis.set(cacheKey, JSON.stringify(cachePayload), "EX", 1800); // 30 min TTL
    console.log("✅ [ClickHouse] Cached event names");

    return {
      success: true,
      data: eventNames,
      cached: false,
      cacheTimestamp: cachePayload.timestamp,
    };
  } catch (error) {
    console.error("❌ [Service] Error in getEventNamesService:", error);
    throw error;
  }
};
