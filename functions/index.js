const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');

admin.initializeApp();

const PAYSTACK_SECRET_KEY = functions.config().paystack.secret_key;

// Initialize Paystack payment
exports.initializePaystackPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { planId, email } = data;
  const userId = context.auth.uid;

  try {
    // Get plan details
    const planDoc = await admin.firestore().collection('pricing').doc(planId).get();
    if (!planDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Plan not found');
    }

    const plan = planDoc.data();
    const amount = plan.price * 100; // Convert to kobo

    const response = await axios.post('https://api.paystack.co/transaction/initialize', {
      email,
      amount,
      currency: 'NGN',
      reference: `sub_${userId}_${Date.now()}`,
      callback_url: `${functions.config().app.url}/payment/verify`,
      metadata: {
        userId,
        planId,
        planName: plan.name
      }
    }, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        'Content-Type': 'application/json'
      }
    });

    return response.data.data;
  } catch (error) {
    console.error('Paystack initialization error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Verify Paystack payment
exports.verifyPaystackPayment = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated');
  }

  const { reference } = data;

  try {
    const response = await axios.get(`https://api.paystack.co/transaction/verify/${reference}`, {
      headers: {
        Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`
      }
    });

    const transaction = response.data.data;
    
    if (transaction.status === 'success') {
      await handlePaymentSuccess(transaction);
    }

    return transaction;
  } catch (error) {
    console.error('Paystack verification error:', error);
    throw new functions.https.HttpsError('internal', error.message);
  }
});

// Paystack webhook handler
exports.paystackWebhook = functions.https.onRequest(async (req, res) => {
  const hash = require('crypto')
    .createHmac('sha512', functions.config().paystack.webhook_secret)
    .update(JSON.stringify(req.body))
    .digest('hex');

  if (hash !== req.headers['x-paystack-signature']) {
    return res.status(400).send('Invalid signature');
  }

  const event = req.body;

  try {
    switch (event.event) {
      case 'charge.success':
        await handlePaymentSuccess(event.data);
        break;
      case 'subscription.create':
        await handleSubscriptionCreated(event.data);
        break;
      case 'subscription.disable':
        await handleSubscriptionDisabled(event.data);
        break;
    }

    res.json({ received: true });
  } catch (error) {
    console.error('Webhook handler error:', error);
    res.status(500).send('Webhook handler failed');
  }
});

// Handle successful payment
async function handlePaymentSuccess(transaction) {
  const { userId, planId, planName } = transaction.metadata;
  
  if (!userId || !planId) return;

  const planDoc = await admin.firestore().collection('pricing').doc(planId).get();
  const plan = planDoc.data();

  const startDate = new Date();
  const endDate = new Date();
  
  if (plan.billingPeriod === 'month') {
    endDate.setMonth(endDate.getMonth() + 1);
  } else if (plan.billingPeriod === 'year') {
    endDate.setFullYear(endDate.getFullYear() + 1);
  }

  await admin.firestore().collection('subscriptions').doc(userId).set({
    paystackCustomerId: transaction.customer.id,
    paystackReference: transaction.reference,
    status: 'active',
    planId,
    planName,
    currentPeriodStart: startDate,
    currentPeriodEnd: endDate,
    amount: transaction.amount / 100,
    currency: transaction.currency,
    updatedAt: admin.firestore.FieldValue.serverTimestamp()
  }, { merge: true });
}

// Handle subscription created
async function handleSubscriptionCreated(subscription) {
  // Handle recurring subscription setup if needed
  console.log('Subscription created:', subscription);
}

// Handle subscription disabled
async function handleSubscriptionDisabled(subscription) {
  const usersSnapshot = await admin.firestore()
    .collection('subscriptions')
    .where('paystackCustomerId', '==', subscription.customer)
    .limit(1)
    .get();
  
  if (!usersSnapshot.empty) {
    const userId = usersSnapshot.docs[0].id;
    
    await admin.firestore().collection('subscriptions').doc(userId).update({
      status: 'canceled',
      updatedAt: admin.firestore.FieldValue.serverTimestamp()
    });
  }
}