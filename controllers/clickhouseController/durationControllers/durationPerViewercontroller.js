const { durationPerViewerService } = require("../../../services/clickhouseService/durationServices/durationPerViewerService");

exports.durationPerViewercontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await durationPerViewerService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Duration per viewer controller: ${error}`,
    });
  }
};
