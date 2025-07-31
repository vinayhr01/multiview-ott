const { pgClient1, pgClient2 } = require("../config/postgres.config");

// Connect and return the client
exports.pgClient1_connect = async () => {
  try {
    if (pgClient1._connected !== true) {
      await pgClient1.connect();
      console.log("Connected to Local PostgreSQL");
    }
    return pgClient1;
  } catch (err) {
    console.error("PGClient1 connection error", err);
    throw err;
  }
};

// Connect and return the client
exports.pgClient2_connect = async () => {
  try {
    if (pgClient2._connected !== true) {
      await pgClient2.connect();
      console.log("Connected to AWS RDS");
    }
    return pgClient2;
  } catch (err) {
    console.error("PGClient2 connection error", err);
    throw err;
  }
};
