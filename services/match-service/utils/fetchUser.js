// services/match-service/utils/fetchUser.js
const axios = require('axios');

module.exports = async function fetchEligibleUsers(currentUser, token) {
  const filters = {};

  if (currentUser.subscription?.tier === 'premium') {
    if (currentUser.region) filters.region = currentUser.region;
    if (currentUser.languages?.length) filters.languages = currentUser.languages;
    if (currentUser.interests?.length) filters.interests = { $in: currentUser.interests };
  }

  // Call user-service API (secured by internal token/JWT)
  const response = await axios.get(`${process.env.USER_SERVICE_URL}/eligible-users`, {
    headers: { Authorization: `Bearer ${token}` },
    params: filters
  });

  return response.data;
};
