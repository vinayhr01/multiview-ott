const { dropoffUsersService } = require("../../../services/clickhouseService/funnelServices/dropoffUsersService");

exports.dropoffUsersController = async (req, res) => {
  try {
    const { id: funnelId, dropoffStepIndex } = req.body;
    const userId = req.user.id;

    if (typeof dropoffStepIndex !== 'number' || dropoffStepIndex < 1) {
      return res.status(400).json({ success: false, message: 'Invalid dropoffStepIndex. Must be a number >= 1.' });
    }

    const result = await dropoffUsersService({ funnelId, dropoffStepIndex, userId });

    res.status(200).json(result);
  } catch (error) {
    console.error("Dropoff Users Controller Error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

