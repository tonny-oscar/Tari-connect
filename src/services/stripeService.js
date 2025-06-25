import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Create Paystack payment
export const createPaystackPayment = async (planId, email) => {
  try {
    const initializePayment = httpsCallable(functions, 'initializePaystackPayment');
    const { data } = await initializePayment({ planId, email });
    
    // Redirect to Paystack payment page
    window.location.href = data.authorization_url;
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Verify Paystack payment
export const verifyPaystackPayment = async (reference) => {
  try {
    const verifyPayment = httpsCallable(functions, 'verifyPaystackPayment');
    const { data } = await verifyPayment({ reference });
    
    return { success: true, data };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Create subscription (legacy compatibility)
export const createSubscription = createPaystackPayment;

// Create customer portal session (simplified for Paystack)
export const createPortalSession = async () => {
  try {
    // Redirect to dashboard settings for subscription management
    window.location.href = '/dashboard/settings';
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
};