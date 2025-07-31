const clickhouse = require("../config/clickhouse.config");

exports.queryClickHouse = async(query, params = {}) => {

  try {
    const response = await clickhouse.query({
      query,
      format: "JSON",
      query_params: params,
    });

    const result = await response.json();
    return result.data;
  } catch (error) {
    console.error("ClickHouse Query Error:", error);
    throw error;
  }
}