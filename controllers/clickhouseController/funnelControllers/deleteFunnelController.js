const { deleteFunnelService } = require("../../../services/clickhouseService/funnelServices/deleteFunnelService");

exports.deleteFunnelController = async (req, res) => {
  try {
    const funnelId = req.body.id;
    const userId = req.user.id?.toString();

    const response = await deleteFunnelService({ funnelId, userId });

    return res.status(response.statusCode || 200).json(response.body);
  } catch (error) {
    console.error("❌ Controller Error (deleteFunnel):", error);
    res.status(500).json({ error: "Internal server error in controller." });
  }
};
