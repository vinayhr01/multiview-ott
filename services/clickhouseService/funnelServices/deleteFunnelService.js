const { pgClient1_connect } = require("../../../utils/postgresConnect");
const redis = require("../../../config/redis.config");
const generateHash = require("./funnelsLogic/generateHash");
const { timestamp } = require("../../../utils/timestamp");

exports.deleteFunnelService = async ({ funnelId, userId }) => {
  try {
    const client = await pgClient1_connect();

    // Optional: check ownership before deletion
    const checkQuery = await client.query(
      "SELECT * FROM funnels WHERE id = $1 AND user_id = $2",
      [funnelId, userId]
    );

    if (checkQuery.rows.length === 0) {
      return {
        statusCode: 404,
        body: { error: "Funnel not found or you do not have access." }
      };
    }

    // ✅ Delete Redis cache if key exists
    const { start_time, end_time, time_window, steps } = checkQuery.rows[0];
    const cacheKey = `funnel_counts:${generateHash(funnelId, -1, start_time, end_time, time_window, steps)}`;

    const cacheExists = await redis.exists(cacheKey);
    if (cacheExists) {
      await redis.del(cacheKey);
    }

    // 🗑️ Delete from DB
    const result = await client.query(
      "DELETE FROM funnels WHERE id = $1 AND user_id = $2 RETURNING *",
      [funnelId, userId]
    );

    return {
      body: {
        message: "Funnel deleted successfully.",
        time: timestamp() // ✅ Add timestamp of deletion
      }
    };

  } catch (error) {
    console.error("❌ Service Error (deleteFunnelService):", error);
    return {
      statusCode: 500,
      body: { error: "Failed to delete funnel." }
    };
  }
};
