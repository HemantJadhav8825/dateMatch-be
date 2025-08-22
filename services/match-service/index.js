// services/match-service/server.js
const express = require('express');
const mongoose = require('mongoose');
const matchRoutes = require('./routes/matchRoutes');
require('dotenv').config();

const app = express();
app.use(express.json());
app.use('/match', matchRoutes);

mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => {
    app.listen(4002, () => console.log('Match-Service running on port 4002'));
  })
  .catch(err => console.error(err));
