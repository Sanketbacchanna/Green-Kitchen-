const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 4000;
const DB_FILE = path.join(__dirname, 'orders.json');

app.use(express.json());

function readOrders() {
  try {
    const txt = fs.readFileSync(DB_FILE, 'utf8');
    return JSON.parse(txt || '[]');
  } catch (err) {
    return [];
  }
}

function writeOrders(orders) {
  fs.writeFileSync(DB_FILE, JSON.stringify(orders, null, 2));
}

// Upsert order
app.post('/api/orders', (req, res) => {
  const order = req.body;
  if (!order || !order.id) return res.status(400).json({ error: 'Invalid order' });
  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === order.id);
  if (idx >= 0) {
    orders[idx] = { ...orders[idx], ...order };
  } else {
    orders.push(order);
  }
  writeOrders(orders);
  return res.json({ ok: true });
});

// Get order by id
app.get('/api/orders/:id', (req, res) => {
  const id = req.params.id;
  const orders = readOrders();
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Not found' });
  return res.json(order);
});

// Twilio webhook for incoming messages (WhatsApp)
// Twilio sends x-www-form-urlencoded with fields like "Body" and "From"
app.post('/webhook/twilio', bodyParser.urlencoded({ extended: false }), (req, res) => {
  const body = req.body.Body || req.body.Body || '';
  const from = req.body.From || req.body.from || '';

  console.log('Twilio webhook received from', from, 'body:', body);

  // Very simple parsing: look for ORD-<number>
  const match = body.match(/(ORD-\d{3,})/i);
  if (!match) {
    console.log('No order id found in message');
    return res.send('<Response></Response>');
  }
  const orderId = match[1].toUpperCase();

  let newStatus = null;
  const text = body.toLowerCase();
  if (/accept|confirm|confirmed|yes|ok|accepted/.test(text)) newStatus = 'preparing';
  if (/on my way|on the way|out for delivery|delivering|delivered|shipping|dispatched/.test(text)) newStatus = 'delivering';
  if (/cancel|rejected|decline|declined/.test(text)) newStatus = 'cancelled';

  if (!newStatus) {
    console.log('No status keyword found in message, ignoring');
    return res.send('<Response></Response>');
  }

  const orders = readOrders();
  const idx = orders.findIndex(o => o.id === orderId);
  if (idx >= 0) {
    orders[idx].status = newStatus;
    writeOrders(orders);
    console.log('Order', orderId, 'updated to', newStatus);
  } else {
    console.log('Order id not found in DB:', orderId);
  }

  // Respond empty TwiML
  res.set('Content-Type', 'text/xml');
  res.send('<Response></Response>');
});

app.listen(PORT, () => {
  console.log(`Server listening on port ${PORT}`);
});
