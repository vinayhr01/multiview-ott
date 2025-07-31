// /**
//  * Helper function to build ClickHouse query for drop-off users using CTEs.
//  * @param {Array} funnelSteps - Steps of the funnel with eventName and filters.
//  * @param {Number} dropoffStepIndex - Index of the step for which to calculate drop-offs.
//  * @param {Number} timeWindowValue - Value for time window (e.g., 24).
//  * @param {String} timeWindowUnit - Unit for time window (e.g., HOURS, DAYS).
//  * @param {String} startTime - Start time in ISO string.
//  * @param {String} endTime - End time in ISO string.
//  * @param {Boolean} debug - If true, returns intermediate counts instead of user IDs.
//  * @returns {String} - The ClickHouse SQL query string.
//  */

const buildFilterConditions = require('./buildFilterConditions');

function buildDropoffUsersQueryWithCTEs(
  funnelSteps,
  dropoffStepIndex,
  timeWindowValue,
  timeWindowUnit,
  startTime,
  endTime,
  debug = false
) {
  // ✅ Validate inputs
  if (!Array.isArray(funnelSteps) || funnelSteps.length < 2) {
    throw new Error('funnelSteps must be an array with at least 2 elements.');
  }
  if (
    typeof dropoffStepIndex !== 'number' ||
    dropoffStepIndex < 1 ||
    dropoffStepIndex >= funnelSteps.length
  ) {
    throw new Error(`Invalid dropoffStepIndex. Must be between 1 and ${funnelSteps.length - 1}.`);
  }
  if (!timeWindowValue || !timeWindowUnit) {
    throw new Error('Invalid time window value or unit.');
  }

  const timeWindowInterval = `INTERVAL ${timeWindowValue} ${timeWindowUnit.toUpperCase()}`;
  const ctes = [];

  const previousStepIndex = dropoffStepIndex - 1;
  const previousStepCteName = `step_${previousStepIndex}_users`;
  const currentStepCteName = `step_${dropoffStepIndex}_users`;

  // ✅ CTE for the first step
  const firstStep = funnelSteps[0];
  let firstStepWhere = `event_name = '${firstStep.eventName}'`;
  const firstStepFilterConditions = buildFilterConditions(firstStep.filters);
  if (firstStepFilterConditions) {
    firstStepWhere += ` AND ${firstStepFilterConditions}`;
  }
  if (startTime) {
    firstStepWhere += ` AND event_time >= toDateTime('${startTime}')`;
  }
  if (endTime) {
    firstStepWhere += ` AND event_time <= toDateTime('${endTime}')`;
  }
  firstStepWhere += ` AND u_id NOT ILIKE 'Guest%'`;

  ctes.push(`
    step_0_users AS (
      SELECT
        u_id,
        MIN(event_time) AS event_time_min
      FROM analytics_events
      WHERE ${firstStepWhere}
      GROUP BY u_id
    )
  `);

  // ✅ CTEs for steps up to the drop-off step
  for (let i = 1; i <= dropoffStepIndex; i++) {
    const currentStep = funnelSteps[i];
    const prevIdx = i - 1;
    const prevCTE = `step_${prevIdx}_users`;
    const currCTE = `step_${i}_users`;

    let combinedFilters = [];
    for (let j = 0; j <= i; j++) {
      if (funnelSteps[j].filters && funnelSteps[j].filters.length > 0) {
        combinedFilters.push(buildFilterConditions(funnelSteps[j].filters));
      }
    }
    let combinedFilterString = combinedFilters.filter(f => f).join(' AND ');

    let currentStepWhere = `pb.event_name = '${currentStep.eventName}'`;
    if (combinedFilterString) {
      currentStepWhere += ` AND ${combinedFilterString}`;
    }
    currentStepWhere += ` AND pb.u_id NOT ILIKE 'Guest%'`;
    if (startTime) {
      currentStepWhere += ` AND pb.event_time >= toDateTime('${startTime}')`;
    }

    ctes.push(`
      ${currCTE} AS (
        SELECT
          pb.u_id,
          MIN(pb.event_time) AS event_time_min
        FROM analytics_events pb
        INNER JOIN ${prevCTE} s${prevIdx}
          ON pb.u_id = s${prevIdx}.u_id
        WHERE ${currentStepWhere}
          AND pb.event_time BETWEEN s${prevIdx}.event_time_min AND s${prevIdx}.event_time_min + ${timeWindowInterval}
        GROUP BY pb.u_id
      )
    `);
  }

  // ✅ Final SELECT
  const finalSelect = debug
    ? `
      SELECT
        (SELECT count(*) FROM ${previousStepCteName}) AS previous_step_count,
        (SELECT count(*) FROM ${currentStepCteName}) AS current_step_count
    `
    : `
      SELECT u_id
      FROM ${previousStepCteName}
      EXCEPT
      SELECT u_id
      FROM ${currentStepCteName}
    `;

  return `
    WITH ${ctes.join(',\n')}
    ${finalSelect};
  `;
}

module.exports = buildDropoffUsersQueryWithCTEs;
