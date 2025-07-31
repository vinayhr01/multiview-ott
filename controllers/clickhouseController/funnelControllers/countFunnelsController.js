const { countFunnelsService } = require("../../../services/clickhouseService/funnelServices/countFunnelsService");


exports.countFunnelsController = async (req, res) => {
  try {
    const funnelId = req.body.id;
    const userId = req.user.id?.toString();

    const response = await countFunnelsService({ funnelId, userId });

    res.status(response.statusCode || 200).json(response.body);
  } catch (error) {
    console.error("❌ Controller Error (countFunnels):", error);
    res.status(500).json({ error: "Internal server error in controller." });
  }
};
