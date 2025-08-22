// services/call-service/models/CallSession.js
const mongoose = require('mongoose');

const CallSessionSchema = new mongoose.Schema({
  callerId: { type: mongoose.Schema.Types.ObjectId, required: true },
  calleeId: { type: mongoose.Schema.Types.ObjectId, required: true },
  status: { type: String, enum: ['pending', 'accepted', 'rejected', 'ended'], default: 'pending' },
  startedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('CallSession', CallSessionSchema);
