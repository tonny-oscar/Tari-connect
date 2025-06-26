import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { processPayment } from '../services/paystackFix';

/**
 * A simple button component that handles Paystack payments directly
 */
const DirectPaystackButton = ({ email, amount, planId, buttonText = "Pay Now" }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async () => {
    setIsProcessing(true);
    
    try {
      const result = await processPayment(email, amount, {
        planId,
        planName: planId.charAt(0).toUpperCase() + planId.slice(1)
      });
      
      if (result.success) {
        // Redirect to success page
        navigate(`/payment/verify?reference=${result.reference}`);
      } else {
        console.log('Payment cancelled or failed:', result.message);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error('Payment error:', error);
      setIsProcessing(false);
    }
  };

  return (
    <button
      onClick={handlePayment}
      disabled={isProcessing}
      className="bg-primary text-white px-4 py-2 rounded hover:bg-primary-dark transition-colors disabled:opacity-50"
    >
      {isProcessing ? 'Processing...' : buttonText}
    </button>
  );
};

export default DirectPaystackButton;