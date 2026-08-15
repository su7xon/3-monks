const Razorpay = require('razorpay');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { amount } = JSON.parse(event.body);

    if (!amount) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Amount is required' }) };
    }

    const razorpay = new Razorpay({
      key_id: 'rzp_live_Ssl5rJRZ72IKfZ',
      key_secret: 'dU9TjfiqnqHShbEwCjMfbeKQ'
    });

    const options = {
      amount: Math.round(amount * 100), 
      currency: "INR",
      receipt: `receipt_${Date.now()}`
    };

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
