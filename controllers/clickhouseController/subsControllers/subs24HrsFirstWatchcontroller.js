const { subs24HrsFirstWatchService } = require("../../../services/clickhouseService/subsServices/subs24HrsFirstWatchService");

exports.subs24HrsFirstWatchcontroller = async (req, res) => {
  try {
    const { filters } = req.body;

    const response = await subs24HrsFirstWatchService(filters);

    res.status(200).json(response);
  } catch (error) {
    console.log(error);
    res.status(500).json({
      success: false,
      message: `Something went wrong in Subs 24 Hours First Watch controller: ${error}`,
    });
  }
};
