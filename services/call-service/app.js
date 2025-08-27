const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const callSessionRoutes = require('./routes/callSessionRoutes');

const app = express();

app.use(cors());
app.use(express.json());
app.use(morgan('dev'));

app.get('/health', (_req, res) => res.json({ ok: true }));
app.use('/call-sessions', callSessionRoutes);

module.exports = app;
