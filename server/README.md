Quick server to receive Twilio WhatsApp webhooks and store orders.

Setup

1. Install dependencies

```bash
cd server
npm install
```

2. Run server

```bash
npm run dev
# or
npm start
```

How it works

- POST /api/orders
  Upserts an order JSON. The frontend will attempt to POST new orders here after checkout.

- GET /api/orders/:id
  Returns an order object with `status`.

- POST /webhook/twilio
  Endpoint to configure as the Twilio (WhatsApp) incoming message webhook. The server expects messages containing the order id (eg. `ORD-12345`) and a keyword in the message body such as "accept", "on the way", or "cancel". When the webhook receives a valid message it updates the order status in `orders.json`.

Notes & security

- This prototype stores data in `orders.json`. For production use, replace with a proper database.
- For security, enable Twilio signature verification using `TWILIO_AUTH_TOKEN` and verify the `X-Twilio-Signature` header.
- Consider responding with TwiML to acknowledge messages or sending proactive WhatsApp messages using Twilio REST API.
