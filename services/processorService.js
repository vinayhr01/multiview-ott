const axios = require('axios');
const logger = require('../utils/logger');

// Dummy endpoints for processors
const processorEndpoints = {
  h2v: 'http://localhost:6001/h2v/start',
  // magma: 'http://localhost:6002/magma/start',
  // highlights: 'http://localhost:6003/highlights/start'
};

exports.triggerProcessors = async (jobId, streamUrl) => {
  for (const [service, endpoint] of Object.entries(processorEndpoints)) {
    try {
      await axios.post(endpoint, { jobId, streamUrl });
      logger(`${service} processor triggered`);
    } catch (err) {
      logger(`Failed to trigger ${service}`, err);
    }
  }
};
