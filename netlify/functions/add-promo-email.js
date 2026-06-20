exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email } = JSON.parse(event.body);

    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    // Log email (you can connect Mailchimp later)
    console.log(`Promo signup: ${email}`);

    // TODO: Add to Mailchimp list here
    // For now, just acknowledge receipt

    return {
      statusCode: 200,
      body: JSON.stringify({ success: true, message: 'Email saved' }),
    };
  } catch (error) {
    console.error('Promo signup error:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: error.message }),
    };
  }
};
