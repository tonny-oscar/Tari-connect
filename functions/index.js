const functions = require('firebase-functions');
const admin = require('firebase-admin');
const axios = require('axios');
const cors = require('cors');

admin.initializeApp();

const corsHandler = cors({ origin: true }); // or set specific origins

exports.initializePaystackPayment = functions.https.onRequest((req, res) => {
  corsHandler(req, res, async () => {
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
