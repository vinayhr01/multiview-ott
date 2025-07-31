const { pgClient1_connect } = require("../../utils/postgresConnect");
const bcrypt = require("bcryptjs");
const { jwtSign } = require("../../utils/jwt");

exports.loginService = async (email, password) => {
  try {
    const client = await pgClient1_connect();

    const query = `
      SELECT * FROM user_details
      WHERE email = $1
    `;

    const values = [email];

    const result = await client.query(query, values);

    if (result.rows.length === 0) {
      throw new Error("User not found");
    }

    const user = result.rows[0];

    if (!bcrypt.compareSync(password, user.password)) {
      throw new Error("Invalid password");
    }

    const token = await jwtSign(user);

    return token;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
