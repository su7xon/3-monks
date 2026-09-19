const crypto = require('crypto');

const PROJECT_ID = process.env.FIREBASE_PROJECT_ID || 'monks-84b29';
// Public web API key (same one shipped in the frontend firebase config).
const API_KEY = process.env.FIREBASE_API_KEY || 'AIzaSyAH-u3HGlVPYexW4oviSRKXD56_KUWvslw';

const fsUrl = (docId) =>
  `https://firestore.googleapis.com/v1/projects/${PROJECT_ID}/databases/(default)/documents/orders/${encodeURIComponent(docId)}?key=${API_KEY}`;

function toFs(v) {
  if (v === null || v === undefined) return { nullValue: null };
  if (typeof v === 'string') return { stringValue: v };
  if (typeof v === 'boolean') return { booleanValue: v };
  if (typeof v === 'number')
    return Number.isInteger(v) ? { integerValue: String(v) } : { doubleValue: v };
  if (Array.isArray(v)) return { arrayValue: { values: v.map(toFs) } };
  if (typeof v === 'object') {
    const fields = {};
    for (const k of Object.keys(v)) fields[k] = toFs(v[k]);
    return { mapValue: { fields } };
  }
  return { stringValue: String(v) };
}

function fromFs(node) {
  if (!node || typeof node !== 'object') return node;
  if ('stringValue' in node) return node.stringValue;
  if ('integerValue' in node) return Number(node.integerValue);
  if ('doubleValue' in node) return node.doubleValue;
  if ('booleanValue' in node) return node.booleanValue;
  if ('nullValue' in node) return null;
  if ('arrayValue' in node) return (node.arrayValue.values || []).map(fromFs);
  if ('mapValue' in node) {
    const out = {};
    for (const k of Object.keys(node.mapValue.fields || {})) out[k] = fromFs(node.mapValue.fields[k]);
    return out;
  }
  return node;
}

async function rzpGet(path) {
  const key_id = process.env.RAZORPAY_KEY_ID;
  const key_secret = process.env.RAZORPAY_KEY_SECRET;
  if (!key_id || !key_secret) throw new Error('Razorpay keys missing');
  const auth = Buffer.from(key_id + ':' + key_secret).toString('base64');
  const res = await fetch('https://api.razorpay.com/v1' + path, {
    headers: { Authorization: 'Basic ' + auth },
  });
  if (!res.ok) throw new Error('Razorpay API ' + res.status);
  return res.json();
}

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) {
    console.error('[Webhook] Missing RAZORPAY_WEBHOOK_SECRET env');
    return { statusCode: 500, body: JSON.stringify({ error: 'Webhook not configured' }) };
  }

  const raw = event.isBase64Encoded
    ? Buffer.from(event.body || '', 'base64').toString('utf8')
    : event.body || '';

  const headers = event.headers || {};
  const sig = headers['x-razorpay-signature'] || headers['X-Razorpay-Signature'];
  const expected = crypto.createHmac('sha256', secret).update(raw).digest('hex');
  if (!sig || sig !== expected) {
    console.warn('[Webhook] Bad signature');
    return { statusCode: 401, body: JSON.stringify({ error: 'Bad signature' }) };
  }

  let evt;
  try {
    evt = JSON.parse(raw);
  } catch {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad JSON' }) };
  }

  // Ack everything else; we only reconcile captured payments.
  if (evt.event !== 'payment.captured') {
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  }

  const pay = evt.payload && evt.payload.payment && evt.payload.payment.entity;
  if (!pay || !pay.order_id) {
    return { statusCode: 400, body: JSON.stringify({ error: 'Bad payload' }) };
  }

  try {
    // Our client order id lives in the Razorpay order notes.
    const rzpOrder = await rzpGet('/orders/' + pay.order_id);
    const notes = rzpOrder.notes || {};
    const ordId =
      typeof notes.orderId === 'string' && /^ORD-[0-9]+-[A-Z0-9]{4}$/.test(notes.orderId)
        ? notes.orderId
        : null;
    if (!ordId) {
      console.warn('[Webhook] Captured payment without traceable orderId:', pay.id);
      return { statusCode: 200, body: JSON.stringify({ received: true }) };
    }

    const rupees = Math.round(Number(pay.amount || 0) / 100);
    const now = new Date().toISOString();

    // Merge with existing doc so the browser path (full cart) always wins.
    let existing = null;
    try {
      const g = await fetch(fsUrl(ordId));
      if (g.ok) {
        const gj = await g.json();
        existing = gj.fields ? fromFs({ mapValue: { fields: gj.fields } }) : null;
      }
    } catch (e) {
      console.error('[Webhook] Firestore GET failed:', e.message);
    }

    const doc = {
      id: ordId,
      date: (existing && existing.date) || now,
      items: (existing && Array.isArray(existing.items) && existing.items.length > 0)
        ? existing.items
        : [],
      itemsSummary: (existing && existing.itemsSummary) || notes.items || '',
      total: (existing && existing.total) || rupees,
      status: 'Confirmed',
      customer: (existing && existing.customer) || {
        name: notes.customer || pay.email || '',
        email: pay.email || '',
        phone: notes.phone || pay.contact || '',
        address: '',
      },
      paymentMethod: 'razorpay',
      paymentId: pay.id,
      razorpayOrderId: pay.order_id,
      webhookVerified: true,
    };

    const put = await fetch(fsUrl(ordId), {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fields: toFs(doc).mapValue.fields }),
    });
    if (!put.ok) throw new Error('Firestore PATCH ' + put.status);

    console.log('[Webhook] Order confirmed:', ordId, pay.id);
    return { statusCode: 200, body: JSON.stringify({ received: true }) };
  } catch (error) {
    console.error('[Webhook] Reconcile failed:', error.message);
    return { statusCode: 500, body: JSON.stringify({ error: 'Reconcile failed' }) };
  }
};
