// services/match-service/controllers/match.js
const axios = require('axios');

exports.findMatch = async (req, res) => {
  try {
    const userPreferences = req.body; // { region, languages, interests }
    const response = await axios.post(
      'http://user-service:3001/users/eligible-users',
      userPreferences
    );

    if (!response.data.users?.length) {
      return res.status(404).json({ message: 'No matches found' });
    }

    const randomUser =
      response.data.users[Math.floor(Math.random() * response.data.users.length)];

    res.json({ success: true, match: randomUser });
  } catch (err) {
    console.error('Match error:', err);
    res.status(500).json({ success: false, message: 'Could not find match' });
  }
};
