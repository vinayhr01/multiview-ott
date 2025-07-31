const redis = require("../../../config/redis.config");
const { queryClickHouse } = require("../../../utils/clickhouseConnect");
const { pgClient1_connect } = require("../../../utils/postgresConnect");
const buildDropoffUsersQueryWithCTEs = require("./funnelsLogic/buildDropoffUsersQueryWithCTEs");
const generateHash = require("./funnelsLogic/generateHash");
const parseTimeWindow = require("./funnelsLogic/parseTimeWindow");
const { timestamp } = require("../../../utils/timestamp"); // ✅ Add timestamp util

exports.dropoffUsersService = async ({ funnelId, dropoffStepIndex, userId }) => {
  const client = await pgClient1_connect();

  const funnelResult = await client.query(
    'SELECT start_time, end_time, time_window, steps FROM funnels WHERE id = $1 AND user_id = $2',
    [funnelId, userId]
  );

  if (funnelResult.rows.length === 0) {
    throw new Error("Funnel not found or access denied.");
  }

  const { start_time, end_time, time_window, steps } = funnelResult.rows[0];

  if (!Array.isArray(steps) || steps.length < 2) {
    throw new Error("Invalid funnel steps structure in DB.");
  }

  if (dropoffStepIndex >= steps.length) {
    throw new Error(`Invalid dropoffStepIndex (${dropoffStepIndex}). Must be less than steps length.`);
  }

  const timeWindowParsed = parseTimeWindow(time_window);
  if (!timeWindowParsed) {
    throw new Error("Invalid time window format in DB.");
  }

  const { value: timeWindowValue, unit: timeWindowUnit } = timeWindowParsed;

  const funnelHash = generateHash(funnelId, dropoffStepIndex, start_time, end_time, timeWindowValue, steps);
  const redisKey = `dropoff_users:${funnelHash}`;

  const cached = await redis.get(redisKey);
  if (cached) {
    console.log('✅ Serving dropoff users from Redis cache.');
    return {
       success: true,
      data: JSON.parse(cached),
      cached: true,
      cachetimestamp: timestamp()
    };
  }

  const clickhouseQuery = buildDropoffUsersQueryWithCTEs(
    steps,
    dropoffStepIndex,
    timeWindowValue,
    timeWindowUnit,
    start_time,
    end_time
  );

  console.log('🧩 Executing ClickHouse query:\n', clickhouseQuery);

  const resultSet = await queryClickHouse(clickhouseQuery);
  const dropoffUsers = resultSet
  .map(row => row.u_id)
  .filter(id => id && id.trim() !== "");

  await redis.set(redisKey, JSON.stringify(dropoffUsers), "EX", 1800); // 30 min TTL
  console.log('✅ Cached dropoff users in Redis.');

  return {
  success: true,
  data: dropoffUsers,
  cached: false,
  cachetimestamp: timestamp()  // use same key as requested
};

};
