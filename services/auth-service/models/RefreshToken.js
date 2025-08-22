const mongoose = require('mongoose');

const RefreshTokenSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, index: true, required: true },
  token: { type: String, unique: true, index: true }, // store raw or hashed; hashed is safer
  expiresAt: { type: Date, index: true },
  revokedAt: Date,
  userAgent: String,
  ip: String
}, { timestamps: true });

RefreshTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('RefreshToken', RefreshTokenSchema);
