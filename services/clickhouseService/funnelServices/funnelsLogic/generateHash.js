const crypto = require("crypto");

function generateHash(...args) {
  return crypto
    .createHash("sha256")
    .update(JSON.stringify(args))
    .digest("hex");
}

module.exports = generateHash;