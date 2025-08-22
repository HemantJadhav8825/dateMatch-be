// services/match-service/utils/callLimit.js
const axios = require('axios');

async function canUserMakeCall(userId) {
  try {
    const res = await axios.get(`http://localhost:5002/users/${userId}`);
    const user = res.data;

    const today = new Date().toDateString();
    const lastReset = user.limits?.lastReset
      ? new Date(user.limits.lastReset).toDateString()
      : null;

    // Determine daily limit based on subscription tier
    let dailyLimit = 3; // default for free users
    if (user.subscription?.tier === 'basic') dailyLimit = 10;
    if (user.subscription?.tier === 'premium') dailyLimit = Infinity;

    let currentCount = user.limits?.dailyCalls || 0;

    // Reset if it's a new day
    if (lastReset !== today) {
      currentCount = 0;
    }

    if (currentCount >= dailyLimit) {
      return { allowed: false, remaining: 0 };
    }

    // Update user limits
    await axios.put(`http://localhost:5002/users/${userId}`, {
      limits: {
        dailyCalls: currentCount + 1,
        lastReset: new Date()
      }
    });

    return {
      allowed: true,
      remaining: dailyLimit === Infinity ? '∞' : dailyLimit - (currentCount + 1)
    };
  } catch (error) {
    console.error('Daily call limit check failed:', error.message);
    return { allowed: false, remaining: 0 }; // Fail-safe: block call when uncertain
  }
}

module.exports = canUserMakeCall;
