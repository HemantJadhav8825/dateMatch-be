// models/CallSession.js
const mongoose = require('mongoose');

const CallSessionSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  calleeId: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'ended'], default: 'pending' },
  initiatedAt: { type: Date, default: Date.now },
  acceptedAt: Date,
  rejectedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('CallSession', CallSessionSchema);
