const { services } = require("../../../services");

exports.getTop10MoviesDuration = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const response = await services.getTop10MoviesDuration(startDate, endDate);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in Top 10 Movies Duration controller: " + error,
    });
  }
};