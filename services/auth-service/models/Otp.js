const mongoose = require('mongoose');

const OtpSchema = new mongoose.Schema({
  phone: { type: String, index: true },
  requestId: { type: String, index: true },
  codeHash: String,
  expiresAt: Date,
  tries: { type: Number, default: 0 }
}, { timestamps: true });

OtpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 }); // TTL auto-clean

module.exports = mongoose.model('Otp', OtpSchema);
