const { totalActiveUsersService } = require("../../../services/clickhouseService/engagementService/totalActiveUsersService");

exports.totalActiveUsersController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await totalActiveUsersService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getTotalActiveUsers:", error);
    res.status(500).json({ error: error.message });
  }
};
