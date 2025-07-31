const { overallPaidService } = require("../../../services/clickhouseService/freePaidService/overallPaidService");

exports.overallPaidController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await overallPaidService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getOverallPaid:", error);
    res.status(500).json({ error: error.message });
  }
};
