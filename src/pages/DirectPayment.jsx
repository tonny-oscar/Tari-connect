import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import PaystackCheckout from '../components/PaystackCheckout';

const DirectPayment = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  
  // Get planId from URL params
  const planId = searchParams.get('planId') || 'starter';
  
  const handleSuccess = (response) => {
    console.log('Payment successful:', response);
    // Redirect to verification page
    navigate(`/payment/verify?reference=${response.reference}`);
  };
  
  const handleClose = () => {
    console.log('Payment cancelled');
  };
  
  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">Complete Your Payment</h2>
      
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
      
      <div className="mb-6">
        <label className="block text-gray-700 mb-2">Phone Number (optional)</label>
        <input
          type="tel"
          value={phoneNumber}
          onChange={(e) => setPhoneNumber(e.target.value)}
          className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder="+254700000000"
        />
      </div>
      
      <div className="text-center">
        {email ? (
          <PaystackCheckout
            planId={planId}
            email={email}
            phoneNumber={phoneNumber}
            onSuccess={handleSuccess}
            onClose={handleClose}
          />
        ) : (
          <button 
            className="bg-gray-300 text-gray-600 px-4 py-2 rounded cursor-not-allowed" 
            disabled
          >
            Enter email to continue
          </button>
        )}
      </div>
    </div>
  );
};

export default DirectPayment;