const { getFunnelByIdService } = require("../../../services/clickhouseService/funnelServices/getFunnelByIdService");

exports.getFunnelByIdController = async (req, res) => {
  try {
    const data = await getFunnelByIdService(req.body.id, req.user.id);
    return res.json(data);
  } catch (error) {
    console.error("Get Funnel ID Error:", error);
    return res.status(500).json({ error: error.message || "Failed to fetch funnel." });
  }
};
