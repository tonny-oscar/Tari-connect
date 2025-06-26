import { PAYSTACK_CONFIG } from '../config/paystack';

/**
 * Simple Paystack integration that works directly with the Paystack API
 * without requiring any backend or Firebase functions
 */

// Load the Paystack script
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve(window.PaystackPop);
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve(window.PaystackPop);
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

// Initialize payment with Paystack
export const payWithPaystack = async (email, amount, metadata = {}) => {
  try {
    const PaystackPop = await loadPaystackScript();
    
    return new Promise((resolve, reject) => {
      const handler = PaystackPop.setup({
        key: PAYSTACK_CONFIG.publicKey,
        email,
        amount: amount * 100, // Convert to kobo/cents
        currency: 'KES',
        ref: 'pay_' + Date.now(),
        metadata,
        callback: function(response) {
          resolve({
            success: true,
            reference: response.reference,
            transaction: response.transaction
          });
        },
        onClose: function() {
          resolve({
            success: false,
            message: 'Payment window closed'
          });
        }
      });
      
      handler.openIframe();
    });
  } catch (error) {
    console.error('Paystack payment error:', error);
    return { success: false, error: error.message };
  }
};

// Simple function to pay for a plan
export const payForPlan = async (planId, email) => {
  // Plan prices
  const prices = {
    starter: 2900,
    professional: 7900,
    enterprise: 19900
  };
  
  const amount = prices[planId] || 2900;
  
  return payWithPaystack(email, amount, {
    planId,
    planName: planId.charAt(0).toUpperCase() + planId.slice(1)
  });
};