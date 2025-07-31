const { updateFunnelService } = require("../../../services/clickhouseService/funnelServices/updateFunnelService");

exports.updateFunnelController = async (req, res) => {
  try {
    const userId = req.user.id;
    const { id, name, steps, timeWindow, startTime, endTime } = req.body;

    // ✅ Validate Funnel ID
    if (!id) {
      return res.status(400).json({
        success: false,
        message: "Funnel ID is required for update."
      });
    }

    // ✅ Validate steps if provided
    if (steps !== undefined) {
      if (!Array.isArray(steps) || steps.length < 2) {
        return res.status(400).json({
          success: false,
          message: "Steps must be an array with at least 2 elements if provided."
        });
      }
      for (const step of steps) {
        if (!step.eventName || typeof step.eventName !== "string") {
          return res.status(400).json({
            success: false,
            message: "Each step must have a valid eventName (string)."
          });
        }
        if (step.filters && !Array.isArray(step.filters)) {
          return res.status(400).json({
            success: false,
            message: "Step filters must be an array if provided."
          });
        }
      }
    }

    // ✅ Call the service
    const updatedFunnel = await updateFunnelService({
      body: { id, name, steps, timeWindow, startTime, endTime },
      user: { id: userId }
    });

    return res.status(200).json({
      success: true,
      message: "Funnel updated successfully.",
      data: updatedFunnel
    });

  } catch (err) {
    console.error("Controller Error (updateFunnel):", err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || "Failed to update funnel."
    });
  }
};
