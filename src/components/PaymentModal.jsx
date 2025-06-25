import React, { useState } from 'react';
import { FaTimes, FaSpinner, FaCreditCard } from 'react-icons/fa';
import { useBilling } from '../store/useBilling';
import { useAuth } from '../store/useAuth';

const PaymentModal = ({ isOpen, onClose, plan }) => {
  const { user } = useAuth();
  const { payWithPaystack, isLoading, error, success, clearMessages } = useBilling();
  const [paymentMethod, setPaymentMethod] = useState('paystack');

  const handlePayment = async (e) => {
    e.preventDefault();
    
    if (!plan || !user) return;
    
    clearMessages();
    
    if (paymentMethod === 'paystack') {
      const result = await payWithPaystack(user.email, plan.id, user.uid);
      
      if (result.success) {
        // Payment will redirect to Paystack, no need to close modal
        // The redirect happens automatically in the service
      }
    }
  };

  if (!isOpen || !plan) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md border dark:border-gray-700">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">Complete Payment</h3>
          <button 
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <FaTimes />
          </button>
        </div>
        
        <div className="p-6">
          {/* Plan Summary */}
          <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h4 className="font-medium dark:text-white">{plan.name} Plan</h4>
            <p className="text-2xl font-bold text-blue-600 dark:text-blue-400 mt-1">
              {plan.currency} {plan.price.toLocaleString()}
              <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/{plan.billingPeriod}</span>
            </p>
            <p className="text-sm text-gray-800 dark:text-gray-400 mt-1">{plan.description}</p>
          </div>

          {error && (
            <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
              {error}
            </div>
          )}
          
          {success && (
            <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 mb-4 rounded">
              {success}
            </div>
          )}

          <form onSubmit={handlePayment}>
            {/* Payment Method */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Payment Method</label>
              <div className="space-y-2">
                <label className="flex items-center p-3 border border-gray-300 dark:border-gray-600 rounded-lg cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700 bg-white dark:bg-gray-800">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="paystack"
                    checked={paymentMethod === 'paystack'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="mr-3"
                  />
                  <FaCreditCard className="text-blue-600 dark:text-blue-400 mr-2" />
                  <div>
                    <div className="font-medium dark:text-white">Credit/Debit Card</div>
                    <div className="text-sm text-gray-800 dark:text-gray-400">Pay securely with Paystack</div>
                  </div>
                </label>
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                className="flex-1 bg-gray-600 text-white px-4 py-3 rounded-md hover:bg-gray-700 transition-colors"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className="flex-1 bg-blue-600 text-white px-4 py-3 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading && <FaSpinner className="animate-spin" />}
                Pay {plan.currency} {plan.price.toLocaleString()}
              </button>
            </div>
          </form>

          {paymentMethod === 'paystack' && (
            <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/30 rounded-lg border border-blue-200 dark:border-blue-700">
              <p className="text-sm text-blue-800 dark:text-blue-200">
                <strong>Note:</strong> You will be redirected to Paystack's secure payment page to complete your transaction.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;