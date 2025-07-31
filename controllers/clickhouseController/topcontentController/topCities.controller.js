const { topCitiesService } = require("../../../services/clickhouseService/topcontentServices/topCities.service");

exports.getTopCities = async (req, res) => {
  try {
    const { startDate, endDate, filters } = req.body;
    const response = await topCitiesService(startDate, endDate, filters);
    
    res.status(200).json(response); 
  } catch (error) {
    console.error('Error in getTopCities:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};
