// verifyOtpService.js
const { pgClient1_connect } = require("../../utils/postgresConnect");

exports.verifyOtpService = async (email, otp) => {
  const pgClient1 = await pgClient1_connect();  // ✅ this returns the real client!
  const userResult = await pgClient1.query(
    `SELECT id FROM user_details WHERE email = $1`,
    [email]
  );
  if (userResult.rowCount === 0) {
    throw new Error("User not found.");
  }
  const userId = userResult.rows[0].id;

  const otpResult = await pgClient1.query(
    `SELECT id, expires_at, used FROM password_reset_tokens
     WHERE user_id = $1 AND otp = $2
     ORDER BY created_at DESC LIMIT 1`,
    [userId, otp]
  );

  if (otpResult.rowCount === 0) throw new Error("Invalid OTP.");
  const token = otpResult.rows[0];
  if (token.used) throw new Error("OTP already used.");
  if (new Date(token.expires_at) < new Date()) throw new Error("OTP expired.");

  await pgClient1.query(
    `UPDATE password_reset_tokens SET used = TRUE WHERE id = $1`,
    [token.id]
  );

  return true;
};