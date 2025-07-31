const { hviewsService } = require("../../../services/clickhouseService/huserViewServices/hviewsService");

exports.hviewscontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await hviewsService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Views controller: ${error}`,
    });
  }
};
