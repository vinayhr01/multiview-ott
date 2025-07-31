const buildFilterConditions = require('./buildFilterConditions');

// /**
//  * Builds a ClickHouse SQL query to find non-drop-off users for a funnel.
//  * @param {Array} funnelSteps - Funnel steps with eventName and filters.
//  * @param {Number} targetStepIndex - Step index for which to find non-drop-offs.
//  * @param {Number} timeWindowValue - Value of time window (e.g., 24).
//  * @param {String} timeWindowUnit - Unit of time window (e.g., HOURS).
//  * @param {String} startTime - ISO start time.
//  * @param {String} endTime - ISO end time.
//  * @returns {String} - ClickHouse SQL query string.
//  */
function buildNonDropoffUsersQueryWithCTEs(
  funnelSteps,
  targetStepIndex,
  timeWindowValue,
  timeWindowUnit,
  startTime,
  endTime
) {
  if (!funnelSteps || !Array.isArray(funnelSteps) || funnelSteps.length < 1) {
    throw new Error('funnelSteps must be an array with at least 1 element.');
  }
  if (targetStepIndex === undefined || typeof targetStepIndex !== 'number' || targetStepIndex < 1 || targetStepIndex >= funnelSteps.length) {
    throw new Error(`Invalid targetStepIndex. Must be between 1 and ${funnelSteps.length - 1}.`);
  }
  if (timeWindowValue === undefined || timeWindowUnit === undefined) {
    throw new Error('Invalid time window value or unit.');
  }

  const timeWindowInterval = `INTERVAL ${timeWindowValue} ${timeWindowUnit.toUpperCase()}`;
  const ctes = [];

  // CTE for the first step
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

  // CTEs for next steps up to targetStepIndex
  for (let i = 1; i <= targetStepIndex; i++) {
    const currentStep = funnelSteps[i];
    const previousStepIndexInLoop = i - 1;

    let combinedFilters = [];
    for (let j = 0; j <= i; j++) {
      if (funnelSteps[j].filters && funnelSteps[j].filters.length > 0) {
        combinedFilters.push(buildFilterConditions(funnelSteps[j].filters));
      }
    }
    const combinedFilterString = combinedFilters.filter(f => f !== '').join(' AND ');

    let currentStepWhere = `pb.event_name = '${currentStep.eventName}'`;
    if (combinedFilterString) {
      currentStepWhere += ` AND ${combinedFilterString}`;
    }
    currentStepWhere += ` AND pb.u_id NOT ILIKE 'Guest%'`;
    if (startTime) {
      currentStepWhere += ` AND pb.event_time >= toDateTime('${startTime}')`;
    }

    ctes.push(`
      step_${i}_users AS (
        SELECT
          pb.u_id,
          MIN(pb.event_time) AS event_time_min
        FROM analytics_events pb
        INNER JOIN step_${previousStepIndexInLoop}_users s${previousStepIndexInLoop}
          ON pb.u_id = s${previousStepIndexInLoop}.u_id
        WHERE ${currentStepWhere}
          AND pb.event_time BETWEEN s${previousStepIndexInLoop}.event_time_min AND s${previousStepIndexInLoop}.event_time_min + ${timeWindowInterval}
        GROUP BY pb.u_id
      )
    `);
  }

  const finalSelect = `
    SELECT u_id
    FROM step_${targetStepIndex}_users
  `;

  return `
    WITH ${ctes.join(',\n')}
    ${finalSelect};
  `;
}

module.exports = buildNonDropoffUsersQueryWithCTEs;
