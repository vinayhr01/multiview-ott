const { hdurationPerViewerService } = require("../../../services/clickhouseService/hdurationServices/hdurationPerViewerService");

exports.hdurationPerViewercontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await hdurationPerViewerService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Duration per viewer controller: ${error}`,
    });
  }
};
