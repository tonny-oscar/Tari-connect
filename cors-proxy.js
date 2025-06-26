// Simple CORS proxy for development
const express = require('express');
const cors = require('cors');
const { createProxyMiddleware } = require('http-proxy-middleware');

const app = express();

// Enable CORS for all routes
app.use(cors({ origin: '*' }));

// Proxy Firebase function requests
app.use('/proxy/functions', createProxyMiddleware({
  target: 'https://us-central1-tariconnect-9xbvv.cloudfunctions.net',
  changeOrigin: true,
  pathRewrite: {
    '^/proxy/functions': ''
  },
  onProxyRes: function(proxyRes, req, res) {
    proxyRes.headers['Access-Control-Allow-Origin'] = '*';
    proxyRes.headers['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS';
    proxyRes.headers['Access-Control-Allow-Headers'] = 'Content-Type, Authorization';
  }
}));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`CORS proxy server running on port ${PORT}`);
});