const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, printf, colorize } = format;

const fileLogFormat = combine(
    timestamp(),
    printf(({ level, message, timestamp }) => {
        const istTimestamp = new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
        const logMessage = JSON.stringify(message, null, 2);
        return `--- Log Entry: ${istTimestamp} ---\n[${level.toUpperCase()}]:\n${logMessage}\n`;
    })
);

const logger = winston.createLogger({
  level: 'info',
  format: fileLogFormat,
  transports: [
    new winston.transports.File({ filename: './logs/error.log', level: 'error' }),
    new winston.transports.File({ filename: './logs/combined.log' }),
  ],
});


logger.add(new winston.transports.Console({
  format: combine(
      timestamp(),
      colorize(),
      printf(({ level, message, timestamp }) => {
          const istTimestamp = new Date(timestamp).toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' });
          const coreMessage = (message && message.message) ? message.message : 'No message';
          const requestInfo = (message && message.request) ? `${message.request.method} ${message.request.url}` : '';
          return `${istTimestamp} [${level}]: ${coreMessage} ${requestInfo}`;
      })
  ),
}));


module.exports = logger;

