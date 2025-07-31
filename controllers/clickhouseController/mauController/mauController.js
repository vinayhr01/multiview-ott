const { mauService } = require("../../../services/clickhouseService/mauService/mauService");

exports.mauController = async (req, res) => {
    let platform = "";
    try {
        const { startDate, endDate, platform: reqPlatform } = req.body;
        platform = reqPlatform;
        const response = await mauService(startDate, endDate, platform);

        res.status(200).json(response);
    }
    catch (error) {
        console.log(error);
        res.status(500).json({
            success: false,
            message: `Something went wrong in ${req?.body?.platform} mau controller ` + error,
        });
    }
}