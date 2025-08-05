const jobService = require('../services/jobService');

exports.getResult = async (req, res) => {
  const { service } = req.params;
  const { jobId } = req.query;

  if (!jobId || !['h2v', 'magma', 'highlights'].includes(service)) {
    return res.status(400).json({ error: 'Invalid service ' + service });
  }

  const result = await jobService.getJobResult(jobId, service);
  if (!result) return res.status(404).json({ error: 'Job not found' });

  res.json(result);
};
