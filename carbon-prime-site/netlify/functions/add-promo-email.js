// Adds a popup signup to the EmailOctopus "Members" list.
// Uses the EmailOctopus v2 API (https://api.emailoctopus.com).
// Bearer auth; PUT upsert endpoint so repeat signups update rather than error.

exports.handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: JSON.stringify({ error: 'Method Not Allowed' }) };
  }

  try {
    const { email, name } = JSON.parse(event.body || '{}');

    if (!email || !email.includes('@')) {
      return { statusCode: 400, body: JSON.stringify({ error: 'Invalid email' }) };
    }

    const apiKey = process.env.EMAILOCTOPUS_API_KEY;
    const listId = process.env.EMAILOCTOPUS_LIST_ID;

    if (!apiKey || !listId) {
      console.error('EmailOctopus env vars missing');
      return { statusCode: 500, body: JSON.stringify({ error: 'Email service not configured' }) };
    }

    // Optional name split into first/last
    const firstName = name ? String(name).trim().split(' ')[0] : '';
    const lastName = name ? String(name).trim().split(' ').slice(1).join(' ') : '';

    const payload = {
      email_address: email,
      fields: {
        FirstName: firstName,
        LastName: lastName
      },
      tags: { 'popup-10off': true },
      status: 'subscribed'
    };

    // v2 upsert: PUT /lists/{listId}/contacts (create or update)
    const res = await fetch(`https://api.emailoctopus.com/lists/${listId}/contacts`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(payload)
    });

    if (res.ok) {
      return { statusCode: 200, body: JSON.stringify({ success: true }) };
    }

    const data = await res.json().catch(() => ({}));
    console.error('EmailOctopus error:', res.status, data);
    return { statusCode: 502, body: JSON.stringify({ error: data.detail || 'Signup failed' }) };

  } catch (error) {
    console.error('add-promo-email error:', error);
    return { statusCode: 500, body: JSON.stringify({ error: error.message }) };
  }
};
