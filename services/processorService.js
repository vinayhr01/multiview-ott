const axios = require('axios');
const logger = require('../utils/logger');

// Processor endpoints
const processorEndpoints = {
  // h2v: 'http://localhost:6001/h2v/start',
  // magma: 'http://localhost:6002/magma/start',
  highlights: 'http://164.52.192.2:7858/detect_highlight'
};

exports.triggerProcessors = async (jobId, streamUrl, expiry, updated_at, start) => {
  for (const [service, endpoint] of Object.entries(processorEndpoints)) {
    try {
      if (service === 'highlights') {
        await axios.post(endpoint, {
          url: streamUrl,
          job_id: jobId,
          start: start
        }, {
          headers: { 'Content-Type': 'application/json' }
        });
      } else {
        
        await axios.post(endpoint, { jobId, streamUrl, expiry, updated_at });
      }

      logger(`${service} processor triggered`);
    } catch (err) {
      logger(`Failed to trigger ${service}`, err);
    }
  }
};
