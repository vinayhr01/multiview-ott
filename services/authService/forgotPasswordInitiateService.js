// forgotPasswordInitiateService.js
const { pgClient1_connect } = require("../../utils/postgresConnect");

exports.forgotPasswordInitiateService = async (email) => {
  const pgClient1 = await pgClient1_connect();
  try {
    // 1️⃣ Check if user exists
    const userResult = await pgClient1.query(
      `SELECT id FROM user_details WHERE email = $1`,
      [email]
    );
    if (userResult.rowCount === 0) {
      throw new Error("User not found.");
    }
    const userId = userResult.rows[0].id;

    // 2️⃣ Generate OTP & expiry
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

    // 3️⃣ UPSERT with used = FALSE
    await pgClient1.query(
      `
      INSERT INTO password_reset_tokens (user_id, otp, expires_at, used)
      VALUES ($1, $2, $3, FALSE)
      ON CONFLICT (user_id)
      DO UPDATE SET otp = $2, expires_at = $3, used = FALSE;
      `,
      [userId, otp, expiresAt]
    );

    return otp;
  } finally {
    // await pgClient1.end();  // ✅ Always close the client if needed
  }
};
