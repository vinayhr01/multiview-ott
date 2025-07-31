const logger = require("../utils/logger");

const logRequestResponse = (req, res, next) => {
  const originalJson = res.json;

  res.json = function (data) {
    const logData = {
      message: "Request-Response",
      request: {
        method: req.method,
        url: req.originalUrl,
        headers: req.headers,
        body: req.body,
      },
      response: {
        statusCode: res.statusCode,
        headers: res.getHeaders(),
        body: data,
      },
    };

    logger.log({
      level: 'info',
      message: logData,
    });

    return originalJson.call(this, data);
  };

  next();
};

module.exports = logRequestResponse;
