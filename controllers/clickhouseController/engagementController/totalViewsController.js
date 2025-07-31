const { totalViewsService } = require("../../../services/clickhouseService/engagementService/totalViewsService");

exports.totalViewsController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await totalViewsService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTotalViews:", error);
    res.status(500).json({ error: error.message });
  }
};
