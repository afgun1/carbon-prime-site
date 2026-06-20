exports.handler = async (event) => {
  // Debug: log what we have
  console.log('STRIPE_SECRET_KEY exists:', !!process.env.STRIPE_SECRET_KEY);
  console.log('All env keys:', Object.keys(process.env).filter(k => k.includes('STRIPE')));

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

    if (!process.env.STRIPE_SECRET_KEY) {
      return { statusCode: 500, body: JSON.stringify({ error: 'Stripe API key not configured in Netlify' }) };
    }

    // Build line items for Stripe
    const lineItems = items.map((item, i) => ({
      [`line_items[${i}][price_data][currency]`]: 'gbp',
      [`line_items[${i}][price_data][product_data][name]`]: item.name || 'Product',
      [`line_items[${i}][price_data][product_data][description]`]: `${item.series || ''} ${item.chassis || ''}`.trim(),
      [`line_items[${i}][price_data][unit_amount]`]: Math.round((item.price || 0) * 100),
      [`line_items[${i}][quantity]`]: item.qty || 1,
    })).reduce((acc, obj) => Object.assign(acc, obj), {});

    // Build form data for Stripe API
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('mode', 'payment');
    params.append('customer_email', email);
    params.append('success_url', `${process.env.URL}/checkout.html?success=true`);
    params.append('cancel_url', `${process.env.URL}/checkout.html?canceled=true`);
    params.append('billing_address_collection', 'required');
    params.append('shipping_address_collection[allowed_countries][]', 'GB');
    params.append('shipping_options[0][shipping_rate_data][type]', 'fixed_amount');
    params.append('shipping_options[0][shipping_rate_data][fixed_amount][amount]', '0');
    params.append('shipping_options[0][shipping_rate_data][fixed_amount][currency]', 'gbp');
    params.append('shipping_options[0][shipping_rate_data][display_name]', 'Free delivery');
    params.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][unit]', 'business_day');
    params.append('shipping_options[0][shipping_rate_data][delivery_estimate][minimum][value]', '3');
    params.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][unit]', 'business_day');
    params.append('shipping_options[0][shipping_rate_data][delivery_estimate][maximum][value]', '5');

    // Add line items
    Object.entries(lineItems).forEach(([key, value]) => {
      params.append(key, value);
    });

    // Call Stripe API
    const stripeResponse = await fetch('https://api.stripe.com/v1/checkout/sessions', {
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

    const session = await stripeResponse.json();

    return {
      statusCode: 200,
      body: JSON.stringify({ sessionId: session.id }),
    };
  } catch (error) {
    console.error('Checkout error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message || 'Payment session creation failed' }),
    };
  }
};
