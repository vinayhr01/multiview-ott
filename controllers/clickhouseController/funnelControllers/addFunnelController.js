const { addFunnelService } = require("../../../services/clickhouseService/funnelServices/addFunnelService");

exports.addFunnelController = async (req, res) => {
  try {
    const { name, steps, timeWindow, startTime, endTime } = req.body;
    const userId = req.user.id;
    // console.log(userId); 

    // ✅ Input validation
    // if (!name || !steps || !Array.isArray(steps) || steps.length < 2 || !timeWindow) {
    //   return res.status(400).json({
    //     success: false,
    //     message: 'Missing required fields: name, steps (with >= 2 items), and timeWindow.'
    //   });
    // }

    for (const step of steps) {
      if (!step.eventName || typeof step.eventName !== 'string') {
        return res.status(400).json({ success: false, message: 'Each step must have a valid eventName (string).' });
      }
      if (step.filters && !Array.isArray(step.filters)) {
        return res.status(400).json({ success: false, message: 'Step filters must be an array.' });
      }
    }

    // ✅ Call the service
    const createdFunnel = await addFunnelService({ userId, name, steps, timeWindow, startTime, endTime });

    return res.status(201).json({
      success: true,
      message: 'Funnel created successfully.',
      data: createdFunnel
    });

  } catch (error) {
    console.error("Controller Error (addFunnel):", error);
    res.status(500).json({ success: false, message: 'Failed to create funnel.' });
  }
};
