// services/user-service/cron/resetDailyLimits.js
const cron = require('node-cron');
const User = require('../models/User');

// Runs every day at midnight server time
cron.schedule('0 0 * * *', async () => {
  try {
    await User.updateMany({}, {
      $set: {
        'limits.dailyCalls': 0,
        'limits.lastReset': new Date()
      }
    });
    console.log('Daily call limits reset successfully.');
  } catch (err) {
    console.error('Failed to reset daily call limits:', err.message);
  }
});
