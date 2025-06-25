import { doc, getDoc, setDoc, updateDoc, collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from './firebase';
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
    const { createPaystackPayment } = await import('./stripeService');
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
    const { verifyPaystackPayment } = await import('./stripeService');
    return await verifyPaystackPayment(reference);
  } catch (error) {
    console.error('Error verifying Paystack payment:', error);
    return { success: false, error: error.message };
  }
};

// Legacy M-Pesa function (kept for backward compatibility)
export const initiateMpesaPayment = initiatePaystackPayment;

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