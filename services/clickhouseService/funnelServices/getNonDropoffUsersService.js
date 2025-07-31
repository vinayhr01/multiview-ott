const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const buildNonDropoffUsersQueryWithCTEs = require("./funnelsLogic/buildNonDropoffUsersQueryWithCTEs");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");

exports.getNonDropoffUsersService = async ({
  name, steps, timeWindow, startTime, endTime, targetStepIndex
}) => {

  if (targetStepIndex === undefined || typeof targetStepIndex !== 'number' || targetStepIndex < 0) {
    throw new Error('Invalid targetStepIndex. Must be >= 0.');
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

  if (targetStepIndex >= steps.length) {
    throw new Error(`targetStepIndex (${targetStepIndex}) must be less than steps length (${steps.length}).`);
  }

  const timeWindowParsed = parseTimeWindow(timeWindow);
  if (!timeWindowParsed) {
    throw new Error('Invalid time window format.');
  }

  const { value: timeWindowValue, unit: timeWindowUnit } = timeWindowParsed;

  const redisKey = `non_dropoff_users:${generateHash(
    name, targetStepIndex, startTime, endTime, timeWindowValue, steps
  )}`;

  const cached = await redis.get(redisKey);
  if (cached) {
    console.log("Serving non-dropoff users from Redis.");
    const parsed = JSON.parse(cached);
    return {
      success: true,
      targetStepIndex,
      dropoffUserIds: parsed.data,
      dropoffCount: parsed.data.length,
      cached: true,
      cachedAt: parsed.cachedAt
    };
  }

  const clickhouseQuery = buildNonDropoffUsersQueryWithCTEs(
    steps, targetStepIndex, timeWindowValue, timeWindowUnit, startTime, endTime
  );

  console.log("Executing non-dropoff users query:", clickhouseQuery);

  const resultSet = await queryClickHouse(clickhouseQuery);

  const nonDropoffUsers = [];
  for await (const row of resultSet) {
    nonDropoffUsers.push(row.u_id);
  }

  const cachePayload = {
    data: nonDropoffUsers,
    cachedAt: new Date().toISOString()
  };

  await redis.set(redisKey, JSON.stringify(cachePayload), "EX", 1800); // 30 minutes
  console.log("Cached non-dropoff users in Redis.");

  return {
    success: true,
    targetStepIndex,
    dropoffUserIds: nonDropoffUsers,
    dropoffCount: nonDropoffUsers.length,
    cached: false,
    cachedAt: cachePayload.cachedAt
  };
};
