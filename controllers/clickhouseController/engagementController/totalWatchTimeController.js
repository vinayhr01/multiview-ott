const { totalWatchTimeService } = require("../../../services/clickhouseService/engagementService/totalWatchTimeService");

exports.totalWatchTimeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await totalWatchTimeService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTotalWatchTime:", error);
    res.status(500).json({ error: error.message });
  }
};
