const { getColumnNamesService } = require("../../../services/clickhouseService/funnelServices/getColumnNamesService");
exports.getColumnNamesController = async (req, res) => {
  try {
    const response = await getColumnNamesService();
    return res.json(response);
  } catch (error) {
    console.error("❌ [Controller] Error:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`
    });
  }
};
