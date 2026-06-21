exports.handler = async (event) => {
  return {
    statusCode: 200,
    body: JSON.stringify({
      publicKey: process.env.STRIPE_PUBLIC_KEY,
    }),
  };
};
