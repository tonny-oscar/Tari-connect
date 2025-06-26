import { httpsCallable } from 'firebase/functions';
import { functions } from './firebase';

// Create Paystack payment
export const createPaystackPayment = async (planId, email, phoneNumber = null) => {
  try {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('Using development mode for Paystack payment');
      
      // Try using the proxy first
      try {
        const response = await fetch('/proxy/functions/initializePaystackPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { planId, email, phoneNumber } })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result && result.data && result.data.authorization_url) {
          window.location.href = result.data.authorization_url;
          return { success: true };
        }
      } catch (proxyError) {
        console.warn('Proxy request failed, falling back to direct function call', proxyError);
        // Continue to the direct function call below
      }
    }
    
    // Direct function call (will work in production or with emulator)
    const initializePayment = httpsCallable(functions, 'initializePaystackPayment');
    const { data } = await initializePayment({ planId, email, phoneNumber });
    
    // Redirect to Paystack payment page
    if (data && data.authorization_url) {
      window.location.href = data.authorization_url;
      return { success: true };
    } else {
      console.error('No authorization URL returned from Paystack');
      return { success: false, error: 'Failed to get payment authorization URL' };
    }
  } catch (error) {
    console.error('Paystack payment error:', error);
    
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

// Verify Paystack payment
export const verifyPaystackPayment = async (reference) => {
  try {
    // Check if we're in development mode
    if (import.meta.env.DEV) {
      console.log('Using development mode for Paystack verification');
      
      // Try using the proxy first
      try {
        const response = await fetch('/proxy/functions/verifyPaystackPayment', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ data: { reference } })
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        return { success: true, data: result.data };
      } catch (proxyError) {
        console.warn('Proxy request failed, falling back to direct function call', proxyError);
        // Continue to the direct function call below
      }
    }
    
    // Direct function call (will work in production or with emulator)
    const verifyPayment = httpsCallable(functions, 'verifyPaystackPayment');
    const { data } = await verifyPayment({ reference });
    
    return { success: true, data };
  } catch (error) {
    console.error('Paystack verification error:', error);
    
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

// Create subscription (legacy compatibility)
export const createSubscription = (planId, email, phoneNumber) => createPaystackPayment(planId, email, phoneNumber);

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