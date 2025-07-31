const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { pgClient1_connect } = require("../../../utils/postgresConnect");
const buildNonDropoffUsersQueryWithCTEs = require("./funnelsLogic/buildNonDropoffUsersQueryWithCTEs");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");
const { timestamp } = require("../../../utils/timestamp"); // make sure this exists

exports.nonDropoffUsersService = async ({ funnelId, targetStepIndex, userId }) => {
  const client = await pgClient1_connect();

  const result = await client.query(
    'SELECT start_time, end_time, time_window, steps FROM funnels WHERE id = $1 AND user_id = $2',
    [funnelId, userId]
  );

  if (result.rows.length === 0) {
    throw new Error("Funnel not found or you do not have access.");
  }

  const { start_time, end_time, time_window, steps } = result.rows[0];

  if (!Array.isArray(steps) || steps.length < 2) {
    throw new Error("Invalid funnel steps structure in DB.");
  }

  if (targetStepIndex >= steps.length) {
    throw new Error(`Invalid targetStepIndex (${targetStepIndex}). Must be less than ${steps.length}.`);
  }

  const timeWindowParsed = parseTimeWindow(time_window);
  if (!timeWindowParsed) {
    throw new Error("Invalid time window format in DB.");
  }

  const { value: timeWindowValue, unit: timeWindowUnit } = timeWindowParsed;

  const cacheKey = `non_dropoff_users:${generateHash(
    funnelId, targetStepIndex, start_time, end_time, timeWindowValue, steps
  )}`;

  const cached = await redis.get(cacheKey);
  const cachedTimestamp = await redis.get(`${cacheKey}:timestamp`);

  if (cached) {
    console.log("✅ Serving non-dropoff users from Redis cache.");
    return {
      success: true,
      userIds: JSON.parse(cached),
      cache: true,
      cache_timestamp: cachedTimestamp || null
    };
  }

  const clickhouseQuery = await buildNonDropoffUsersQueryWithCTEs(
    steps,
    targetStepIndex,
    timeWindowValue,
    timeWindowUnit,
    start_time,
    end_time
  );

  console.log("🧩 Executing ClickHouse query:\n", clickhouseQuery);
  const resultSet = await queryClickHouse(clickhouseQuery);

  const userIds = resultSet.map(row => row.u_id);

  await redis.set(cacheKey, JSON.stringify(userIds), "EX", 300); // 5 min
  await redis.set(`${cacheKey}:timestamp`, timestamp(), "EX", 300);

  console.log("✅ Cached non-dropoff users in Redis.");

  return {
    success: true,
    userIds,
    cache: false,
    cache_timestamp: timestamp()
  };
};
