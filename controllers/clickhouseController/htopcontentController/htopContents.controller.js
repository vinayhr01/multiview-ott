const { htopContentsService } = require("../../../services/clickhouseService/htopcontentServices/htopContents.service");

exports.hgetTopContents = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;
    const respone = await htopContentsService(startDate, endDate, filters);
    res.status(200).json(respone);
  } catch (error) {
    console.error('Error in getTopContents:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};