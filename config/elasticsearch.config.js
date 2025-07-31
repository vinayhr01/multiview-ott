require("dotenv").config();
const axios = require("axios");

const elasticsearchClient = axios.create({
  baseURL: process.env.ELASTICSEARCH_HOST,  // e.g. http://10.0.3.129:9301
  auth: {
    username: process.env.ELASTICSEARCH_USER,
    password: process.env.ELASTICSEARCH_PASSWORD,
  },
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

module.exports = elasticsearchClient;