require("dotenv").config();
const { createClient } = require("@clickhouse/client");

const https = require("https");

// ✅ Validate required env variables
if (!process.env.CLICKHOUSE_HOST || !process.env.CLICKHOUSE_USER) {
  throw new Error("Missing ClickHouse configuration in .env file");
}

const clickhouse = createClient({
  url: process.env.CLICKHOUSE_HOST,
  username: process.env.CLICKHOUSE_USER,
  password: process.env.CLICKHOUSE_PASSWORD,
  database: process.env.CLICKHOUSE_DB || "default",
  max_open_connections: Number(process.env.CLICKHOUSE_MAX_CONNECTIONS) || 1000,
  request_timeout: Number(process.env.CLICKHOUSE_REQUEST_TIMEOUT) || 500_000,
  ping_before_query: true,

  // If certificate is self-signed or invalid
  tls: {
    rejectUnauthorized: false, // Avoid in prod
  },

  // fetch: (url, options) => {
  //   return fetch(url, {
  //     ...options,
  //     agent: new https.Agent({
  //       rejectUnauthorized: false, // disable cert check
  //     }),
  //   });
  // },
});

module.exports = clickhouse;
