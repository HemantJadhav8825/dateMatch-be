const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const Match = require('./models/Match');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('Match Mongo connected'));

function auth(req, res, next) {
  const token = (req.headers.authorization || '').replace('Bearer ', '');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'unauthorized' }); }
}

const waiting = []; // array of user ids

app.post('/match/find', auth, async (req, res) => {
  const uid = req.user.uid;
  if (waiting.length && waiting[0] !== uid) {
    const peer = waiting.shift();
    const m = await Match.create({ a: peer, b: uid, status: 'connected' });
    return res.json({ matchFound: true, matchId: m.id, peerId: peer });
  }
  if (!waiting.includes(uid)) waiting.push(uid);
  res.json({ matchFound: false });
});

app.post('/match/cancel', auth, (req, res) => {
  const uid = req.user.uid;
  const i = waiting.indexOf(uid);
  if (i >= 0) waiting.splice(i, 1);
  res.json({ ok: true });
});

app.listen(process.env.PORT || 5003, () => console.log('Match service on :' + (process.env.PORT || 5003)));
