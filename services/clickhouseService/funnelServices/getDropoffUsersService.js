const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { timestamp } = require("../../../utils/timestamp");
const buildDropoffUsersQueryWithCTEs = require("./funnelsLogic/buildDropoffUsersQueryWithCTEs");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");

exports.getDropoffUsersService = async ({
  name,
  dropoffStepIndex,
  steps,
  startTime,
  endTime,
  timeWindow
}) => {
  // 🔍 Validation
  if (dropoffStepIndex === undefined || typeof dropoffStepIndex !== 'number' || dropoffStepIndex < 1) {
    throw new Error('Invalid dropoffStepIndex. Must be >= 1.');
  }

  if (!Array.isArray(steps) || steps.length < 2) {
    throw new Error('Invalid funnel steps structure.');
  }

  for (const step of steps) {
    if (!step.eventName || typeof step.eventName !== 'string') {
      throw new Error('Each step must have a valid eventName.');
    }
    if (step.filters && !Array.isArray(step.filters)) {
      throw new Error('Each step filters must be an array if defined.');
    }
  }

  if (dropoffStepIndex >= steps.length) {
    throw new Error(`dropoffStepIndex (${dropoffStepIndex}) must be less than steps length (${steps.length}).`);
  }

  const timeWindowParsed = parseTimeWindow(timeWindow);
  if (!timeWindowParsed) {
    throw new Error('Invalid time window format.');
  }

  const { value: timeWindowValue, unit: timeWindowUnit } = timeWindowParsed;

  const redisKey = `dropoff_users:${generateHash(
    name, dropoffStepIndex, startTime, endTime, timeWindowValue, steps
  )}`;

  // 🧠 Redis Caching
  const cached = await redis.get(redisKey);
  if (cached) {
    console.log("✅ [Redis] Serving dropoff users from cache.");
    const parsed = JSON.parse(cached);
    return {
      success: true,
      dropoffStepIndex,
      dropoffUserIds: parsed.dropoffUserIds,
      dropoffCount: parsed.dropoffUserIds.length,
      cached: true,
      cacheTimestamp: timestamp()
    };
  }

  const clickhouseQuery = buildDropoffUsersQueryWithCTEs(
    steps, dropoffStepIndex, timeWindowValue, timeWindowUnit, startTime, endTime
  );

  console.log("🚀 [ClickHouse] Executing query:", clickhouseQuery);
  const resultSet = await queryClickHouse(clickhouseQuery);

  const dropoffUsers = [];
  for await (const row of resultSet) {
    dropoffUsers.push(row.u_id);
  }

  const responseToCache = {
    dropoffUserIds: dropoffUsers,
    cacheTimestamp: new Date().toISOString()
  };

  await redis.set(redisKey, JSON.stringify(responseToCache), "EX", 1800); // TTL = 30 min
  console.log("✅ [Redis] Cached dropoff users.");

  return {
    success: true,
    dropoffStepIndex,
    dropoffUserIds: dropoffUsers,
    dropoffCount: dropoffUsers.length,
    cached: false,
    cacheTimestamp: timestamp()
  };
};
