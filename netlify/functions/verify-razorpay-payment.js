const crypto = require('crypto');

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }

  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = JSON.parse(event.body);

    const secret = 'dU9TjfiqnqHShbEwCjMfbeKQ';

    
    const hmac = crypto.createHmac('sha256', secret);
    hmac.update(razorpay_order_id + '|' + razorpay_payment_id);
    const generated_signature = hmac.digest('hex');

    if (generated_signature === razorpay_signature) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: true, message: 'Payment verified successfully' })
      };
    } else {
      return {
        statusCode: 400,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ success: false, message: 'Invalid signature' })
      };
    }
  } catch (error) {
    console.error('Razorpay verification error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, message: 'Verification failed' })
    };
  }
};
