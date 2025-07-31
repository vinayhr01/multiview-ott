const { freeUserMinService } = require("../../../services/clickhouseService/freePaidService/freeUserMinService");

exports.freeUserMinController = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const result = await freeUserMinService(startDate, endDate);
    res.status(200).json(result);
  } catch (error) {
    console.error("Error in getFreeUserMin:", error);
    res.status(500).json({ error: error.message });
  }
};
