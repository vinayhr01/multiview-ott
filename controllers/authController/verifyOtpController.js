// verifyOtpController.js
const { verifyOtpService} = require("../../services/authService/verifyOtpService");

exports.verifyOtpController = async (req, res) => {
  try {
    console.log("Verifying OTP...");
    const { email, otp } = req.body;
    await verifyOtpService(email, otp);

    res.json({ message: "OTP verified successfully." });
  } catch (error) {
    console.error("Error verifying OTP:", error);
    res.status(400).json({ error: error.message });
  }
};
