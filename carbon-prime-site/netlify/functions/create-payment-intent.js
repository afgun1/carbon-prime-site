exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items, email, amount } = JSON.parse(event.body);

    if (!items || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Stripe API key not configured' }) };
    }

    // Build product description
    const description = items.map(i => `${i.name} x${i.qty}`).join(', ');

    // Create payment intent via Stripe API
    const params = new URLSearchParams();
    params.append('amount', amount.toString());
    params.append('currency', 'gbp');
    params.append('automatic_payment_methods[enabled]', 'true');
    params.append('receipt_email', email);
    params.append('description', description);
    params.append('metadata[cart_items]', items.length.toString());

    const stripeResponse = await fetch('https://api.stripe.com/v1/payment_intents', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    if (!stripeResponse.ok) {
      const error = await stripeResponse.text();
      console.error('Stripe API error:', error);
      return {
        statusCode: stripeResponse.status,
        body: JSON.stringify({ error: `Stripe error: ${error}` }),
      };
    }

    const paymentIntent = await stripeResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ clientSecret: paymentIntent.client_secret }),
    };
  } catch (error) {
    console.error('Payment intent error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Failed to create payment intent' }),
    };
  }
};
