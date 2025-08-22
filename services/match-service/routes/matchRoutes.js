// services/match-service/routes/matchRoutes.js
const express = require('express');
const Match = require('../models/Match');
const fetchEligibleUsers = require('../utils/fetchUser');
const auth = require('../middleware/auth');
const canUserMakeCall = require('../utils/callLimit');

const router = express.Router();

router.post('/find-match', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const userToken = req.headers.authorization?.split(' ')[1];

    // Check daily limit
    const limitCheck = await canUserMakeCall(userId);
    if (!limitCheck.allowed) {
      return res.status(403).json({ message: 'Daily call limit reached' });
    }

    // Get eligible users
    const eligibleUsers = await fetchEligibleUsers(req.user, userToken);
    if (!eligibleUsers.length) {
      return res.status(404).json({ message: 'No matches available' });
    }

    // Pick random match
    const matchUser = eligibleUsers[Math.floor(Math.random() * eligibleUsers.length)];

    // Create match record
    const newMatch = await Match.create({
      userA: userId,
      userB: matchUser._id,
    });

    res.json({ message: 'Match found', matchId: newMatch._id, partner: matchUser });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Failed to find match' });
  }
});

module.exports = router;
