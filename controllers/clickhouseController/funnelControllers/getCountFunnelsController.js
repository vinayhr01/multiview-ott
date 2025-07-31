const getCountFunnelsService = require("../../../services/clickhouseService/funnelServices/getCountFunnelsService");

exports.getCountFunnelsController = async (req, res) => {
  try {
    const { name, steps, timeWindow, startTime, endTime } = req.body;
    const userId = req.user?.id; // optional if needed

    const funnelData = await getCountFunnelsService({
      name,
      steps,
      timeWindow,
      startTime,
      endTime,
      userId
    });

    res.json(funnelData);
  } catch (err) {
    console.error("❌ Funnel Controller Error:", err.message || err);
    res.status(400).json({ error: err.message || "Internal server error" });
  }
};
