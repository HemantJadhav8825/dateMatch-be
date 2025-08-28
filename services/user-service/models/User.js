const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  phone: { type: String, unique: true, required: true },
  nickname: { type: String, default: '' }, // already present, kept with default
  gender: { type: String, enum: ['Male', 'Female', 'Other', ''], default: '' }, // added
  avatarType: String,
  avatarUrl: String,
  languages: [String],
  interests: [String],
  subscription: { tier: String, expiresAt: Date },
  limits: { dailyCalls: Number, lastReset: Date },
  flags: { banned: Boolean, shadow: Boolean }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
