const { hdurationInMinsService } = require("../../../services/clickhouseService/hdurationServices/hdurationInMinsService");

exports.hdurationInMinscontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await hdurationInMinsService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Duration in mins controller: ${error}`,
    });
  }
};
