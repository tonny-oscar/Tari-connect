# Stripe Subscription Setup Guide

## Prerequisites
1. Stripe account (test mode for development)
2. Firebase project with Functions enabled
3. Environment variables configured

## Setup Steps

### 1. Stripe Configuration
```bash
# Install Stripe CLI
curl -s https://packages.stripe.com/api/security/keypair/stripe-cli-gpg/public | gpg --dearmor | sudo tee /usr/share/keyrings/stripe.gpg
echo "deb [signed-by=/usr/share/keyrings/stripe.gpg] https://packages.stripe.com/stripe-cli-debian-local stable main" | sudo tee -a /etc/apt/sources.list.d/stripe.list
sudo apt update
sudo apt install stripe

# Login to Stripe
stripe login
```

### 2. Create Products and Prices in Stripe
```bash
# Create monthly product
stripe products create --name="CRM Monthly" --description="Monthly CRM subscription"

# Create monthly price (replace prod_xxx with actual product ID)
stripe prices create --unit-amount=2900 --currency=usd --recurring-interval=month --product=prod_xxx

# Create yearly product
stripe products create --name="CRM Yearly" --description="Yearly CRM subscription"

# Create yearly price (replace prod_xxx with actual product ID)
stripe prices create --unit-amount=29000 --currency=usd --recurring-interval=year --product=prod_xxx
```

### 3. Firebase Functions Configuration
```bash
# Set Stripe keys in Firebase Functions config
firebase functions:config:set stripe.secret_key="sk_test_your_secret_key"
firebase functions:config:set stripe.webhook_secret="whsec_your_webhook_secret"
firebase functions:config:set app.url="http://localhost:5173"

# Deploy functions
cd functions
npm install
cd ..
firebase deploy --only functions
```

### 4. Webhook Setup
1. Go to Stripe Dashboard > Webhooks
2. Add endpoint: `https://your-project.cloudfunctions.net/stripeWebhook`
3. Select events:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `invoice.payment_failed`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`

### 5. Environment Variables
Create `.env` file:
```env
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_your_publishable_key
```

### 6. Update Price IDs
In `SubscriptionGate.jsx`, replace price IDs:
```javascript
// Replace with your actual Stripe price IDs
onClick={() => handleSubscribe('price_1234567890')} // Monthly
onClick={() => handleSubscribe('price_0987654321')} // Yearly
```

## Testing

### 1. Test Cards
- Success: `4242424242424242`
- Decline: `4000000000000002`
- Requires authentication: `4000002500003155`

### 2. Local Testing
```bash
# Start local development
npm run dev

# In another terminal, forward webhooks
stripe listen --forward-to localhost:5001/your-project/us-central1/stripeWebhook
```

## Database Structure

### Subscriptions Collection
```javascript
{
  stripeCustomerId: "cus_xxx",
  stripeSubscriptionId: "sub_xxx", 
  status: "active", // active, past_due, canceled
  currentPeriodStart: Date,
  currentPeriodEnd: Date,
  priceId: "price_xxx",
  updatedAt: Timestamp
}
```

## Security Rules
Firestore rules ensure:
- Users can only read their own subscription data
- Only Firebase Functions can write subscription data
- CRM data access requires active subscription

## Production Deployment
1. Switch to live Stripe keys
2. Update webhook endpoint to production URL
3. Deploy Firebase Functions to production
4. Update environment variables for production

## Troubleshooting
- Check Firebase Functions logs: `firebase functions:log`
- Verify webhook signatures in Stripe dashboard
- Test subscription flow with Stripe test cards
- Monitor Firestore security rules in Firebase console