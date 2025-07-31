const { services } = require("../../../services");

exports.getGenreWiseCompletion = async (req, res) => {
  try {
    const { startDate, endDate } = req.body;
    const response = await services.getGenreWiseCompletion(startDate, endDate);
    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: "Something went wrong in Genre Wise Completion controller: " + error,
    });
  }
};