import React, { useState } from 'react';
import { processPayment } from '../services/paystackFix';
import { useNavigate } from 'react-router-dom';

const DirectPaymentDemo = () => {
  const [email, setEmail] = useState('');
  const [amount, setAmount] = useState(2900);
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const handlePayment = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    try {
      const result = await processPayment(email, amount, {
        planId: 'starter',
        planName: 'Starter Plan'
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
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-6">Direct Payment Demo</h1>
      
      <form onSubmit={handlePayment}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-3 py-2 border rounded-md"
            required
          />
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Amount (KSh)</label>
          <input
            type="number"
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="w-full px-3 py-2 border rounded-md"
            min="100"
            required
          />
        </div>
        
        <button
          type="submit"
          disabled={isProcessing}
          className="w-full bg-primary text-white py-2 px-4 rounded-md hover:bg-primary-dark transition-colors disabled:opacity-50"
        >
          {isProcessing ? 'Processing...' : 'Pay Now'}
        </button>
      </form>
    </div>
  );
};

export default DirectPaymentDemo;