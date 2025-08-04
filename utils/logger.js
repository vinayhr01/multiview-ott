module.exports = (message, err = null) => {
  console.log(`[${new Date().toISOString()}] ${message}`);
  if (err) console.error(err);
};
