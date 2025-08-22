// services/match-service/routes/match.js
const express = require('express');
const axios = require('axios');
const router = express.Router();

router.post('/start-call', async (req, res) => {
  const { userId } = req.user; // from JWT
  const { matchId } = req.body; // selected match user

  try {
    // Call call-service to create a session
    const response = await axios.post('http://call-service:3003/call-sessions', {
      callerId: userId,
      calleeId: matchId
    }, {
      headers: { Authorization: req.headers.authorization }
    });

    return res.json({ success: true, session: response.data });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: 'Failed to initiate call' });
  }
});

module.exports = router;
