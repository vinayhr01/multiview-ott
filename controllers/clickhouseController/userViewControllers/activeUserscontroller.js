const { activeUsersService } = require("../../../services/clickhouseService/userViewServices/activeUsersService");

exports.activeUserscontroller = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;

    const response = await activeUsersService(startDate, endDate, filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Active Users controller: ${error}`,
    });
  }
};
