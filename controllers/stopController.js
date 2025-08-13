const jobService = require('../services/jobService');
const processorService = require('../services/processorService');

exports.stopController = async (req, res) => {
  try {
    const { streamUrl, started, jobId } = req.body;

    if (!streamUrl || typeof started !== "boolean" || !jobId || started !== false) {
      return res.status(400).json({ error: "Invalid payload, ensure started field to be false" });
    }

    const job = await jobService.getJobResult(jobId, 'highlights');

    await processorService.stopTriggerProcess(job._id, streamUrl, job.ttlExpiresAt, job.updatedAt, started);

    res.status(200).json({ message: "Stream stopped successfully" });
  } catch (err) {
    console.error("Error stopping stream:", err);
    res.status(500).json({ error: "Failed to stop stream" });
  }
};
