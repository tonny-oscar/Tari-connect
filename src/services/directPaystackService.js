import { PAYSTACK_CONFIG } from '../config/paystack';
import { getPricingPlan } from './pricingService';

/**
 * Initialize a direct Paystack payment using the Paystack Inline script
 * This is a client-side alternative that doesn't require the Firebase function
 */
export const initializeDirectPaystackPayment = async (planId, email, phoneNumber = null, metadata = {}) => {
  try {
    // Get the plan details
    const { success, plan } = await getPricingPlan(planId);
    
    if (!success) {
      throw new Error('Failed to get plan details');
    }
    
    // Check if Paystack is loaded
    if (!window.PaystackPop) {
      throw new Error('Paystack script not loaded');
    }
    
    // Create a reference - avoid using test- or mock- prefixes as they cause verification issues
    const reference = `pay_${Date.now()}_${Math.floor(Math.random() * 1000000)}`;
    
    // Initialize Paystack inline
    const handler = window.PaystackPop.setup({
      key: PAYSTACK_CONFIG.publicKey,
      email: email,
      amount: plan.price * 100, // Paystack expects amount in kobo/cents
      currency: plan.currency === 'KSh' ? 'KES' : plan.currency,
      ref: reference,
      metadata: {
        planId: plan.id,
        planName: plan.name,
        ...metadata,
        ...(phoneNumber && { phoneNumber })
      },
      callback: function(response) {
        // Handle successful payment
        console.log('Payment complete! Reference:', response.reference);
        // Redirect to verification page
        window.location.href = `/payment/verify?reference=${response.reference}`;
      },
      onClose: function() {
        console.log('Payment window closed');
      }
    });
    
    // Open the payment modal
    handler.openIframe();
    
    return { success: true, reference };
  } catch (error) {
    console.error('Direct Paystack payment error:', error);
    return { success: false, error: error.message };
  }
};

/**
 * Load the Paystack script if it's not already loaded
 */
export const loadPaystackScript = () => {
  return new Promise((resolve, reject) => {
    if (window.PaystackPop) {
      resolve();
      return;
    }
    
    const script = document.createElement('script');
    script.src = 'https://js.paystack.co/v1/inline.js';
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.body.appendChild(script);
  });
};

/**
 * Verify a Paystack payment on the client side
 * Note: This should ideally be done on the server side for security
 */
export const verifyDirectPaystackPayment = async (reference) => {
  try {
    // In a real implementation, this would call your backend
    // For now, we'll just return a mock successful response
    return {
      success: true,
      data: {
        status: 'success',
        reference,
        transaction_date: new Date().toISOString(),
        message: 'Payment verification successful'
      }
    };
  } catch (error) {
    console.error('Direct Paystack verification error:', error);
    return { success: false, error: error.message };
  }
};