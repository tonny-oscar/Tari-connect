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
    // Import the loadPaystackScript function
    const loadPaystackScript = async () => {
      const { loadPaystackScript } = await import('../services/paystackFix');
      return loadPaystackScript();
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

  const handlePayment = async () => {
    if (!plan) {
      setError('Payment system not initialized');
      return;
    }
    
    try {
      // Import the direct payment processor
      const { processPayment } = await import('../services/paystackFix');
      
      // Use direct payment instead
      const result = await processPayment(email, plan.price, {
        planId: plan.id,
        planName: plan.name,
        ...(phoneNumber && { phoneNumber })
      });
      
      if (result.success) {
        // Handle successful payment
        console.log('Payment complete! Reference:', result.reference);
        if (onSuccess) {
          onSuccess(result);
        }
      } else {
        console.log('Payment window closed');
        if (onClose) {
          onClose();
        }
      }
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