// services/funnels/funnelsLogic/buildFilterConditions.js

const formatClickHouseValue = require('./formatClickHouseValue');

/**
 * Builds ClickHouse WHERE conditions string from an array of filters.
 */
function buildFilterConditions(filters) {
  if (!filters || filters.length === 0) {
    return '';
  }

  const conditions = filters.map(filter => {
    if (!filter.property || !filter.operator) {
      console.warn('Skipping invalid filter:', filter);
      return null;
    }

    const property = `\`${filter.property}\``;
    const operator = filter.operator.toUpperCase();
    const value = filter.value;

    if (operator === 'IS NULL' || operator === 'IS NOT NULL') {
      return `${property} ${operator}`;
    }

    if (value === undefined) {
      console.warn(`Skipping filter for "${filter.property}" because value is missing.`);
      return null;
    }

    if (operator === 'IN' || operator === 'NOT IN') {
      if (!Array.isArray(value)) {
        console.warn(`Skipping filter "${filter.property}" for ${operator} because value is not an array.`);
        return null;
      }
      const formattedArray = value.map(v => formatClickHouseValue(v)).join(', ');
      return `${property} ${operator} (${formattedArray})`;
    }

    if (operator === 'LIKE' || operator === 'NOT LIKE') {
      if (typeof value !== 'string') {
        console.warn(`Skipping filter "${filter.property}" for ${operator} because value is not a string.`);
        return null;
      }
      return `${property} ${operator} ${formatClickHouseValue(value)}`;
    }

    const validOperators = ['=', '!=', '>', '<', '>=', '<=', 'ILIKE', 'NOT ILIKE'];
    if (!validOperators.includes(operator)) {
      console.warn(`Skipping filter "${filter.property}" due to invalid operator: "${operator}"`);
      return null;
    }

    return `${property} ${operator} ${formatClickHouseValue(value)}`;
  }).filter(Boolean);

  return conditions.length > 0 ? conditions.join(' AND ') : '';
}

module.exports = buildFilterConditions;
