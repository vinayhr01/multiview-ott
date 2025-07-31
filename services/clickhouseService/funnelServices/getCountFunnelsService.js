const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const buildFunnelCountsQuery = require("./funnelsLogic/buildFunnelCountsQuery");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");

const getCountFunnelsService = async ({ name, startTime, endTime, timeWindow, steps }) => {
  // 1️⃣ Validate input
  if (!Array.isArray(steps) || steps.length < 1) {
    throw new Error("Invalid funnel steps structure.");
  }

  for (const step of steps) {
    if (!step.eventName || typeof step.eventName !== "string") {
      throw new Error("Invalid step eventName.");
    }
    if (step.filters && !Array.isArray(step.filters)) {
      throw new Error("Invalid step filters structure.");
    }
  }

  const timeWindowParsed = parseTimeWindow(timeWindow);
  if (!timeWindowParsed) {
    throw new Error("Invalid timeWindow format.");
  }

  const { value: timeWindowValue, unit: timeWindowUnit } = timeWindowParsed;

  // 2️⃣ Generate cache key
  const cacheKey = `funnel_counts:${generateHash(name, -1, startTime, endTime, timeWindow, steps)}`;

  // 3️⃣ Check Redis cache
  const cachedResult = await redis.get(cacheKey);
  if (cachedResult) {
    console.log("✅ Serving funnel counts from Redis cache.");
    const parsed = JSON.parse(cachedResult);
    return {
      stepCounts: parsed.stepCounts,
      cached: true,
      cacheTimestamp: parsed.cacheTimestamp
    };
  }

  // 4️⃣ Build & execute ClickHouse query
  const clickhouseQuery = buildFunnelCountsQuery(steps, timeWindowValue, timeWindowUnit, startTime, endTime);
  console.log("🧩 Executing ClickHouse query:\n", clickhouseQuery);

  const resultSet = await queryClickHouse(clickhouseQuery);

  // 5️⃣ Format result
  const stepCounts = [];
  if (resultSet) {
    resultSet.forEach(row => {
      stepCounts.push({
        stepIndex: row.step_order,
        stepName: row.step,
        usersCount: row.users,
        dropoffCount: row.dropoff_users
      });
    });
  }

  const cachePayload = {
    stepCounts,
    cacheTimestamp: new Date().toISOString()
  };

  // 6️⃣ Store in Redis
  await redis.set(cacheKey, JSON.stringify(cachePayload));
  console.log("✅ Funnel counts cached in Redis.");

  // 7️⃣ Return result
  return {
    stepCounts,
    cached: false,
    cacheTimestamp: cachePayload.cacheTimestamp
  };
};

module.exports = getCountFunnelsService;
