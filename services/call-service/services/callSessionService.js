const CallSession = require('../models/CallSession');

const inMemorySessions = new Map();

async function createSession(payload) {
  if (process.env.MONGO_URI && CallSession.db.readyState === 1) {
    const doc = await CallSession.create(payload);
    return doc.toObject();
  } else {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2,8)}`;
    const session = { _id: id, ...payload, createdAt: new Date() };
    inMemorySessions.set(id, session);
    return session;
  }
}

async function updateSession(id, patch) {
  if (process.env.MONGO_URI && CallSession.db.readyState === 1) {
    return await CallSession.findByIdAndUpdate(id, patch, { new: true }).lean();
  } else {
    const s = inMemorySessions.get(id);
    if (!s) return null;
    Object.assign(s, patch);
    return s;
  }
}

async function getSession(id) {
  if (process.env.MONGO_URI && CallSession.db.readyState === 1) {
    return await CallSession.findById(id).lean();
  } else {
    return inMemorySessions.get(id);
  }
}

module.exports = { createSession, updateSession, getSession };
