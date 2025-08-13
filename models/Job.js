const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    streamUrl: {
      type: mongoose.Schema.Types.Mixed, // can be String, Object, or Array
      validate: {
        validator: function (value) {
          return (
            typeof value === "string" ||
            (value && typeof value === "object" && !Array.isArray(value)) ||
            (Array.isArray(value) &&
              value.every(
                (v) =>
                  typeof v === "string" ||
                  (v && typeof v === "object" && !Array.isArray(v))
              ))
          );
        },
        message:
          "streamUrl must be a string, an object, or an array of strings/objects",
      },
    },

    started: Boolean,
    results: {
      h2v: Object,
      magma: Object,
      highlights: Object,
    },
    status: {
      h2v: { type: String, default: "pending" },
      magma: { type: String, default: "pending" },
      highlights: { type: String, default: "pending" },
    },

    // Expiry date for this specific job
    ttlExpiresAt: {
      type: Date,
      default: function () {
        const ttlSeconds = parseInt(process.env.JOB_TTL_SECONDS || "3600");
        return new Date(Date.now() + ttlSeconds * 1000);
      },
    },
  },
  {
    timestamps: true, // adds createdAt, updatedAt
  }
);

// Per-job TTL index — expires exactly at ttlExpiresAt
jobSchema.index({ ttlExpiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model("Job", jobSchema);
