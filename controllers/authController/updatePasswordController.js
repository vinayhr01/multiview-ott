// updatePasswordController.js
const { updatePasswordService} = require("../../services/authService/updatePasswordService");

exports.updatePasswordController = async (req, res) => {
  try {
    const { email, newPassword } = req.body;
    await updatePasswordService(email, newPassword);

    res.json({ message: "Password updated successfully." });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};
