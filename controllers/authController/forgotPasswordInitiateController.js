const {forgotPasswordInitiateService} = require("../../services/authService/forgotPasswordInitiateService");

const { sendOtpMail } = require("../../utils/mailer");

exports.forgotPasswordInitiateController = async (req, res) => {
  try {
    const { email } = req.body;

    // 1. Generate OTP (your service should do this)
    const otp = await forgotPasswordInitiateService(email);

    // 2. Send the OTP email
    await sendOtpMail(email, otp);

    // console.log(`✅ Generated OTP for ${email}: ${otp}`);
    res.json({ message: `OTP sent to ${email}.` });
  } catch (error) {
    console.error("❌ Error:", error.message);
    res.status(400).json({ error: error.message });
  }
};
