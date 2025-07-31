// services/funnels/funnelsLogic/buildFunnelCountsQuery.js

const buildFilterConditions = require("./buildFilterConditions");

// Make sure you import any helper used here!

function buildFunnelCountsQuery(funnelSteps, timeWindowValue, timeWindowUnit, startTime, endTime) {
  if (!funnelSteps || !Array.isArray(funnelSteps) || funnelSteps.length < 1) {
    throw new Error('funnelSteps must be an array with at least 1 element.');
  }
  if (timeWindowValue === undefined || timeWindowUnit === undefined) {
    throw new Error('Invalid time window value or unit.');
  }

  const timeWindowInterval = `INTERVAL ${timeWindowValue} ${timeWindowUnit.toUpperCase()}`;
  const ctes = [];
  const unionAllParts = [];

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

  unionAllParts.push(`
    SELECT
      1 AS step_order,
      '${firstStep.eventName}' AS step,
      (SELECT COUNT(*) FROM step_0_users) AS users,
      0 AS dropoff_users
  `);

  for (let i = 1; i < funnelSteps.length; i++) {
    const currentStep = funnelSteps[i];
    const previousStepIndex = i - 1;
    const previousStepCteName = `step_${previousStepIndex}_users`;
    const currentStepCteName = `step_${i}_users`;

    let combinedFilters = [];
    for (let j = 0; j <= i; j++) {
      if (funnelSteps[j].filters && funnelSteps[j].filters.length > 0) {
        combinedFilters.push(buildFilterConditions(funnelSteps[j].filters));
      }
    }
    let combinedFilterString = combinedFilters.filter(f => f !== '').join(' AND ');

    let currentStepWhere = `pb.event_name = '${currentStep.eventName}'`;
    if (combinedFilterString) {
      currentStepWhere += ` AND ${combinedFilterString}`;
    }
    currentStepWhere += ` AND pb.u_id NOT ILIKE 'Guest%'`;
    if (startTime) {
      currentStepWhere += ` AND pb.event_time >= toDateTime('${startTime}')`;
    }

    ctes.push(`
      ${currentStepCteName} AS (
        SELECT
          pb.u_id,
          MIN(pb.event_time) AS event_time_min
        FROM analytics_events pb
        INNER JOIN ${previousStepCteName} s${previousStepIndex} ON pb.u_id = s${previousStepIndex}.u_id
        WHERE ${currentStepWhere}
          AND pb.event_time BETWEEN s${previousStepIndex}.event_time_min AND s${previousStepIndex}.event_time_min + ${timeWindowInterval}
        GROUP BY pb.u_id
      )
    `);

    unionAllParts.push(`
      SELECT
        ${i + 1} AS step_order,
        '${currentStep.eventName}' AS step,
        (SELECT COUNT(*) FROM ${currentStepCteName}) AS users,
        (SELECT COUNT(*) FROM ${previousStepCteName}) - (SELECT COUNT(*) FROM ${currentStepCteName}) AS dropoff_users
    `);
  }

  let query = `
    WITH ${ctes.join(',\n\n')}
    ${unionAllParts.join('\n\n    UNION ALL\n\n')}
    ORDER BY step_order;
  `;

  return query;
}

module.exports = buildFunnelCountsQuery;
