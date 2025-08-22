const mongoose = require('mongoose');
const MatchSchema = new mongoose.Schema({
  a: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  b: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  status: { type: String, default: 'pending' },
  filters: Object,
  createdAt: { type: Date, default: Date.now },
  endedAt: Date
});
module.exports = mongoose.model('Match', MatchSchema);
