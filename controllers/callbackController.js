const jobService = require("../services/jobService");
const updatesService = require("../services/updatesService");

exports.receiveCallback = async (req, res) => {
  const { jobId, service, data } = req.body;

  if (!jobId || !service || !data) {
    return res.status(400).json({ error: "Invalid callback data" });
  }

  try {
    const { job } = await jobService.updateJobResult(jobId, service, data);

    if (!job) return res.status(404).json({ error: "Job not found" });

        updatesService.sendUpdate(jobId, {
      service,
      status: job?.status[service],
      result: job?.results[service],
      updatedAt: job?.updatedAt,
      ttlRemaining: Math.max(
        0,
        Math.floor((new Date(job?.ttlExpiresAt) - new Date()) / 1000)
      ),
      ttlExpiresAt: job?.ttlExpiresAt,
    });

    res.json({
      message: "Callback received",
      data: job?.results[service],
      status: job?.status[service],
      updatedAt: job?.updatedAt,
      service: job?.service,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal error " + err });
  }
};
