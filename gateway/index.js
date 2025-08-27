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

// Health check
app.get('/health', (_, res) => res.json({ ok: true }));

// Define proxy routes based on ENV variables
const proxyRoutes = {
  '/auth': process.env.PROXY_AUTH,
  '/user': process.env.PROXY_USER,
  '/match': process.env.PROXY_MATCH,
  '/call': process.env.PROXY_CALL,
  '/payment': process.env.PROXY_PAYMENT
};

// Register proxy middleware for each route
for (const [route, target] of Object.entries(proxyRoutes)) {
  if (target) {
    app.use(route, createProxyMiddleware({ target, changeOrigin: true }));
    console.log(`Proxy setup: ${route} → ${target}`);
  } else {
    console.warn(`No target defined for route: ${route}`);
  }
}

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => console.log('Gateway on :' + PORT));
