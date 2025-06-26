import React, { useState } from 'react';
import { payForPlan } from '../services/simplePaystack';

const SimplePaymentButton = ({ planId, email, onSuccess, onError }) => {
  const [isLoading, setIsLoading] = useState(false);
  
  const handlePayment = async () => {
    if (!email) {
      onError && onError('Email is required');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const result = await payForPlan(planId, email);
      
      if (result.success) {
        onSuccess && onSuccess(result);
      } else {
        onError && onError(result.message || 'Payment failed');
      }
    } catch (error) {
      onError && onError(error.message);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <button
      onClick={handlePayment}
      disabled={isLoading}
      className={`px-4 py-2 rounded font-medium ${
        isLoading 
          ? 'bg-gray-300 text-gray-600 cursor-not-allowed' 
          : 'bg-primary text-white hover:bg-primary-dark'
      }`}
    >
      {isLoading ? 'Processing...' : 'Pay Now'}
    </button>
  );
};

export default SimplePaymentButton;