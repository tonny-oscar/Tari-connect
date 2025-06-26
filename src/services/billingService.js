import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from './firebase';
import { createDualDocument, updateDualDocument } from './dualDatabaseService';

// Get user subscription
export const getUserSubscription = async (userId) => {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    
    if (subscriptionDoc.exists()) {
      return { success: true, subscription: subscriptionDoc.data() };
    } else {
      // Create default subscription (trial)
      const defaultSubscription = {
        userId,
        planId: 'trial',
        planName: 'Free Trial',
        status: 'active',
        startDate: new Date().toISOString(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
        price: 0,
        currency: 'KSh',
        billingPeriod: 'trial',
        features: ['2 social channels', '1 team member', 'Basic analytics'],
        isTrial: true,
        createdAt: new Date().toISOString()
      };
      
      await createDualDocument('subscriptions', userId, defaultSubscription);
      return { success: true, subscription: defaultSubscription };
    }
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { success: false, error: error.message };
  }
};

// Update user subscription
export const updateUserSubscription = async (userId, subscriptionData) => {
  try {
    const result = await updateDualDocument('subscriptions', userId, {
      ...subscriptionData,
      updatedAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error updating subscription:', error);
    return { success: false, error: error.message };
  }
};

// Subscribe to a plan
export const subscribeToPlan = async (userId, planId, paymentMethod = 'mpesa') => {
  try {
    // Get the pricing plan details
    const planDoc = await getDoc(doc(db, 'pricing', planId));
    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }
    
    const plan = planDoc.data();
    const startDate = new Date();
    const endDate = new Date();
    
    // Calculate end date based on billing period
    if (plan.billingPeriod === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingPeriod === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    const subscriptionData = {
      userId,
      planId,
      planName: plan.name,
      status: 'pending', // Will be updated after payment confirmation
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      price: plan.price,
      currency: plan.currency,
      billingPeriod: plan.billingPeriod,
      features: plan.features,
      isTrial: false,
      paymentMethod,
      paymentStatus: 'pending'
    };
    
    // Create subscription record
    const result = await updateDualDocument('subscriptions', userId, subscriptionData);
    
    if (result.success) {
      // Create payment record
      const paymentData = {
        userId,
        subscriptionId: userId,
        planId,
        amount: plan.price,
        currency: plan.currency,
        paymentMethod,
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const paymentId = `payment_${userId}_${Date.now()}`;
      await createDualDocument('payments', paymentId, paymentData);
      
      return { 
        success: true, 
        subscription: subscriptionData,
        paymentId,
        message: 'Subscription created. Please complete payment to activate.' 
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error subscribing to plan:', error);
    return { success: false, error: error.message };
  }
};

// Cancel subscription
export const cancelSubscription = async (userId) => {
  try {
    const result = await updateDualDocument('subscriptions', userId, {
      status: 'cancelled',
      cancelledAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error cancelling subscription:', error);
    return { success: false, error: error.message };
  }
};

// Get payment history
export const getPaymentHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, payments };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return { success: false, error: error.message };
  }
};

// Initialize Paystack payment
export const initiatePaystackPayment = async (email, planId, userId) => {
  try {
    const { createPaystackPayment } = await import('./paystackService');
    const result = await createPaystackPayment(planId, email);
    
    if (result.success) {
      // Create payment record
      const paymentData = {
        userId,
        planId,
        email,
        paymentMethod: 'paystack',
        status: 'pending',
        createdAt: new Date().toISOString()
      };
      
      const paymentId = `payment_${userId}_${Date.now()}`;
      await createDualDocument('payments', paymentId, paymentData);
      
      return { 
        success: true, 
        paymentId,
        message: 'Redirecting to Paystack payment page...' 
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error initiating Paystack payment:', error);
    return { success: false, error: error.message };
  }
};

// Verify Paystack payment
export const verifyPaystackPayment = async (reference) => {
  try {
    const { verifyPaystackPayment } = await import('./paystackService');
    return await verifyPaystackPayment(reference);
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    return { success: false, error: error.message };
  }
};

// Verify M-Pesa payment
export const verifyMpesaPayment = async (checkoutRequestId) => {
  try {
    let mpesaData;
    
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('Using development mode for M-Pesa verification');
      
      // Try using the proxy first
      try {
        const response = await fetch('/proxy/functions/checkMpesaPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { checkoutRequestId } })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        mpesaData = result.data;
      } catch (proxyError) {
        console.warn('Proxy request failed, falling back to direct function call', proxyError);
        // Continue to the direct function call below
      }
    }
    
    // If proxy didn't work or we're not in development, use direct function call
    if (!mpesaData) {
      // Call Firebase function to check M-Pesa payment status
      const checkMpesaPayment = httpsCallable(functions, 'checkMpesaPayment');
      const { data } = await checkMpesaPayment({ checkoutRequestId });
      mpesaData = data;
    }
    
    if (mpesaData && mpesaData.success) {
      // Find the payment record with this checkoutRequestId
      const paymentsRef = collection(db, 'payments');
      const q = query(paymentsRef, where('checkoutRequestId', '==', checkoutRequestId));
      const snapshot = await getDocs(q);
      
      if (snapshot.empty) {
        return { success: false, error: 'Payment record not found' };
      }
      
      const paymentDoc = snapshot.docs[0];
      const payment = paymentDoc.data();
      
      // Update payment status
      await updateDualDocument('payments', paymentDoc.id, {
        status: 'completed',
        mpesaReceiptNumber: mpesaData.MpesaReceiptNumber,
        completedAt: new Date().toISOString()
      });
      
      // Update subscription status if this was for a subscription
      if (payment.userId) {
        await updateUserSubscription(payment.userId, {
          status: 'active',
          paymentStatus: 'completed'
        });
      }
      
      return { 
        success: true, 
        payment: {
          ...payment,
          status: 'completed',
          mpesaReceiptNumber: mpesaData.MpesaReceiptNumber
        }
      };
    }
    
    return { success: false, error: mpesaData?.error || 'Payment verification failed' };
  } catch (error) {
    console.error('Error verifying M-Pesa payment:', error);
    
    // Check if this is a CORS error
    if (error.message && error.message.includes('CORS')) {
      return { 
        success: false, 
        error: 'Cross-Origin Request Blocked. Please run the CORS proxy with "npm run proxy" or use Firebase emulators with "npm run emulators"',
        isCorsError: true
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Initiate M-Pesa payment
export const initiateMpesaPayment = async (phoneNumber, planId, userId) => {
  try {
    // Get the pricing plan details
    const planDoc = await getDoc(doc(db, 'pricing', planId));
    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }
    
    const plan = planDoc.data();
    
    // Format phone number (ensure it starts with 254)
    const formattedPhone = phoneNumber.startsWith('+')
      ? phoneNumber.substring(1)
      : phoneNumber.startsWith('0')
        ? `254${phoneNumber.substring(1)}`
        : phoneNumber;
    
    let mpesaData;
    
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('Using development mode for M-Pesa payment');
      
      // Try using the proxy first
      try {
        const response = await fetch('/proxy/functions/initiateMpesaPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ 
            data: {
              phoneNumber: formattedPhone,
              amount: plan.price,
              planId,
              userId
            } 
          })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        mpesaData = result.data;
      } catch (proxyError) {
        console.warn('Proxy request failed, falling back to direct function call', proxyError);
        // Continue to the direct function call below
      }
    }
    
    // If proxy didn't work or we're not in development, use direct function call
    if (!mpesaData) {
      // Call M-Pesa STK Push via Firebase function
      const initiateMpesa = httpsCallable(functions, 'initiateMpesaPayment');
      const { data } = await initiateMpesa({
        phoneNumber: formattedPhone,
        amount: plan.price,
        planId,
        userId
      });
      mpesaData = data;
    }
    
    if (!mpesaData || !mpesaData.CheckoutRequestID) {
      return { success: false, error: 'Failed to initiate M-Pesa payment' };
    }
    
    // Create payment record
    const paymentData = {
      userId,
      planId,
      phoneNumber: formattedPhone,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: 'mpesa',
      status: 'pending',
      checkoutRequestId: mpesaData.CheckoutRequestID,
      merchantRequestId: mpesaData.MerchantRequestID,
      createdAt: new Date().toISOString()
    };
    
    const paymentId = `payment_${userId}_${Date.now()}`;
    await createDualDocument('payments', paymentId, paymentData);
    
    return { 
      success: true, 
      paymentId,
      checkoutRequestId: mpesaData.CheckoutRequestID,
      message: 'M-Pesa STK push sent. Please complete payment on your phone.' 
    };
  } catch (error) {
    console.error('Error initiating M-Pesa payment:', error);
    
    // Check if this is a CORS error
    if (error.message && error.message.includes('CORS')) {
      return { 
        success: false, 
        error: 'Cross-Origin Request Blocked. Please run the CORS proxy with "npm run proxy" or use Firebase emulators with "npm run emulators"',
        isCorsError: true
      };
    }
    
    return { success: false, error: error.message };
  }
};

// Check subscription status
export const checkSubscriptionStatus = async (userId) => {
  try {
    const { success, subscription } = await getUserSubscription(userId);
    
    if (!success) return { success: false, error: 'Failed to get subscription' };
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    
    const isActive = subscription.status === 'active' && now < endDate;
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    return {
      success: true,
      isActive,
      daysRemaining,
      subscription,
      isExpired: now >= endDate && subscription.status === 'active'
    };
  } catch (error) {
    console.error('Error checking subscription status:', error);
    return { success: false, error: error.message };
  }
};

// Check if a payment is pending
export const checkPendingPayment = async (userId, paymentId) => {
  try {
    const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
    
    if (!paymentDoc.exists()) {
      return { success: false, error: 'Payment not found' };
    }
    
    const payment = paymentDoc.data();
    
    // If payment is for this user and still pending
    if (payment.userId === userId && payment.status === 'pending') {
      // Check payment method and verify accordingly
      if (payment.paymentMethod === 'mpesa' && payment.checkoutRequestId) {
        return await verifyMpesaPayment(payment.checkoutRequestId);
      } else if (payment.paymentMethod === 'paystack' && payment.reference) {
        return await verifyPaystackPayment(payment.reference);
      }
      
      return { success: true, payment, isPending: true };
    }
    
    return { 
      success: true, 
      payment,
      isPending: payment.status === 'pending'
    };
  } catch (error) {
    console.error('Error checking pending payment:', error);
    return { success: false, error: error.message };
  }
};

// Handle payment callback (for webhook responses)
export const handlePaymentCallback = async (paymentData) => {
  try {
    const { paymentId, status, transactionId, paymentMethod } = paymentData;
    
    // Get the payment record
    const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
    
    if (!paymentDoc.exists()) {
      return { success: false, error: 'Payment not found' };
    }
    
    const payment = paymentDoc.data();
    
    // Update payment status
    await updateDualDocument('payments', paymentId, {
      status,
      transactionId,
      completedAt: new Date().toISOString()
    });
    
    // If payment was successful and for a subscription, update subscription
    if (status === 'completed' && payment.userId) {
      await updateUserSubscription(payment.userId, {
        status: 'active',
        paymentStatus: 'completed',
        lastPaymentDate: new Date().toISOString(),
        transactionId
      });
      
      // Generate invoice for completed payment
      await generateInvoice(payment.userId, paymentId);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling payment callback:', error);
    return { success: false, error: error.message };
  }
};

// Change subscription plan (upgrade or downgrade)
export const changeSubscriptionPlan = async (userId, newPlanId) => {
  try {
    // Get current subscription
    const { success, subscription } = await getUserSubscription(userId);
    
    if (!success || !subscription) {
      return { success: false, error: 'Current subscription not found' };
    }
    
    // Get new plan details
    const planDoc = await getDoc(doc(db, 'pricing', newPlanId));
    
    if (!planDoc.exists()) {
      return { success: false, error: 'New plan not found' };
    }
    
    const newPlan = planDoc.data();
    
    // Calculate new dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (newPlan.billingPeriod === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (newPlan.billingPeriod === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Determine if this is an upgrade or downgrade
    const currentPlanDoc = await getDoc(doc(db, 'pricing', subscription.planId));
    const currentPlan = currentPlanDoc.exists() ? currentPlanDoc.data() : { price: 0 };
    
    const isUpgrade = newPlan.price > currentPlan.price;
    const planChangeType = isUpgrade ? 'upgrade' : 'downgrade';
    
    // Create subscription data
    const subscriptionData = {
      userId,
      planId: newPlanId,
      planName: newPlan.name,
      status: 'pending', // Will be updated after payment confirmation
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      price: newPlan.price,
      currency: newPlan.currency,
      billingPeriod: newPlan.billingPeriod,
      features: newPlan.features,
      isTrial: false,
      previousPlanId: subscription.planId,
      planChangeType,
      planChangedAt: new Date().toISOString()
    };
    
    // Update subscription
    const result = await updateUserSubscription(userId, subscriptionData);
    
    if (result.success) {
      // Create payment record for the new plan
      const paymentData = {
        userId,
        subscriptionId: userId,
        planId: newPlanId,
        amount: newPlan.price,
        currency: newPlan.currency,
        paymentMethod: subscription.paymentMethod || 'mpesa',
        status: 'pending',
        planChangeType,
        createdAt: new Date().toISOString()
      };
      
      const paymentId = `payment_${userId}_${Date.now()}`;
      await createDualDocument('payments', paymentId, paymentData);
      
      return { 
        success: true, 
        subscription: subscriptionData,
        paymentId,
        planChangeType,
        message: `Subscription ${planChangeType} initiated. Please complete payment to activate.` 
      };
    }
    
    return result;
  } catch (error) {
    console.error('Error changing subscription plan:', error);
    return { success: false, error: error.message };
  }
};

// Process subscription renewal
export const processSubscriptionRenewal = async (userId) => {
  try {
    // Get user subscription
    const { success, subscription } = await getUserSubscription(userId);
    
    if (!success || !subscription) {
      return { success: false, error: 'Subscription not found' };
    }
    
    // Check if subscription is active and not a trial
    if (subscription.status !== 'active' || subscription.isTrial) {
      return { success: false, error: 'Subscription is not eligible for renewal' };
    }
    
    // Get plan details
    const planDoc = await getDoc(doc(db, 'pricing', subscription.planId));
    
    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }
    
    const plan = planDoc.data();
    
    // Calculate new dates
    const startDate = new Date();
    const endDate = new Date();
    
    if (plan.billingPeriod === 'month') {
      endDate.setMonth(endDate.getMonth() + 1);
    } else if (plan.billingPeriod === 'year') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    }
    
    // Create payment record for renewal
    const paymentData = {
      userId,
      planId: subscription.planId,
      amount: plan.price,
      currency: plan.currency,
      paymentMethod: subscription.paymentMethod || 'automatic',
      status: 'pending',
      isRenewal: true,
      createdAt: new Date().toISOString()
    };
    
    const paymentId = `payment_${userId}_${Date.now()}`;
    await createDualDocument('payments', paymentId, paymentData);
    
    // Update subscription with new dates
    await updateUserSubscription(userId, {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      renewalDate: endDate.toISOString(),
      lastRenewalDate: startDate.toISOString(),
      renewalPaymentId: paymentId
    });
    
    return { 
      success: true, 
      paymentId,
      message: 'Subscription renewal initiated' 
    };
  } catch (error) {
    console.error('Error processing subscription renewal:', error);
    return { success: false, error: error.message };
  }
};

// Generate invoice for subscription payment
export const generateInvoice = async (userId, paymentId) => {
  try {
    // Get payment details
    const paymentDoc = await getDoc(doc(db, 'payments', paymentId));
    
    if (!paymentDoc.exists()) {
      return { success: false, error: 'Payment not found' };
    }
    
    const payment = paymentDoc.data();
    
    // Get user details
    const userDoc = await getDoc(doc(db, 'users', userId));
    
    if (!userDoc.exists()) {
      return { success: false, error: 'User not found' };
    }
    
    const user = userDoc.data();
    
    // Get plan details
    const planDoc = await getDoc(doc(db, 'pricing', payment.planId));
    
    if (!planDoc.exists()) {
      return { success: false, error: 'Plan not found' };
    }
    
    const plan = planDoc.data();
    
    // Create invoice data
    const invoiceData = {
      userId,
      paymentId,
      invoiceNumber: `INV-${Date.now()}`,
      customerName: user.displayName || user.email,
      customerEmail: user.email,
      customerPhone: payment.phoneNumber || user.phoneNumber,
      planName: plan.name,
      planId: payment.planId,
      amount: payment.amount || plan.price,
      currency: payment.currency || plan.currency,
      paymentMethod: payment.paymentMethod,
      transactionId: payment.transactionId,
      paymentDate: payment.completedAt || new Date().toISOString(),
      billingPeriod: plan.billingPeriod,
      status: 'paid',
      items: [
        {
          description: `${plan.name} Subscription (${plan.billingPeriod})`,
          quantity: 1,
          unitPrice: payment.amount || plan.price,
          total: payment.amount || plan.price
        }
      ],
      subtotal: payment.amount || plan.price,
      tax: 0, // Add tax calculation if needed
      total: payment.amount || plan.price,
      notes: `Thank you for your subscription to ${plan.name} plan.`,
      createdAt: new Date().toISOString()
    };
    
    // Save invoice to database
    const invoiceId = `invoice_${userId}_${Date.now()}`;
    await createDualDocument('invoices', invoiceId, invoiceData);
    
    return { success: true, invoiceId, invoice: invoiceData };
  } catch (error) {
    console.error('Error generating invoice:', error);
    return { success: false, error: error.message };
  }
};