function parseTimeWindow(timeWindowStr) {
  const parts = timeWindowStr.split(' ');
  if (
    parts.length !== 2 ||
    isNaN(parseInt(parts[0])) ||
    ![
      'hour', 'hours',
      'day', 'days',
      'minute', 'minutes',
      'second', 'seconds',
      'week', 'weeks',
      'month', 'months'
    ].includes(parts[1].toLowerCase())
  ) {
    return null; // Invalid format
  }

  const value = parseInt(parts[0]);
  const unit = parts[1].toUpperCase().replace(/S$/, ''); // Remove trailing 's'

  return { value, unit };
}

module.exports = parseTimeWindow;