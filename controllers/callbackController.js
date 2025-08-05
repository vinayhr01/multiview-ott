const jobService = require('../services/jobService');

exports.receiveCallback = async (req, res) => {
  const { jobId, service, data } = req.body;

  if (!jobId || !service || !data) {
    return res.status(400).json({ error: 'Invalid callback data' });
  }

  try {
    const { job, data, service } = await jobService.updateJobResult(jobId, service, data);
    if (!job) return res.status(404).json({ error: 'Job not found' });

    res.json({ message: 'Callback received', data: data, service: service });
  } catch (err) {
    res.status(500).json({ error: 'Internal error' });
  }
};
