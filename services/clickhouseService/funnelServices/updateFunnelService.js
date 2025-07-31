const { pgClient1_connect } = require("../../../utils/postgresConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.updateFunnelService = async (req) => {
  console.log("Update Funnel Service Request:", req);

  const funnelId = req.body.id;
  const userId = req.user.id;
  const { name, steps, timeWindow, startTime, endTime } = req.body;

  const client = await pgClient1_connect();

  // 🔍 Check if funnel exists for this user
  const existingFunnelResult = await client.query(
    "SELECT * FROM funnels WHERE id = $1 AND user_id = $2",
    [funnelId, userId]
  );

  if (existingFunnelResult.rows.length === 0) {
    throw { status: 404, message: "Funnel not found or you do not have access." };
  }

  const updateValues = [funnelId, userId];
  let paramIndex = 3;
  let query = "UPDATE funnels SET updated_at = CURRENT_TIMESTAMP";

  // 🧪 Validate and append update fields
  if (name !== undefined) {
    if (typeof name !== "string" || name.trim() === "") {
      throw { status: 400, message: "Name must be a non-empty string if provided." };
    }
    query += `, name = $${paramIndex++}`;
    updateValues.push(name);
  }

  if (steps !== undefined) {
    if (!Array.isArray(steps) || steps.length < 2) {
      throw { status: 400, message: "Steps must be an array with at least 2 elements if provided." };
    }
    for (const step of steps) {
      if (!step.eventName || typeof step.eventName !== "string") {
        throw { status: 400, message: "Each step must have a valid eventName (string)." };
      }
      if (step.filters && !Array.isArray(step.filters)) {
        throw { status: 400, message: "Step filters must be an array if provided." };
      }
    }
    query += `, steps = $${paramIndex++}`;
    updateValues.push(JSON.stringify(steps));
  }

  if (timeWindow !== undefined) {
    if (typeof timeWindow !== "string" || timeWindow.trim() === "") {
      throw { status: 400, message: "Time window must be a non-empty string if provided." };
    }
    query += `, time_window = $${paramIndex++}`;
    updateValues.push(timeWindow);
  }

  if (startTime !== undefined) {
    query += `, start_time = $${paramIndex++}`;
    updateValues.push(startTime);
  }

  if (endTime !== undefined) {
    query += `, end_time = $${paramIndex++}`;
    updateValues.push(endTime);
  }

  // ❌ No update fields provided
  if (updateValues.length === 2) {
    throw { status: 400, message: "No update fields provided." };
  }

  // ✅ Finalize query
  query += ` WHERE id = $1 AND user_id = $2 RETURNING *`;

  const result = await client.query(query, updateValues);
  if (result.rows.length === 0) {
    throw { status: 404, message: "Funnel not found or you do not have access after attempting update." };
  }

  const dbFunnel = result.rows[0];

  // 🧹 Remove non-needed fields
  delete dbFunnel.created_at;
  delete dbFunnel.updated_at;

  // 📦 Response payload (not cached)
  const responseFunnel = {
    ...dbFunnel,
    cache: false,
    cache_timestamp: timestamp(),
  };

  // 🧠 Cache to Redis
  try {
    const redisClient = await redisConnect();
    const cacheKey = `funnel:${funnelId}:user:${userId}`;

    const cacheValue = {
      ...dbFunnel,
      cache: true,
      cache_timestamp: timestamp(),
    };

    if (redisClient && typeof redisClient.set === "function") {
      await redisClient.set(cacheKey, JSON.stringify(cacheValue));
      console.log("✅ Funnel updated and cached in Redis:", cacheKey);
    } else {
      console.warn("⚠️ Redis client not ready, skipping cache set.");
    }
  } catch (err) {
    console.error("❌ Redis error while setting cache:", err);
  }

  return responseFunnel;
};
