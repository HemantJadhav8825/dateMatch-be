const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  nickname: { type: String, default: '' },
  avatarType: { type: String, default: 'generated' },
  avatarUrl: String,
  languages: [String],
  interests: [String],
  region: String,
  subscription: { tier: { type: String, default: 'free' }, expiresAt: Date },
  limits: { dailyCalls: { type: Number, default: 3 }, lastReset: Date },
  flags: { banned: { type: Boolean, default: false }, shadow: { type: Boolean, default: false } }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
