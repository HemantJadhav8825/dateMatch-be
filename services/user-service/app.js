// services/user-service/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();
const auth = require('./middlewares/auth');

// Import routes
const userRoutes = require('./routes/users');
const selfRoutes = require('./routes/self');

// Start Express app
const app = express();
app.use(cors());
app.use(bodyParser.json());

// Health check
app.get('/health', (_req, res) => res.json({ ok: true }));

// Routes
app.use('/users', auth, userRoutes);
app.use('/user', auth, selfRoutes);

// Cron jobs
require('./cron/resetDailyLimits');

module.exports = app;
