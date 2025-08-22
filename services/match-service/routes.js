// services/match-service/routes.js
const express = require('express');
const authMiddleware = require('./middleware/auth');
const canUserMakeCall = require('./utils/callLimit');
const router = express.Router();

router.post('/start-call', authMiddleware, async (req, res) => {
  const userId = req.user.id; // from JWT
  const { matchId } = req.body;

  const check = await canUserMakeCall(userId);
  if (!check.allowed) {
    return res.status(403).json({ message: 'Daily call limit reached' });
  }

  res.json({ message: 'Call allowed', remaining: check.remaining });
});

module.exports = router;
