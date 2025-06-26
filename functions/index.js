const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors');

admin.initializeApp();

// Configure CORS with specific origins
const corsHandler = cors({
  origin: [
    'https://tari-connect-gz5u.vercel.app',
    'https://tari-connect.vercel.app',
    'http://localhost:5173',
    'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
});

// Helper function to handle CORS
const handleCors = (req, res, fn) => {
  // Set CORS headers for preflight requests
  res.set('Access-Control-Allow-Origin', 'https://tari-connect-gz5u.vercel.app');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.set('Access-Control-Max-Age', '3600');
  
  // Handle OPTIONS request (preflight)
  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }
  
  // Process the request
  return fn(req, res);
};

exports.initializePaystackPayment = functions.https.onRequest((req, res) => {
  return handleCors(req, res, () => {
    return corsHandler(req, res, async () => {
    if (req.method !== 'POST') {
      return res.status(405).json({ error: 'Method Not Allowed' });
    }

    const { planId, email, phoneNumber, userId } = req.body;

    try {
      const planDoc = await admin.firestore().collection('pricing').doc(planId).get();
      if (!planDoc.exists) return res.status(404).json({ error: 'Plan not found' });

      const plan = planDoc.data();
      const amount = plan.price * 100;

      const paymentData = {
        email,
        amount,
        currency: plan.currency === 'KSh' ? 'KES' : 'USD',
        reference: `sub_${userId}_${Date.now()}`,
        callback_url: 'https://tari-connect-gz5u.vercel.app/payment/verify',
        metadata: {
          userId,
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

      try {
        const response = await axios.get(
          `https://api.paystack.co/transaction/verify/${reference}`,
          {
            headers: {
              Authorization: `Bearer ${functions.config().paystack.secret_key}`,
              'Content-Type': 'application/json'
            }
          }
        );

        const { data } = response.data;

        // Update payment status in Firestore
        if (data.status === 'success') {
          // Extract userId from reference (sub_userId_timestamp)
          const userId = reference.split('_')[1];
          
          if (userId) {
            // Find the payment record
            const paymentsRef = admin.firestore().collection('payments');
            const snapshot = await paymentsRef.where('reference', '==', reference).get();
            
            if (!snapshot.empty) {
              const paymentDoc = snapshot.docs[0];
              await paymentDoc.ref.update({
                status: 'completed',
                transactionId: data.id,
                completedAt: admin.firestore.FieldValue.serverTimestamp()
              });
              
              // Update subscription if this was for a subscription
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
        // Format phone number (ensure it starts with 254)
        const formattedPhone = phoneNumber.startsWith('+')
          ? phoneNumber.substring(1)
          : phoneNumber.startsWith('0')
            ? `254${phoneNumber.substring(1)}`
            : phoneNumber;

        // Here you would integrate with M-Pesa API
        // This is a placeholder for the actual M-Pesa integration
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
        // Here you would check with M-Pesa API for the payment status
        // This is a placeholder for the actual M-Pesa status check
        const isSuccess = Math.random() > 0.3; // Simulate success/failure

        if (isSuccess) {
          return res.status(200).json({
            success: true,
            MpesaReceiptNumber: `M${Date.now().toString().substring(5)}`,
            TransactionDate: Date.now(),
            PhoneNumber: req.body.phoneNumber || '254700000000'
          });
        } else {
          return res.status(200).json({
            success: false,
            error: 'Payment pending or failed'
          });
        }
      } catch (err) {
        console.error('M-Pesa check error:', err.message);
        return res.status(500).json({ error: err.message });
      }
    });
  });
});
