// services/funnels/funnelsLogic/formatClickHouseValue.js

/**
 * Helper function to safely format filter values for ClickHouse SQL.
 */
function formatClickHouseValue(value) {
  if (typeof value === 'string') {
    // Escape single quotes within strings
    return `'${value.replace(/'/g, "''")}'`;
  } else if (typeof value === 'number' || typeof value === 'boolean') {
    return value.toString();
  } else if (Array.isArray(value)) {
    // Format each array item
    return value.map(v => formatClickHouseValue(v)).join(', ');
  } else if (value === null) {
    return 'NULL';
  }
  console.warn('Unsupported filter value type:', typeof value, value);
  return 'NULL';
}

module.exports = formatClickHouseValue;
