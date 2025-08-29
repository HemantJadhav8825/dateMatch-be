// services/user-service/routes/users.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');

// services/user-service/routes/users.js
router.get('/all', async (req, res) => {
  try {
    const userId = req.user.uid;
    const users = await User.find({ _id: { $ne: userId } });

    res.json({ users, total: users.length });
  } catch (err) {
    console.error('Error fetching all users:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

router.post('/eligible-users', async (req, res) => {
  try {
    const { region, languages, interests, limit = 20 } = req.body;

    const query = {
      'flags.banned': { $ne: true },
      $or: [
        { 'limits.dailyCalls': { $lt: 3 } }, // example: <3 calls per day allowed
        { 'limits.lastReset': { $lte: new Date(Date.now() - 24 * 60 * 60 * 1000) } }
      ]
    };

    if (region) query.region = region;
    if (languages?.length) query.languages = { $in: languages };
    if (interests?.length) query.interests = { $in: interests };

    const users = await User.find(query)
      .select('_id nickname avatarType avatarUrl languages interests region')
      .limit(limit);

    res.json({ success: true, users });
  } catch (err) {
    console.error('Error fetching eligible users:', err);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});

module.exports = router;
