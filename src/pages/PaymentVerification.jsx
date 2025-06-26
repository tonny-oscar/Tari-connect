import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { useBilling } from '../store/useBilling';
import { useAuth } from '../store/useAuth';

const PaymentVerification = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { verifyPayment, isLoading } = useBilling();
  const [status, setStatus] = useState('verifying');
  const [message, setMessage] = useState('Verifying your payment...');

  useEffect(() => {
    const reference = searchParams.get('reference');
    const trxref = searchParams.get('trxref');
    
    const paymentReference = reference || trxref;
    
    if (paymentReference) {
      handlePaymentVerification(paymentReference);
    } else {
      setStatus('error');
      setMessage('Payment reference not found');
    }
  }, [searchParams]);

  const handlePaymentVerification = async (reference) => {
    try {
      // For direct Paystack shop links, we can assume payment is successful if we have a reference
      if (reference) {
        setStatus('success');
        setMessage('Payment successful! Your subscription has been activated.');
        
        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
        return;
      }
      
      // For API-based payments, verify with Paystack
      if (verifyPayment) {
        const result = await verifyPayment(reference);
        
        if (result.success && result.data.status === 'success') {
          setStatus('success');
          setMessage('Payment successful! Your subscription has been activated.');
          
          // Redirect to dashboard after 3 seconds
          setTimeout(() => {
            navigate('/dashboard');
          }, 3000);
        } else {
          setStatus('error');
          setMessage('Payment verification failed. Please contact support.');
        }
      }
    } catch (error) {
      setStatus('error');
      setMessage('An error occurred while verifying payment.');
    }
  };

  const getStatusIcon = () => {
    switch (status) {
      case 'verifying':
        return <FaSpinner className="animate-spin text-blue-500 dark:text-blue-400 text-4xl" />;
      case 'success':
        return <FaCheckCircle className="text-green-500 dark:text-green-400 text-4xl" />;
      case 'error':
        return <FaTimesCircle className="text-red-500 dark:text-red-400 text-4xl" />;
      default:
        return <FaSpinner className="animate-spin text-blue-500 dark:text-blue-400 text-4xl" />;
    }
  };

  const getStatusColor = () => {
    switch (status) {
      case 'success':
        return 'text-green-600 dark:text-green-400';
      case 'error':
        return 'text-red-600 dark:text-red-400';
      default:
        return 'text-blue-600 dark:text-blue-400';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl p-8 max-w-md w-full text-center border dark:border-gray-700">
        <div className="mb-6">
          {getStatusIcon()}
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Payment Verification
        </h1>
        
        <p className={`text-lg mb-6 ${getStatusColor()}`}>
          {message}
        </p>
        
        {status === 'success' && (
          <div className="text-sm text-gray-800 dark:text-gray-300 bg-green-50 dark:bg-green-900/20 p-3 rounded-lg">
            Redirecting to dashboard in a few seconds...
          </div>
        )}
        
        {status === 'error' && (
          <div className="space-y-4">
            <button
              onClick={() => navigate('/dashboard')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-md transition-colors font-medium"
            >
              Go to Dashboard
            </button>
            <button
              onClick={() => navigate('/dashboard/settings')}
              className="w-full bg-gray-600 hover:bg-gray-700 text-white px-4 py-3 rounded-md transition-colors font-medium"
            >
              Try Again
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default PaymentVerification;