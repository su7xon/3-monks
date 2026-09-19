// In-memory rate limit (per warm lambda instance — best effort.
// Proper blocking still needs Razorpay velocity check + WAF).
const hitsByIp = global.__rzp_hits || (global.__rzp_hits = new Map());
const WINDOW_MS = 10 * 60 * 1000;
const MAX_HITS = 8;

function isRateLimited(ip) {
  const now = Date.now();
  const arr = (hitsByIp.get(ip) || []).filter((t) => now - t < WINDOW_MS);
  arr.push(now);
  hitsByIp.set(ip, arr);
  return arr.length > MAX_HITS;
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const body = JSON.parse(event.body || '{}');
    const { amount, orderId, customer, phone, itemsSummary } = body;

    const ip =
      event.headers?.['x-nf-client-connection-ip'] ||
      event.headers?.['x-forwarded-for']?.split(',')[0]?.trim() ||
      'unknown';

    if (isRateLimited(ip)) {
      console.warn('[Razorpay] Rate limited:', ip);
      return {
        statusCode: 429,
        body: JSON.stringify({ error: 'Too many attempts. Try again later.' }),
      };
    }

    // Amount must be a sane rupee value. Frontend always sends integer total.
    const num = Number(amount);
    if (!Number.isFinite(num) || num <= 0 || num > 200000) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }
    // Shop totals are whole rupees — reject fractional probes.
    if (!Number.isInteger(num)) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid amount' }) };
    }

    // Abuse blocklist. Default blocks 211 (attack amount, not a real cart total).
    // Override via env: BLOCKED_AMOUNTS="211,212" or empty to allow.
    const blocked = (process.env.BLOCKED_AMOUNTS ?? '211')
      .split(',')
      .map((s) => Number(s.trim()))
      .filter((n) => Number.isInteger(n));
    if (blocked.includes(num)) {
      console.warn('[Razorpay] Blocked abuse amount:', { ip, amount: num });
      return {
        statusCode: 403,
        body: JSON.stringify({ error: 'This amount is blocked. Contact support.' }),
      };
    }

    // orderId ties the Razorpay order back to our client-side order id (ORD-...).
    // Receipt + notes let the webhook reconcile even if the buyer closes
    // the browser before verification runs.
    const safeOrderId =
      typeof orderId === 'string' && /^ORD-[0-9]+-[A-Z0-9]{4}$/.test(orderId)
        ? orderId
        : null;

    const key_id = process.env.RAZORPAY_KEY_ID;
    const key_secret = process.env.RAZORPAY_KEY_SECRET;
    if (!key_id || !key_secret) {
      console.error('[Razorpay] Missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET env');
      return {
        statusCode: 500,
        body: JSON.stringify({ error: 'Payment not configured' }),
      };
    }

    const Razorpay = require('razorpay');
    const razorpay = new Razorpay({ key_id, key_secret });

    // Notes carry the trace fields the webhook needs to reconcile an order
    // when the buyer closes the browser before verification runs.
    const clean = (v, n) => (typeof v === 'string' ? v.slice(0, n) : '');
    const options = {
      amount: Math.round(num * 100),
      currency: 'INR',
      receipt: safeOrderId ? `${safeOrderId}_${Date.now()}` : `receipt_${Date.now()}`,
      notes: {
        ip,
        ...(safeOrderId ? { orderId: safeOrderId } : {}),
        ...(customer ? { customer: clean(customer, 120) } : {}),
        ...(phone ? { phone: clean(phone, 20) } : {}),
        ...(itemsSummary ? { items: clean(itemsSummary, 250) } : {}),
      },
    };

    console.log('[Razorpay] Create order:', { ip, amount: num, orderId: safeOrderId });
    const order = await razorpay.orders.create(options);

    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(order)
    };
  } catch (error) {
    console.error('Razorpay order creation error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to create order' })
    };
  }
};
