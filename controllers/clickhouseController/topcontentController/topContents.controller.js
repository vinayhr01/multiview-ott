const { topContentsService } = require("../../../services/clickhouseService/topcontentServices/topContents.service");

exports.getTopContents = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body; // POST request body
    const response = await topContentsService(startDate, endDate, filters);
    res.status(200).json(response);
  } catch (error) {
    console.error('Error in getTopContents:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};