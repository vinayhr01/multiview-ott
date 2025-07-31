const redis = require("../../../config/redis.config");
const { pgClient1_connect } = require("../../../utils/postgresConnect");

exports.getFunnelByIdService = async (funnelId, userId) => {
  const cacheKey = `funnel:${funnelId}:user:${userId}`;

  // Try to fetch from cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    const parsed = JSON.parse(cached);
    console.log("✅ [Redis] Serving funnel by ID");
    return {
      ...parsed.funnelData,
      cached: true,
      cacheTimestamp: parsed.timestamp,
    };
  }

  // Query from PostgreSQL
  const client = await pgClient1_connect();
  const result = await client.query(
    "SELECT * FROM funnels WHERE id = $1 AND user_id = $2",
    [funnelId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Funnel not found or you do not have access.");
  }

  const funnelData = result.rows[0];
  const payload = {
    funnelData,
    timestamp: new Date().toISOString(),
  };

  await redis.set(cacheKey, JSON.stringify(payload), "EX", 1800); // 30 minutes TTL
  console.log("✅ [PostgreSQL] Cached funnel by ID");

  return {
    ...funnelData,
    cached: false,
    cacheTimestamp: payload.timestamp,
  };
};
