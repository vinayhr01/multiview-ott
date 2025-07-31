const { useractivityService } = require("../../../services/clickhouseService/userActivityServices/useractivityService");

exports.useractivity = async (req, res) => {
  try {
    const { user_id, phone_number, page, pageSize } = req.body;

    if (!user_id && !phone_number) {
      return res.status(400).json({
        success: false,
        message: 'Either user_id or phone_number must be provided',
      });
    }

    // Ensure page and pageSize are integers and default if needed
    const pageNumber = Number.isInteger(page) && page > 0 ? page : 1;
    const pageLimit = Number.isInteger(pageSize) && pageSize > 0 ? pageSize : 30;

    const data = await useractivityService({
      user_id,
      phone_number,
      page: pageNumber,
      pageSize: pageLimit,
    });

    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error('Error in useractivity:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
