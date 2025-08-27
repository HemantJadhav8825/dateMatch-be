const mongoose = require('mongoose');

const CallSessionSchema = new mongoose.Schema({
  callerId: String,
  calleeId: String,
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'ended'], default: 'pending' },
  room: String,
  initiatedAt: Date,
  acceptedAt: Date,
  rejectedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.models.CallSession || mongoose.model('CallSession', CallSessionSchema);
