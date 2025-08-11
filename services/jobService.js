const Job = require('../models/Job');

exports.createJob = async (streamUrl, started) => {
  const ttl = parseInt(process.env.JOB_TTL_SECONDS || '3600');
  const now = new Date();
  const ttlExpiresAt = new Date(now.getTime() + ttl * 1000);

  const job = new Job({ streamUrl, started, ttlExpiresAt });
  return await job.save();
};

exports.updateJobResult = async (jobId, service, data, status) => {
  const update = {
    $set: {
      [`results.${service}`]: data,
      [`status.${service}`]: status || 'completed'
    },
  };
  return { job: await Job.findByIdAndUpdate(jobId, update, { new: true }), data: data, service: service };
};

exports.getJobResult = async (jobId, service) => {
  const job = await Job.findById(jobId);
  if (!job) return null;

  const now = new Date();
  const ttl = parseInt(process.env.JOB_TTL_SECONDS || '3600');
  const expiryTime = job.ttlExpiresAt || new Date(job.createdAt.getTime() + ttl * 1000);
  const ttlRemaining = Math.max(0, Math.floor((expiryTime - now) / 1000));

  return {
    status: job.status[service],
    result: job.results[service] || null,
    createdAt: job.createdAt,
    updatedAt: job.updatedAt,
    ttlRemaining,
    ttlExpiresAt: expiryTime
  };
};
