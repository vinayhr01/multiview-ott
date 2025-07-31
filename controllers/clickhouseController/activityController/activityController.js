const { activeLast1HourService } = require("../../../services/clickhouseService/activityServices/activeLast1HourService");
const { activeLast30MinService } = require("../../../services/clickhouseService/activityServices/activeLast30MinService");
const { activeLast6HoursService } = require("../../../services/clickhouseService/activityServices/activeLast6HoursService");
const { activeService } = require("../../../services/clickhouseService/activityServices/activeService");


exports.activityController = async (req, res) => {
  const { period } = req.params;
  // console.log(`Received request for activity data for period: ${period}`);

  try {
    let result;

    switch (period) {
      case '30m':
        result = await activeLast30MinService(req.body);
        break;
      case '1h':
        result = await activeLast1HourService(req.body);
        break;
      case '6h':
        result = await activeLast6HoursService(req.body);
        break;
      default:
        result = await activeService(req.body);
    }

    res.json(result);

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
};
