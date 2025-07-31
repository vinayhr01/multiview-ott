const redis = require("../../../config/redis.config");
const { pgClient1_connect } = require("../../../utils/postgresConnect");

exports.getFunnelsService = async (userId) => {
  const cacheKey = `funnels:user:${userId}`;

  // Check Redis cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    console.log("✅ [Redis] Serving funnels list");
    return {
      funnels: parsed.funnels,
      cached: true,
      cacheTimestamp: parsed.timestamp,
    };
  }

  // If not cached, query PostgreSQL
  const client = await pgClient1_connect();
  const result = await client.query(
    `SELECT * FROM funnels WHERE user_id = $1 ORDER BY created_at DESC`,
    [userId]
  );

  const funnels = result.rows;
  const payload = {
    funnels,
    timestamp: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(payload), "EX", 1800); // TTL = 30 minutes
  console.log("✅ [PostgreSQL] Cached funnels list");

  return {
    funnels,
    cached: false,
    cacheTimestamp: payload.timestamp,
  };
};
