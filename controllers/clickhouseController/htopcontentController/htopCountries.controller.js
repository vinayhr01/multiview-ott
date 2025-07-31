const { htopCountriesService } = require("../../../services/clickhouseService/htopcontentServices/htopCountries.service");

exports.hgetTopCountries = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;
    const respone = await htopCountriesService(startDate, endDate, filters);
    res.status(200).json(respone);
  } catch (error) {
    console.error('Error in getTopCountries:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
