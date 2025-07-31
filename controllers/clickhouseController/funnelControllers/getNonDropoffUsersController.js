// const { getNonDropoffUsersService } = require("../../../services/clickhouseService/funnelServices/getNonDropoffUsersService");

// exports.getNonDropoffUsersController = async (req, res) => {
//   try {const { name, steps, timeWindow, startTime, endTime } = req.body;
//       const userId = req.user.id;
  
//       const result = await getNonDropoffUsersService({ name, steps, timeWindow, startTime, endTime, userId });
  
//       res.status(200).json(result);
//   } catch (error) {
//     console.error("Controller Error - Non-Dropoff Users:", error);
//     return res.status(500).json({
//       success: false,
//       message: "Internal server error while fetching non-dropoff users.",
//     });
//   }
// };

const { getNonDropoffUsersService } = require("../../../services/clickhouseService/funnelServices/getNonDropoffUsersService");

exports.getNonDropoffUsersController = async (req, res) => {
  try {
    const { name, steps, timeWindow, startTime, endTime, targetStepIndex } = req.body;
    const userId = req.user.id;

    const result = await getNonDropoffUsersService({
      name, steps, timeWindow, startTime, endTime, targetStepIndex, userId
    });

    res.status(200).json(result);
  } catch (error) {
    console.error("Controller Error - Non-Dropoff Users:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error while fetching non-dropoff users.",
    });
  }
};
