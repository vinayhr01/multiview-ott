const { getEventNamesService } = require("../../../services/clickhouseService/funnelServices/getEventNamesService");

exports.getEventNamesController = async (req, res) => {
  try {
    const result = await getEventNamesService();
    return res.status(200).json(result);
  } catch (error) {
    console.error("❌ [Controller] Error in getEventNamesController:", error);
    return res.status(500).json({
      success: false,
      message: `Something went wrong: ${error.message}`,
    });
  }
};

