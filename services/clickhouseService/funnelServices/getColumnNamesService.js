const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { timestamp } = require("../../../utils/timestamp"); // ✅ Add timestamp util

exports.getColumnNamesService = async () => {
  const cacheKey = "column_names";

  // 🔁 Check Redis Cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    console.log("✅ [Redis] Serving column names");
    return {
      success: true,
      data: JSON.parse(cached),
      cached: true,
      cached_time: timestamp() // ✅ Cache timestamp on hit
    };
  }

  // 🧠 Query ClickHouse
  const query = `DESC analytics_events`;
  const resp = await queryClickHouse(query);
  const columns = resp.stream ? await resp.stream().toArray() : resp;

  const formatted = columns.map(col => ({ column_name: col.name }));

  // 💾 Set Redis Cache (no expiry set; optional: 'EX', 1800 for 30min)
  await redis.set(cacheKey, JSON.stringify(formatted));
  console.log("✅ [ClickHouse] Cached column names");

  return {
    success: true,
    data: formatted,
    cached: false,
    cached_time: timestamp() // ✅ Cache timestamp on fresh fetch
  };
};
