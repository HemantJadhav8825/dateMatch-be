const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const { createProxyMiddleware } = require('http-proxy-middleware');
const rateLimit = require('express-rate-limit');
require('dotenv').config();

const app = express();
app.use(cors({ origin: '*' }));
app.use(morgan('dev'));
app.use(rateLimit({ windowMs: 60_000, max: 300 }));

// health
app.get('/health', (_, res) => res.json({ ok: true }));

// proxy map
app.use('/auth', createProxyMiddleware({ target: 'http://127.0.0.1:5001', changeOrigin: true }));
app.use('/user', createProxyMiddleware({ target: 'http://127.0.0.1:5002', changeOrigin: true }));
app.use('/match', createProxyMiddleware({ target: 'http://127.0.0.1:5003', changeOrigin: true }));
app.use('/call', createProxyMiddleware({ target: 'http://127.0.0.1:5004', changeOrigin: true }));
app.use('/payment', createProxyMiddleware({ target: 'http://127.0.0.1:5005', changeOrigin: true }));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log('Gateway on :' + PORT));
