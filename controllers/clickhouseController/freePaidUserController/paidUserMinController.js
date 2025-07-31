const { paidUserMinService } = require("../../../services/clickhouseService/freePaidService/paidUserMinService");


exports.paidUserMinController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await paidUserMinService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getPaidUserMin:", error);
    res.status(500).json({ error: error.message });
  }
};
