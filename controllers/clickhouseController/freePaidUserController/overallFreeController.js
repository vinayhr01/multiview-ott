const { overallFreeService } = require("../../../services/clickhouseService/freePaidService/overallFreeService");

exports.overallFreeController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await overallFreeService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getOverallFree:", error);
    res.status(500).json({ error: error.message });
  }
};
