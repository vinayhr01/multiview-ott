const { htopCitiesService } = require("../../../services/clickhouseService/htopcontentServices/htopCities.service");

exports.hgetTopCities = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;
    const respone = await htopCitiesService(startDate, endDate, filters);
    res.status(200).json(respone);
  } catch (error) {
    console.error('Error in getTopCities:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
