const { pgClient1_connect } = require("../../utils/postgresConnect");

exports.updateRoleService = async (email, role) => {
  try {
    const client = await pgClient1_connect();

    const query1 = `
      SELECT * FROM user_details
      WHERE email = $1
    `;

    const values1 = [email];

    const result1 = await client.query(query1, values1);

    if (result1.rows.length === 0) {
      throw new Error("User not found");
    }

    const query3 = `
      SELECT * FROM user_roles
      WHERE role = $1
    `;

    const values3 = [role];

    const result3 = await client.query(query3, values3);

    if (result3.rows.length === 0) {
      throw new Error("Role not found");
    }

    const query2 = `
      UPDATE user_details
      SET role_id = $1
      WHERE email = $2
      RETURNING *
    `;

    const values2 = [result3.rows[0].id, email];

    const result2 = await client.query(query2, values2);

    return result2.rows[0];
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.getRoleService = async () => {
  try {
    const client = await pgClient1_connect();

    const query = `
      SELECT * FROM user_roles
    `;

    const result = await client.query(query);

    return result.rows;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

exports.listUsersService = async () => {
  try {
    const client = await pgClient1_connect();

    const query = `
      SELECT email, (SELECT role FROM user_roles WHERE id = role_id) AS role, created_at, updated_at FROM user_details
    `;

    const result = await client.query(query);

    return result.rows;
  } catch (err) {
    console.log(err);
    throw err;
  }
};