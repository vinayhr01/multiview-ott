const { getFunnelsService } = require("../../../services/clickhouseService/funnelServices/getFunnelsService");

exports.getFunnelsController = async (req, res) => {
  try {
    const data = await getFunnelsService(req.user.id);
    res.status(200).json(data); // You can also wrap it with { success: true, data }
  } catch (error) {
    console.error("Get Funnels Error:", error);
    res.status(500).json({ error: error.message || "Failed to fetch funnels." });
  }
};
