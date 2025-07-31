const { pgClient1_connect } = require("../../../utils/postgresConnect");
const { redisConnect } = require("../../../utils/redisConnect");
const { timestamp } = require("../../../utils/timestamp");

exports.addFunnelService = async ({ userId, name, steps, timeWindow, startTime, endTime }) => {
  try {
    // 🔑 Create a unique cache key (based on user + name)
    const cacheKey = `funnel_insert_${userId}_${name}`;

    // 🔁 Connect to Redis
    const redis = await redisConnect();

    // 💾 Try getting from Redis
    const cached = await redis.get(cacheKey);
    if (cached) {
      return {
        ...JSON.parse(cached),
        cached: true,
        cached_time: timestamp(),
      };
    }

    // 📥 Insert into PostgreSQL
    const client = await pgClient1_connect();
    console.log("Connected to PostgreSQL for Funnel Service");
    const query = `
      INSERT INTO funnels (user_id, name, steps, time_window, start_time, end_time)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `;

    const values = [
      userId,
      name,
      JSON.stringify(steps),
      timeWindow,
      startTime,
      endTime
    ];

    const result = await client.query(query, values);
    const inserted = result.rows[0];

    // 🧠 Cache the inserted result for 5 mins
    await redis.set(cacheKey, JSON.stringify(inserted), 'EX', 300);

    return {
      ...inserted,
      cached: false,
      cached_time: timestamp()
    };

  } catch (error) {
    console.error("Service Error (addFunnelService):", error);
    throw new Error("Database insertion failed.");
  }
};
