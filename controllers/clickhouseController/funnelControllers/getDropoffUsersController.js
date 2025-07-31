const { getDropoffUsersService } = require("../../../services/clickhouseService/funnelServices/getDropoffUsersService");

exports.getDropoffUsersController = async (req, res) => {
  try {
    const { name, steps, timeWindow, startTime, endTime, dropoffStepIndex } = req.body;
    const userId = req.user.id;

    const result = await getDropoffUsersService({
      name,
      steps,
      timeWindow,
      startTime,
      endTime,
      dropoffStepIndex,
      userId
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error in getDropoffUsers:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Internal server error."
    });
  }
};
