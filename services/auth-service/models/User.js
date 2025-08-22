const mongoose = require('mongoose');
const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true },
  nickname: String,
  avatarType: String,
  avatarUrl: String,
  languages: [String],
  interests: [String],
  region: String,
  subscription: { tier: String, expiresAt: Date },
  limits: { dailyCalls: Number, lastReset: Date },
  flags: { banned: Boolean, shadow: Boolean }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
