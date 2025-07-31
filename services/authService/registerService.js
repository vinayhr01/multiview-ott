const bcrypt = require("bcryptjs");
const { pgClient1_connect } = require("../../utils/postgresConnect");
const { jwtSign } = require("../../utils/jwt");

exports.registerService = async (email, password) => {
  try {
    const client = await pgClient1_connect();

    const query1 = `
      SELECT * FROM user_details
      WHERE email = $1
    `;

    const values1 = [email];

    const result1 = await client.query(query1, values1);

    if (result1.rows.length > 0) {
      throw new Error("User already exists");
    }

    const hashedPassword = bcrypt.hashSync(password, 10);

    const query2 = `
      INSERT INTO user_details (email, password, role_id)
      VALUES ($1, $2, (SELECT id FROM user_roles WHERE role = 'user')) RETURNING *;
    `;

    const values2 = [email, hashedPassword];

    const result2 = await client.query(query2, values2);

    const user = result2.rows[0];

    const query3 = `
      SELECT * FROM user_details
      WHERE email = $1
      `;

    const values3 = [email];

    const result3 = await client.query(query3, values3);

    const user3 = result3.rows[0];

    const token = await jwtSign(user3);

    return token;
  } catch (err) {
    console.log(err);
    throw err;
  }
};
