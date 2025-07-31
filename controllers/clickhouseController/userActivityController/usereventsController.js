const { usereventsService } = require("../../../services/clickhouseService/userActivityServices/usereventsService");

exports.userevents = async (req, res) => {
  try {
    const { u_id, phone_number } = req.body;

    if (!u_id && !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Either u_id or phone_number must be provided',
      });
    }

    const data = await usereventsService({ u_id, phone_number });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in userdata:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
