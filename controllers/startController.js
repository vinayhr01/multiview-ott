const jobService = require('../services/jobService');
const processorService = require('../services/processorService');

exports.startStream = async (req, res) => {
  const { streamUrl, started } = req.body;
  if (!streamUrl || typeof started !== 'boolean') {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const job = await jobService.createJob(streamUrl, started);
  await processorService.triggerProcessors(job._id, streamUrl, job.ttlExpiresAt, job.updatedAt);

  res.json({ message: 'Processing started', jobId: job._id, expiry: job.ttlExpiresAt, updated_at: job.updatedAt });
};
