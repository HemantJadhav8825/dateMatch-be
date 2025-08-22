const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const Razorpay = require('razorpay');
const crypto = require('crypto');
const { pool } = require('./db');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(bodyParser.json());

// const rz = new Razorpay({ key_id: process.env.RAZORPAY_KEY_ID, key_secret: process.env.RAZORPAY_KEY_SECRET });

app.get('/health', (_, res) => res.json({ ok: true }));

// app.post('/payment/create-order', async (req, res) => {
//   const { amount, userId, type } = req.body || {};
//   if (!amount || !userId || !type) return res.status(400).json({ error: 'amount,userId,type required' });
//   const order = await rz.orders.create({ amount, currency: 'INR' });
//   await pool.query('INSERT INTO transactions(user_id,type,amount,status,gateway_ref) VALUES($1,$2,$3,$4,$5)',
//     [userId, type, amount, 'created', order.id]);
//   res.json({ orderId: order.id, amount: order.amount, currency: order.currency });
// });

app.post('/payment/confirm', async (req, res) => {
  // Client-side SDK hits this with signature details OR handle via webhook below.
  res.json({ ok: true });
});

app.post('/payment/webhook', express.raw({ type: 'application/json' }), async (req, res) => {
  const sig = req.headers['x-razorpay-signature'];
  const expected = crypto.createHmac('sha256', process.env.RAZORPAY_WEBHOOK_SECRET).update(req.body).digest('hex');
  if (expected !== sig) return res.status(400).end();
  const event = JSON.parse(req.body.toString());
  if (event.event === 'payment.captured') {
    const orderId = event.payload.payment.entity.order_id;
    await pool.query('UPDATE transactions SET status=$1 WHERE gateway_ref=$2', ['paid', orderId]);
  }
  res.json({ ok: true });
});

app.listen(process.env.PORT || 5005, () => console.log('Payment service on :' + (process.env.PORT || 5005)));
