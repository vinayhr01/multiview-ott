const { searchFiltersService } = require("../../../services/clickhouseService/searchFiltersService/searchFiltersService");

exports.searchController = async (req, res) => {
  const filter_type = req.params.filter_type;

  try {
    const { keyword } = req.body;

    const result = await searchFiltersService(keyword, filter_type);

    return res.json(result);
  } catch (error) {
    console.error(`Error fetching ${filter_type} default data`, error);
    res.status(500).json({ error: "Internal Server Error " + error });
  }
};