const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors');
const fetch = require('node-fetch'); // for WhatsApp/Meta API calls

admin.initializeApp();

// Configure CORS with specific origins
const corsHandler = cors({
  origin: true, // Allow requests from any origin
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helper function to handle CORS
const handleCors = (req, res, fn) => {
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  return fn(req, res);
};

/* ===========================================================
   🔹 PAYSTACK + MPESA (YOUR ORIGINAL CODE)
   =========================================================== */

// Initialize Paystack payment
exports.initializePaystackPayment = functions.https.onRequest((req, res) => {
  return handleCors(req, res, () => {
    return corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { planId, email, phoneNumber, userId } = req.body;

      try {
        const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

        let plan;
        try {
          const planDoc = await admin.firestore().collection('pricing').doc(planId).get();
          if (!planDoc.exists) {
            if (isEmulator) {
              console.log('Using mock plan data in emulator');
              plan = { name: 'Mock Plan', price: 2900, currency: 'KSh' };
            } else {
              return res.status(404).json({ error: 'Plan not found' });
            }
          } else {
            plan = planDoc.data();
          }
        } catch (dbError) {
          if (isEmulator) {
            console.log('Using mock plan data due to DB error:', dbError);
            plan = { name: 'Mock Plan', price: 2900, currency: 'KSh' };
          } else {
            throw dbError;
          }
        }

        const amount = plan.price * 100;
        const reference = `sub_${userId || 'user'}_${Date.now()}`;

        const paymentData = {
          email: email || 'test@example.com',
          amount,
          currency: plan.currency === 'KSh' ? 'KES' : 'USD',
          reference,
          callback_url: 'https://tari-connect-gz5u.vercel.app/payment/verify',
          metadata: {
            userId: userId || 'test-user',
            planId,
            planName: plan.name,
            ...(phoneNumber && { phoneNumber })
          }
        };

        if (phoneNumber) {
          paymentData.channels = ['mobile_money'];
          paymentData.mobile_money = { phone: phoneNumber };
        } else {
          paymentData.channels = ['card'];
        }

        if (isEmulator) {
          return res.status(200).json({
            authorization_url: 'https://checkout.paystack.com/mock-checkout',
            access_code: 'mock_access_code',
            reference
          });
        }

        const response = await axios.post(
          'https://api.paystack.co/transaction/initialize',
          paymentData,
          {
            headers: {
              Authorization: `Bearer ${functions.config().paystack.secret_key}`,
              'Content-Type': 'application/json'
            }
          }
        );

        return res.status(200).json(response.data.data);
      } catch (err) {
        console.error('Payment init error:', err.message);
        return res.status(500).json({ error: err.message });
      }
    });
  });
});

// Verify Paystack payment
exports.verifyPaystackPayment = functions.https.onRequest((req, res) => {
  return handleCors(req, res, () => {
    return corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { reference } = req.body;
      if (!reference) {
        return res.status(400).json({ error: 'Reference is required' });
      }

      const isEmulator = process.env.FUNCTIONS_EMULATOR === 'true';

      try {
        let data;
        if (isEmulator) {
          data = {
            status: 'success',
            id: `mock_transaction_${Date.now()}`,
            reference,
            amount: 2900 * 100,
            gateway_response: 'Successful',
            paid_at: new Date().toISOString(),
            channel: 'card',
            currency: 'KES',
            customer: { email: 'test@example.com', name: 'Test Customer' }
          };
        } else {
          const response = await axios.get(
            `https://api.paystack.co/transaction/verify/${reference}`,
            {
              headers: {
                Authorization: `Bearer ${functions.config().paystack.secret_key}`,
                'Content-Type': 'application/json'
              }
            }
          );
          data = response.data.data;
        }

        if (data.status === 'success') {
          try {
            const userId = reference.split('_')[1];
            if (userId) {
              const paymentsRef = admin.firestore().collection('payments');
              const snapshot = await paymentsRef.where('reference', '==', reference).get();
              if (!snapshot.empty) {
                const paymentDoc = snapshot.docs[0];
                await paymentDoc.ref.update({
                  status: 'completed',
                  transactionId: data.id,
                  completedAt: admin.firestore.FieldValue.serverTimestamp()
                });
                const payment = paymentDoc.data();
                if (payment.userId) {
                  await admin.firestore().collection('subscriptions').doc(payment.userId).update({
                    status: 'active',
                    paymentStatus: 'completed',
                    lastPaymentDate: admin.firestore.FieldValue.serverTimestamp()
                  });
                }
              }
            }
          } catch (dbError) {
            console.error('Database update error:', dbError);
            if (!isEmulator) throw dbError;
          }
        }

        return res.status(200).json(data);
      } catch (err) {
        console.error('Payment verification error:', err.message);
        return res.status(500).json({ error: err.message });
      }
    });
  });
});

