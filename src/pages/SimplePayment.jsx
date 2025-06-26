import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import SimplePaymentButton from '../components/SimplePaymentButton';

const SimplePayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  
  // Get planId from URL params or default to starter
  const planId = searchParams.get('planId') || 'starter';
  
  // Plan details
  const plans = {
    starter: { name: 'Starter', price: 2900 },
    professional: { name: 'Professional', price: 7900 },
    enterprise: { name: 'Enterprise', price: 19900 }
  };
  
  const plan = plans[planId] || plans.starter;
  
  const handleSuccess = (result) => {
    setSuccess(`Payment successful! Reference: ${result.reference}`);
    // Redirect after 2 seconds
    setTimeout(() => {
      navigate('/dashboard');
    }, 2000);
  };
  
  const handleError = (message) => {
    setError(message);
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md mt-10">
      <h2 className="text-2xl font-bold mb-6 text-center">{plan.name} Plan</h2>
      <p className="text-center text-xl mb-6">KSh {plan.price}</p>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
          {success}
        </div>
      )}
      
      <div className="mb-4">
        <label className="block text-gray-700 mb-2">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="your@email.com"
          required
        />
      </div>
      
      <div className="text-center mt-6">
        <SimplePaymentButton
          planId={planId}
          email={email}
          onSuccess={handleSuccess}
          onError={handleError}
        />
      </div>
    </div>
  );
};

export default SimplePayment;