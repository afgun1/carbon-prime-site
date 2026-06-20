const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { items, email } = JSON.parse(event.body);

    if (!items || !items.length) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Cart is empty' }) };
    }

    if (!email) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Email is required' }) };
    }

    // Convert cart items to Stripe line items
    const lineItems = items.map(item => {
      const priceInPence = Math.round((item.price || 0) * 100);
      if (priceInPence <= 0) {
        throw new Error(`Invalid price for ${item.name}: ${item.price}`);
      }

      return {
        price_data: {
          currency: 'gbp',
          product_data: {
            name: item.name || 'Product',
            description: `${item.series || ''} · ${item.chassis || ''}`.trim(),
          },
          unit_amount: priceInPence,
        },
        quantity: item.qty || 1,
      };
    });

    // Create Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      customer_email: email,
      success_url: `${process.env.URL}/checkout.html?success=true`,
      cancel_url: `${process.env.URL}/checkout.html?canceled=true`,
      billing_address_collection: 'required',
      shipping_address_collection: {
        allowed_countries: ['GB'],
      },
      shipping_options: [
        {
          shipping_rate_data: {
            type: 'fixed_amount',
            fixed_amount: {
              amount: 0,
              currency: 'gbp',
            },
            display_name: 'Free delivery',
            delivery_estimate: {
              minimum: { unit: 'business_day', value: 3 },
              maximum: { unit: 'business_day', value: 5 },
            },
          },
        },
      ],
    });

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Stripe error:', error.message);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Payment session creation failed' }),
    };
  }
};
