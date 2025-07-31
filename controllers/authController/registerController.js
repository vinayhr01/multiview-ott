const { services } = require('../../services/index');

exports.registerController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await services.registerService(email, password);

    res.status(200).json({
      success: true,
      message: "Registration successful",
      data: response,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      success: false,
      message: "Something went wrong in login " + err,
    });
  }
};
