require("dotenv").config();
const { Pool } = require("pg");

// Local PostgreSQL (DB1)
const pgClient1 = new Pool({
  host: process.env.POSTGRES1_HOST,
  port: process.env.POSTGRES1_PORT,
  user: process.env.POSTGRES1_USER,
  password: process.env.POSTGRES1_PASSWORD,
  database: process.env.POSTGRES1_DB,
});

// AWS RDS PostgreSQL (DB2)
const pgClient2 = new Pool({
  host: process.env.POSTGRES2_HOST,
  port: process.env.POSTGRES2_PORT,
  user: process.env.POSTGRES2_USER,
  password: process.env.POSTGRES2_PASSWORD,
  database: process.env.POSTGRES2_DB,
  ssl: {
    rejectUnauthorized: false, // Required for AWS RDS unless you provide CA certs
  },
});

module.exports = {
  pgClient1,
  pgClient2,
};