const jobService = require("../services/jobService");
const updatesService = require("../services/updatesService");

exports.receiveCallback = async (req, res) => {
  const { jobId, service, data, status } = req.body;

  if (!jobId || !service || !data) {
    return res.status(400).json({ error: "Invalid callback data" });
  }

  try {
    const { job } = await jobService.updateJobResult(jobId, service, data, status);

    if (!job) return res.status(404).json({ error: "Job not found" });

    console.log("Job is ", job);

        updatesService.sendUpdate(jobId, {
      service: job?.service,
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
      jobId: jobId,
      data: job?.results[service],
      status: job?.status[service],
      updatedAt: job?.updatedAt,
      createdAt: job?.createdAt,
      expiry: job?.ttlExpiresAt,
      time_remain: Math.max(
        0,
        Math.floor((new Date(job?.ttlExpiresAt) - new Date()) / 1000)
      ),
      service: service,
    });
  } catch (err) {
    res.status(500).json({ error: "Internal error " + err });
  }
};
