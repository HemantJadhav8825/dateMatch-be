// services/match-service/controllers/pairing.js (example)
const axios = require('axios');

async function createCallAfterMatch(callerToken, callerId, calleeId) {
  // callerToken = token from request (Authorization header)
  const res = await axios.post(`${process.env.CALL_SERVICE_URL || 'http://127.0.0.1:5004'}/call-sessions`,
    { calleeId },
    { headers: { Authorization: `Bearer ${callerToken}` } }
  );
  return res.data.session; // contains sessionId, room, etc.
}
