const twilio = require('twilio');
const axios = require('axios');

function smsSender(env) {
  const strat = (env.OTP_STRATEGY || 'dev').toLowerCase();

  if (strat === 'twilio') {
    const client = twilio(env.TWILIO_SID, env.TWILIO_AUTH_TOKEN);
    return async (to, text) => {
      await client.messages.create({ to, from: env.TWILIO_FROM, body: text });
    };
  }

  if (strat === 'custom') {
    return async (to, text) => {
      await axios.post(env.SMS_API_URL, { to, text, apiKey: env.SMS_API_KEY });
    };
  }

  // dev fallback: log
  return async (to, text) => {
    console.log(`[DEV SMS] to ${to}: ${text}`);
  };
}

module.exports = { smsSender };
