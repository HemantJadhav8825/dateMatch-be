const User = require('../models/User');

exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.uid).lean();
    res.json({ user });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'fetch_user_failed' });
  }
};
