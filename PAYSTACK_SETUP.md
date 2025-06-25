# Paystack Integration Setup Guide

This guide will help you set up Paystack payment integration for your CRM application.

## Prerequisites

1. A Paystack account (sign up at https://paystack.com)
2. Firebase project with Functions enabled
3. Node.js and npm installed

## Step 1: Get Paystack API Keys

1. Log in to your Paystack Dashboard
2. Go to Settings > API Keys & Webhooks
3. Copy your **Public Key** and **Secret Key**
4. Note: Use test keys for development, live keys for production

## Step 2: Configure Environment Variables

### Frontend (.env file)
```bash
# Add to your .env file
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_paystack_public_key_here
```

### Firebase Functions
```bash
# Set Firebase config for Paystack
firebase functions:config:set paystack.secret_key="sk_test_your_paystack_secret_key_here"
firebase functions:config:set paystack.webhook_secret="your_webhook_secret_here"
firebase functions:config:set app.url="http://localhost:5173"  # or your production URL
```

## Step 3: Install Dependencies

### Frontend
The frontend dependencies are already configured. No additional packages needed.

### Firebase Functions
```bash
cd functions
npm install axios
```

## Step 4: Configure Webhooks

1. In your Paystack Dashboard, go to Settings > API Keys & Webhooks
2. Add a new webhook endpoint: `https://your-project.cloudfunctions.net/paystackWebhook`
3. Select these events:
   - `charge.success`
   - `subscription.create`
   - `subscription.disable`
4. Generate and copy the webhook secret
5. Update Firebase config with the webhook secret (see Step 2)

## Step 5: Deploy Firebase Functions

```bash
# Deploy the updated functions
firebase deploy --only functions
```

## Step 6: Test the Integration

1. Start your development server
2. Try to subscribe to a plan
3. Use Paystack test card numbers:
   - **Successful payment**: 4084084084084081
   - **Insufficient funds**: 4084084084084081 (with CVV 408)
   - **Declined payment**: 4084084084084081 (with CVV 111)

## Currency Configuration

The setup supports USD and KSh (Kenyan Shilling) currencies:
- USD payments use Paystack's USD processing
- KSh payments are converted to KES for Paystack
- Currency is determined by the plan's currency field in Firestore

## Subscription Management

Unlike Stripe, Paystack doesn't have a built-in customer portal. Users can:
- View subscription status in Settings
- Cancel subscriptions (handled by your application)
- Payment history is tracked in Firestore

## Security Notes

1. Never expose secret keys in frontend code
2. Always validate webhook signatures
3. Use HTTPS in production
4. Regularly rotate API keys
5. Monitor transactions in Paystack Dashboard

## Troubleshooting

### Common Issues:

1. **Payment not redirecting**: Check callback_url configuration
2. **Webhook not working**: Verify webhook URL and secret
3. **Currency mismatch**: Ensure consistent currency across frontend/backend
4. **Test payments failing**: Use correct test card numbers

### Debug Steps:

1. Check Firebase Functions logs: `firebase functions:log`
2. Verify Paystack webhook delivery in Dashboard
3. Test API calls with Postman
4. Check browser console for frontend errors

## Production Checklist

- [ ] Replace test keys with live keys
- [ ] Update app.url to production domain
- [ ] Configure production webhook URL
- [ ] Test with real payment methods
- [ ] Set up monitoring and alerts
- [ ] Review Firestore security rules

## Support

- Paystack Documentation: https://paystack.com/docs
- Paystack Support: support@paystack.com
- Firebase Functions: https://firebase.google.com/docs/functions