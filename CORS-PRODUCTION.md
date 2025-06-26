# CORS Configuration for Production

This document explains how to fix CORS issues in the production environment for Tari Connect.

## The Problem

When accessing Firebase Cloud Functions from your deployed application at `https://tari-connect-gz5u.vercel.app`, you may encounter CORS errors like:

```
Access to fetch at 'https://us-central1-tariconnect-9xbvv.cloudfunctions.net/initializePaystackPayment' from origin 'https://tari-connect-gz5u.vercel.app' has been blocked by CORS policy
```

## Solution

We've updated the Firebase Cloud Functions to properly handle CORS by:

1. Adding explicit CORS headers to all responses
2. Handling OPTIONS requests for preflight checks
3. Allowing specific origins including your Vercel deployment

## Deployment Instructions

To deploy the updated functions:

1. Make sure you have Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Login to Firebase:
   ```bash
   firebase login
   ```

3. Run the deployment script:
   ```bash
   ./deploy-functions.sh
   ```

## Verifying the Fix

After deployment, you can verify the CORS headers are properly set by running:

```bash
curl -X OPTIONS -H "Origin: https://tari-connect-gz5u.vercel.app" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type" \
  -v https://us-central1-tariconnect-9xbvv.cloudfunctions.net/initializePaystackPayment
```

You should see the Access-Control-Allow-Origin header in the response.

## Adding Additional Domains

If you deploy to additional domains, you'll need to add them to the CORS configuration in `functions/index.js`:

```javascript
const corsHandler = cors({
  origin: [
    'https://tari-connect-gz5u.vercel.app',
    'https://your-new-domain.com'
  ],
  // ...
});
```

Then redeploy the functions.