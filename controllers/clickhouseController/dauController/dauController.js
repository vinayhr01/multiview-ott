const { dauService } = require("../../../services/clickhouseService/dauService/dauService");

exports.dauController = async (req, res) => {
  let platform = ""; 
  try {
    const { startDate, endDate, platform: reqPlatform } = req.body;
    platform = reqPlatform;

    const response = await dauService(startDate, endDate, platform);

        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: `Something went wrong in ${req?.body?.platform} dau controller ` + error,
        });
    }
}