import React, { useEffect, useState } from 'react';
import { PAYSTACK_CONFIG } from '../config/paystack';
import { getPricingPlan } from '../services/pricingService';

/**
 * A component that renders a Paystack checkout button
 * This uses the Paystack standard integration which avoids the 404 errors
 */
const PaystackCheckout = ({ planId, email, phoneNumber, onSuccess, onClose }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [plan, setPlan] = useState(null);

  useEffect(() => {
    // Load the Paystack script
    const loadPaystackScript = () => {
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

    // Load plan details and Paystack script
    const initialize = async () => {
      try {
        setIsLoading(true);
        
        // Get plan details
        const { success, plan: planData, error: planError } = await getPricingPlan(planId);
        if (!success) {
          throw new Error(planError || 'Failed to load plan details');
        }
        
        setPlan(planData);
        
        // Load Paystack script
        await loadPaystackScript();
        
        setIsLoading(false);
      } catch (err) {
        console.error('Paystack initialization error:', err);
        setError(err.message);
        setIsLoading(false);
      }
    };
    
    initialize();
  }, [planId]);

  const handlePayment = () => {
    if (!plan || !window.PaystackPop) {
      setError('Payment system not initialized');
      return;
    }
    
    try {
      // Create a reference
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
          ...(phoneNumber && { phoneNumber })
        },
        callback: function(response) {
          // Handle successful payment
          console.log('Payment complete! Reference:', response.reference);
          if (onSuccess) {
            onSuccess(response);
          }
        },
        onClose: function() {
          console.log('Payment window closed');
          if (onClose) {
            onClose();
          }
        }
      });
      
      // Open the payment modal
      handler.openIframe();
    } catch (err) {
      console.error('Paystack payment error:', err);
      setError(err.message);
    }
  };

  if (isLoading) {
    return <button className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed" disabled>Loading...</button>;
  }

  if (error) {
    return <div className="text-red-500">Error: {error}</div>;
  }

  return (
    <button 
      onClick={handlePayment}
      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors"
    >
      Pay with Paystack
    </button>
  );
};

export default PaystackCheckout;