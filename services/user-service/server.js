const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
const jwt = require('jsonwebtoken');
require('dotenv').config();
const User = require('./models/User');

const app = express();
app.use(cors());
app.use(bodyParser.json());

mongoose.connect(process.env.MONGO_URI).then(() => console.log('User Mongo connected'));

function auth(req, res, next) {
  const h = req.headers.authorization || '';
  const token = h.replace('Bearer ', '');
  try { req.user = jwt.verify(token, process.env.JWT_SECRET); next(); }
  catch { return res.status(401).json({ error: 'unauthorized' }); }
}

app.get('/user/me', auth, async (req, res) => {
  const me = await User.findById(req.user.uid);
  res.json(me);
});
app.patch('/user/me', auth, async (req, res) => {
  const me = await User.findByIdAndUpdate(req.user.uid, req.body, { new: true, upsert: false });
  res.json(me);
});

app.listen(process.env.PORT || 5002, () => console.log('User service on :' + (process.env.PORT || 5002)));
