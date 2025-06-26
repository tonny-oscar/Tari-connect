# CORS Setup for Tari Connect

This document explains how to resolve CORS (Cross-Origin Resource Sharing) issues when developing the Tari Connect application locally.

## The Problem

When running the application in development mode, you may encounter CORS errors like:

```
Access to fetch at 'https://us-central1-tariconnect-9xbvv.cloudfunctions.net/initializePaystackPayment' from origin 'http://localhost:5173' has been blocked by CORS policy: Response to preflight request doesn't pass access control check: No 'Access-Control-Allow-Origin' header is present on the requested resource.
```

This happens because Firebase Cloud Functions have CORS protection that prevents requests from unauthorized domains.

## Solutions

There are three ways to solve this issue:

### 1. Use Firebase Emulators (Recommended)

This approach runs Firebase services locally, avoiding CORS issues entirely.

```bash
# Install dependencies
npm install

# Start Firebase emulators
npm run emulators

# In another terminal, start the application
npm run dev
```

### 2. Use the CORS Proxy

This approach uses a local proxy server to forward requests to Firebase.

```bash
# Install dependencies
npm install

# Start the CORS proxy
npm run proxy

# In another terminal, start the application
npm run dev
```

### 3. Run Everything Together

```bash
# Install dependencies
npm install

# Start everything (app, proxy, and emulators)
npm run dev:all
```

## How It Works

- **Firebase Emulators**: Simulates Firebase services locally
- **CORS Proxy**: Forwards requests to Firebase with proper CORS headers
- **Modified Service Code**: Automatically tries the proxy first, then falls back to direct calls

## Troubleshooting

If you still encounter CORS issues:

1. Make sure the proxy server is running (`npm run proxy`)
2. Check that the Firebase emulators are running (`npm run emulators`)
3. Verify that the `.env.development` file exists with the correct settings
4. Clear your browser cache and reload the page

## Production Deployment

For production, you need to configure CORS on your Firebase Cloud Functions. Add this to your functions:

```javascript
const cors = require('cors')({origin: true});

exports.yourFunction = functions.https.onRequest((req, res) => {
  return cors(req, res, () => {
    // Your function code here
  });
});
```