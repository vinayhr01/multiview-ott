const mongoose = require('mongoose');

const jobTTL = parseInt(process.env.JOB_TTL_SECONDS || '3600');

const jobSchema = new mongoose.Schema(
  {
    streamUrl: {
      type: mongoose.Schema.Types.Mixed, // can be String or Array
      validate: {
        validator: function (value) {
          return (
            typeof value === 'string' ||
            (Array.isArray(value) && value.every(v => typeof v === 'string'))
          );
        },
        message: 'streamUrl must be a string or an array of strings'
      }
    },
    started: Boolean,
    results: {
      h2v: Object,
      magma: Object,
      highlights: Object
    },
    status: {
      h2v: { type: String, default: 'pending' },
      magma: { type: String, default: 'pending' },
      highlights: { type: String, default: 'pending' }
    },
    ttlExpiresAt: Date
  },
  {
    timestamps: true
  }
);

// TTL Index on createdAt (auto-delete)
jobSchema.index({ createdAt: 1 }, { expireAfterSeconds: jobTTL });

module.exports = mongoose.model('Job', jobSchema);