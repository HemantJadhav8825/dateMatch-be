// services/user-service/routes/self.js
const express = require('express');
const User = require('../models/User');
const auth = require('../middlewares/auth');

const router = express.Router();

// Get current user
router.get('/me', auth, async (req, res) => {
  try {
    const me = await User.findById(req.user.uid);
    res.json(me);
  } catch (err) {
    res.status(500).json({ error: 'failed_fetch_user' });
  }
});

// Update current user
router.patch('/me', auth, async (req, res) => {
  try {
    const me = await User.findByIdAndUpdate(req.user.uid, req.body, { new: true });
    res.json(me);
  } catch (err) {
    res.status(500).json({ error: 'failed_update_user' });
  }
});

module.exports = router;
