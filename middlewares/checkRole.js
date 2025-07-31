const { jwtVerify } = require("../utils/jwt");
const { pgClient1_connect } = require("../utils/postgresConnect");

exports.checkRole = async (req, res, next) => {
  try {
    if (!req.headers.authorization) {
      return res.status(401).json({
        success: false,
        message: "No token provided",
      });
    }

    const token = req.headers.authorization.split(" ")[1];
    const decoded = await jwtVerify(token);

    const client = await pgClient1_connect();

    const query = `
      SELECT * FROM user_roles
      WHERE id = $1
    `;

    const values = [decoded.role_id];

    const result = await client.query(query, values);

    const role = result.rows[0].role;

    const query2 = `
      SELECT * FROM user_details
      WHERE id = $1
    `;

    const values2 = [decoded.id];

    const result2 = await client.query(query2, values2);

    const role_id = result2.rows[0].role_id;

    if(role_id !== decoded.role_id){
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    if (req.originalUrl.includes("/admin") && role !== "admin") {
      return res.status(401).json({
        success: false,
        message: "You are not authorized to access this route",
      });
    }

    next();
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong in check role " + err,
    });
  }
};
