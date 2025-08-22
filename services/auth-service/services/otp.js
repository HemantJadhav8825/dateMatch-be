const crypto = require('crypto');
const dayjs = require('dayjs');
const twilio = require('twilio');

const store = new Map(); // { key: { code, expiresAt } }

function key(phone) { return `otp:${phone}`; }

function generateCode() { return ('' + Math.floor(100000 + Math.random()*900000)); }

async function sendSMS(phone, message) {
  if (process.env.DEV_SMS === 'true') {
    console.log(`[DEV SMS] to ${phone}: ${message}`);
    return;
  }
  const client = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN);
  await client.messages.create({ to: phone, from: process.env.TWILIO_FROM, body: message });
}

module.exports = {
  async start(phone) {
    const code = generateCode();
    const ttl = Number(process.env.OTP_TTL_SEC || 300);
    const expiresAt = dayjs().add(ttl, 'second').toDate();
    store.set(key(phone), { code, expiresAt });
    await sendSMS(phone, `Your verification code is ${code}. It expires in ${ttl/60} minutes.`);
    return { expiresAt };
  },
  verify(phone, code) {
    const rec = store.get(key(phone));
    if (!rec) return false;
    const ok = rec.code === code && dayjs().isBefore(rec.expiresAt);
    if (ok) store.delete(key(phone));
    return ok;
  }
};
