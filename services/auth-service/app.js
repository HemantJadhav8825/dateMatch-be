const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const otpRoutes = require('./routes/otpRoutes');
const tokenRoutes = require('./routes/tokenRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();
app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));

// Mount routes
app.use('/otp', otpRoutes);
app.use('/token', tokenRoutes);
app.use('/user', userRoutes);

module.exports = app;
