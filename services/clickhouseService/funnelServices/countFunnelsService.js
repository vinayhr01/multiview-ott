const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { pgClient1_connect } = require("../../../utils/postgresConnect");
const buildFunnelCountsQuery = require("./funnelsLogic/buildFunnelCountsQuery");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");
const { timestamp } = require("../../../utils/timestamp"); // ✅ Add timestamp utility

exports.countFunnelsService = async ({ funnelId, userId }) => {
  try {
    const client = await pgClient1_connect();

    const result = await client.query(
      "SELECT start_time, end_time, time_window, steps FROM funnels WHERE id = $1 AND user_id = $2",
      [funnelId, userId]
    );

    if (result.rows.length === 0) {
      return {
        statusCode: 404,
        body: { error: "Funnel not found or you do not have access." }
      };
    }

    const { start_time, end_time, time_window, steps } = result.rows[0];
    const startTime = start_time;
    const endTime = end_time;
    const timeWindowValue = time_window;
    const steps_str = steps;

    const cacheKey = `funnel_counts:${generateHash(funnelId, -1, startTime, endTime, timeWindowValue, steps_str)}`;

    const cachedResult = await redis.get(cacheKey);
    if (cachedResult) {
      return {
        body: {
          funnelId,
          stepCounts: JSON.parse(cachedResult),
          cached: true,
          cached_time: timestamp() // ✅ Added cache timestamp
        }
      };
    }

    if (!Array.isArray(steps_str) || steps_str.length < 1) {
      return {
        statusCode: 500,
        body: { error: "Invalid funnel steps structure." }
      };
    }

    for (const step of steps_str) {
      if (!step.eventName || typeof step.eventName !== "string") {
        return { statusCode: 500, body: { error: "Invalid step eventName in DB." } };
      }
      if (step.filters && !Array.isArray(step.filters)) {
        return { statusCode: 500, body: { error: "Invalid step filters in DB." } };
      }
    }

    const timeWindowParsed = parseTimeWindow(timeWindowValue);
    if (!timeWindowParsed) {
      return {
        statusCode: 500,
        body: { error: "Invalid timeWindow format in DB." }
      };
    }

    const { value: twValue, unit: twUnit } = timeWindowParsed;

    const clickhouseQuery = buildFunnelCountsQuery(steps_str, twValue, twUnit, startTime, endTime);

    const resultSet = await queryClickHouse(clickhouseQuery);

    const stepCounts = (resultSet || []).map(row => ({
      stepIndex: row.step_order,
      stepName: row.step,
      usersCount: row.users,
      dropoffCount: row.dropoff_users
    }));

    await redis.set(cacheKey, JSON.stringify(stepCounts));

    return {
      body: {
        funnelId,
        stepCounts,
        cached: false,
        cached_time: timestamp() // ✅ Added cache timestamp here too
      }
    };

  } catch (error) {
    console.error("❌ Service Error (countFunnelsService):", error);
    return {
      statusCode: 500,
      body: { error: "Failed to calculate funnel counts." }
    };
  }
};
