const { services } = require('../../services/index');

exports.loginController = async (req, res) => {
  try {
    const { email, password } = req.body;

    const response = await services.loginService(email, password);

    res.status(200).json({
      success: true,
      message: "Login successful",
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