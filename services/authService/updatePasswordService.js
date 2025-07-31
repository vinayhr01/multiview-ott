// updatePasswordService.js
const bcrypt = require("bcrypt");
const { pgClient1_connect } = require("../../utils/postgresConnect");

exports.updatePasswordService = async (email, newPassword) => {
  const pgClient1 = await pgClient1_connect();  // ✅ this returns the real client!
  const userResult = await pgClient1.query(
    `SELECT id FROM user_details WHERE email = $1`,
    [email]
  );
  if (userResult.rowCount === 0) {
    throw new Error("User not found.");
  }
  const userId = userResult.rows[0].id;

  const tokenResult = await pgClient1.query(
    `SELECT id FROM password_reset_tokens
     WHERE user_id = $1 AND used = TRUE AND expires_at > NOW()
     ORDER BY created_at DESC LIMIT 1`,
    [userId]
  );
  if (tokenResult.rowCount === 0) {
    throw new Error("No valid verified OTP found.");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);

  await pgClient1.query(
    `UPDATE user_details SET password = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2`,
    [hashedPassword, userId]
  );

  return true;
};
