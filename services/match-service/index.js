// services/match-service/server.js
const express = require('express');
const mongoose = require('mongoose');
const matchRoutes = require('./routes/matchRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/match', matchRoutes);

app.get('/health', (_req, res) => res.json({ ok: true }));

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(process.env.PORT || 5003, () => console.log('Match-Service running on port 5003'));
  })
  .catch(err => console.error(err));
