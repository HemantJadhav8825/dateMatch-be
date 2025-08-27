// services/user-service/index.js
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
require('dotenv').config();

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
app.use('/users', userRoutes);
app.use('/user', selfRoutes);

// Cron jobs
require('./cron/resetDailyLimits');

module.exports = app;