// Initialize M-Pesa payment
exports.initiateMpesaPayment = functions.https.onRequest((req, res) => {
  return handleCors(req, res, () => {
    return corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { phoneNumber, amount, planId, userId } = req.body;
      if (!phoneNumber || !amount) {
        return res.status(400).json({ error: 'Phone number and amount are required' });
      }

      try {
        const formattedPhone = phoneNumber.startsWith('+')
          ? phoneNumber.substring(1)
          : phoneNumber.startsWith('0')
            ? `254${phoneNumber.substring(1)}`
            : phoneNumber;

        const mpesaResponse = {
          CheckoutRequestID: `mpesa_${Date.now()}`,
          MerchantRequestID: `merchant_${Date.now()}`,
          ResponseCode: '0',
          ResponseDescription: 'Success. Request accepted for processing',
          CustomerMessage: 'Success. Request accepted for processing'
        };

        return res.status(200).json(mpesaResponse);
      } catch (err) {
        console.error('M-Pesa payment error:', err.message);
        return res.status(500).json({ error: err.message });
      }
    });
  });
});

// Check M-Pesa payment status
exports.checkMpesaPayment = functions.https.onRequest((req, res) => {
  return handleCors(req, res, () => {
    return corsHandler(req, res, async () => {
      if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method Not Allowed' });
      }

      const { checkoutRequestId } = req.body;
      if (!checkoutRequestId) {
        return res.status(400).json({ error: 'Checkout request ID is required' });
      }

      try {
        const isSuccess = Math.random() > 0.3;
        if (isSuccess) {
          return res.status(200).json({
            success: true,
            MpesaReceiptNumber: `M${Date.now().toString().substring(5)}`,
            TransactionDate: Date.now(),
            PhoneNumber: req.body.phoneNumber || '254700000000'
          });
        } else {
          return res.status(200).json({ success: false, error: 'Payment pending or failed' });
        }
      } catch (err) {
        console.error('M-Pesa check error:', err.message);
        return res.status(500).json({ error: err.message });
      }
    });
  });
});

/* ===========================================================
   🔹 WHATSAPP + META INTEGRATION (ADDED CODE)
   =========================================================== */

// WhatsApp connect
exports.connectWhatsApp = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");

  const accessToken = data?.accessToken || "FAKE_TOKEN";
  const phoneNumberId = data?.phoneNumberId || "FAKE_PHONE";

  const verifyUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}?access_token=${accessToken}`;
  const res = await fetch(verifyUrl);

  if (!res.ok) throw new functions.https.HttpsError("invalid-argument", "Invalid WhatsApp credentials.");

  await admin.firestore().collection("integrations").doc(userId).set({
    whatsapp: { connected: true, phoneNumberId, accessToken }
  }, { merge: true });

  return { success: true };
});

exports.disconnectWhatsApp = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  await admin.firestore().collection("integrations").doc(userId).update({
    whatsapp: { connected: false }
  });
  return { success: true };
});

// Meta connect
exports.connectMeta = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  if (!userId) throw new functions.https.HttpsError("unauthenticated", "User must be logged in.");

  const accessToken = data?.accessToken || "FAKE_TOKEN";
  const verifyUrl = `https://graph.facebook.com/me?access_token=${accessToken}`;

  const res = await fetch(verifyUrl);
  if (!res.ok) throw new functions.https.HttpsError("invalid-argument", "Invalid Meta token.");

  const userData = await res.json();

  await admin.firestore().collection("integrations").doc(userId).set({
    meta: { connected: true, accessToken, userData }
  }, { merge: true });

  return { success: true };
});

exports.disconnectMeta = functions.https.onCall(async (data, context) => {
  const userId = context.auth?.uid;
  await admin.firestore().collection("integrations").doc(userId).update({
    meta: { connected: false }
  });
  return { success: true };
});
