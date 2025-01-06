const express = require('express');
const morgan = require('morgan');
const {createProxyMiddleware} = require('http-proxy-middleware');

// Create Express Server
const app = express();

const API_SERVICE_URL = 'https://squarepegsupply.com/';

// Logging
app.use(morgan('dev'));

// log all headers for every route, then go to next
app.use((req, res, next) => {
  console.log(req.headers);
  next();
});

// Info GET endpoint
app.get('/api', (req, res) => {
  res.send('This is a proxy service which proxies to Hydrogen.');
});

// Authorization
// app.use('', (req, res, next) => {
//   if (req.headers['x-shopify-hmac-sha256']) {
//     // check if the header is present and valid
//     const hmac = req.headers['x-shopify-hmac-sha256'];
//     const parsedHmac = crypto
//       .createHmac('sha256', SHOPIFY_SIGNED_SECRET)
//       .digest('hex');

//     const parsedHmac2 = crypto.createHmac('sha256', hmac).digest('hex');

//     console.log({hmac, parsedHmac, parsedHmac2});
//     if (hmac === parsedHmac) {
//       return next();
//     }
//   }

//   return res.sendStatus(403);
// });

// Proxy endpoints
app.use(
  '/api/webhooks/shopify/create-order',
  createProxyMiddleware({
    target: API_SERVICE_URL,
    changeOrigin: true,
    pathRewrite: {
      [`^/webhooks/shopify/create-order`]: '',
    },
  }),
);

app.listen(3000, () => {
  console.log('Starting proxy at http://localhost:3000');
});

module.exports = app;
