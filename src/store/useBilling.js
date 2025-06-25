import { create } from 'zustand';
import { 
  getUserSubscription,
  updateUserSubscription,
  subscribeToPlan,
  cancelSubscription,
  getPaymentHistory,
  checkSubscriptionStatus,
  initiatePaystackPayment,
  verifyPaystackPayment
} from '../services/billingService';

export const useBilling = create((set, get) => ({
  subscription: null,
  paymentHistory: [],
  isLoading: false,
  error: null,
  success: null,

  // Load user subscription
  loadSubscription: async (userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { success, subscription, error } = await getUserSubscription(userId);
      
      if (success) {
        set({ subscription, isLoading: false });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Subscribe to a plan
  subscribe: async (userId, planId, paymentMethod = 'mpesa') => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, subscription, error, message } = await subscribeToPlan(userId, planId, paymentMethod);
      
      if (success) {
        set({ 
          subscription,
          success: message || 'Subscription created successfully',
          isLoading: false 
        });
        return { success: true, subscription };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Cancel subscription
  cancel: async (userId) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await cancelSubscription(userId);
      
      if (success) {
        const currentSubscription = get().subscription;
        set({ 
          subscription: { ...currentSubscription, status: 'cancelled' },
          success: 'Subscription cancelled successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Load payment history
  loadPaymentHistory: async (userId) => {
    try {
      const { success, payments, error } = await getPaymentHistory(userId);
      
      if (success) {
        set({ paymentHistory: payments });
        return { success: true };
      } else {
        set({ error });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message });
      return { success: false, error: err.message };
    }
  },

  // Check subscription status
  checkStatus: async (userId) => {
    try {
      const result = await checkSubscriptionStatus(userId);
      
      if (result.success && result.subscription) {
        set({ subscription: result.subscription });
      }
      
      return result;
    } catch (err) {
      return { success: false, error: err.message };
    }
  },

  // Initiate Paystack payment
  payWithPaystack: async (email, planId, userId) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, paymentId, message, error } = await initiatePaystackPayment(
        email, planId, userId
      );
      
      if (success) {
        set({ 
          success: message,
          isLoading: false 
        });
        return { success: true, paymentId };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Verify Paystack payment
  verifyPayment: async (reference) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, data, error } = await verifyPaystackPayment(reference);
      
      if (success) {
        set({ 
          success: 'Payment verified successfully',
          isLoading: false 
        });
        return { success: true, data };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Legacy M-Pesa function (for backward compatibility)
  payWithMpesa: async (email, amount, userId, planId) => {
    return get().payWithPaystack(email, planId, userId);
  },

  // Clear messages
  clearMessages: () => {
    set({ error: null, success: null });
  },

  // Get subscription status
  getSubscriptionStatus: () => {
    const subscription = get().subscription;
    if (!subscription) return { isActive: false, daysRemaining: 0 };
    
    const now = new Date();
    const endDate = new Date(subscription.endDate);
    const isActive = subscription.status === 'active' && now < endDate;
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
    
    return { isActive, daysRemaining, isExpired: now >= endDate };
  }
}));