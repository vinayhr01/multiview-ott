const { subsFirstWatchService } = require("../../../services/clickhouseService/subsServices/subsFirstWatchService");

exports.subsFirstWatchcontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await subsFirstWatchService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Subs First Watch controller: ${error}`,
    });
  }
};
