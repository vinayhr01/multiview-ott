const { nonDropoffUsersService } = require("../../../services/clickhouseService/funnelServices/nonDropoffUsersService");

exports.nonDropoffUsersController = async (req, res) => {
  try {
    const { id: funnelId, targetStepIndex } = req.body;
    const userId = req.user.id;

    if (typeof targetStepIndex !== "number" || targetStepIndex < 1) {
      return res.status(400).json({ success: false, message: "Invalid targetStepIndex. Must be >= 1." });
    }

    const result = await nonDropoffUsersService({ funnelId, targetStepIndex, userId });

    res.status(200).json(result);
  } catch (error) {
    console.error("Non-Dropoff Users Controller Error:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};
