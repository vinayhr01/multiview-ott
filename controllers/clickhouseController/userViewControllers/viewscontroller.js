const { viewsService } = require("../../../services/clickhouseService/userViewServices/viewsService");

exports.viewscontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await viewsService(startDate, endDate, filters );

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Views controller: ${error}`,
    });
  }
};
