const updatesService = require("../services/updatesService");
exports.getUpdates = async (req, res) => {
  try {
    const { jobId } = req.params;

    if (!jobId) return res.status(400).json({ error: "Invalid jobId" });

    // Set headers for SSE (Server Sent Events)
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    // Register client
    updatesService.addClient(jobId, res);

    req.on("close", () => {
      updatesService.removeClient(jobId, res);
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Internal error " + err });
  }
};
