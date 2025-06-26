import React, { useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { useSubscription } from '../store/useSubscription';
import { createPaystackPayment, createPortalSession } from '../services/paystackService';
import { FaCreditCard, FaSpinner } from 'react-icons/fa';

const SubscriptionGate = ({ children }) => {
  const { user } = useAuth();
  const { subscription, isLoading, loadSubscription, subscribeToUpdates, hasAccess } = useSubscription();

  useEffect(() => {
    if (user) {
      loadSubscription(user.uid);
      const unsubscribe = subscribeToUpdates(user.uid);
      return () => unsubscribe();
    }
  }, [user, loadSubscription, subscribeToUpdates]);

  const handleSubscribe = async (priceId) => {
    if (user?.email) {
      await createPaystackPayment(priceId, user.email);
    }
  };

  const handleManageBilling = async () => {
    await createPortalSession();
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  if (!hasAccess()) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 text-center border dark:border-gray-700">
          <FaCreditCard className="mx-auto text-4xl text-blue-500 dark:text-blue-400 mb-4" />
          <h2 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Subscription Required</h2>
          <p className="text-gray-800 dark:text-gray-300 mb-6">
            You need an active subscription to access the CRM dashboard.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleSubscribe('monthly')}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Subscribe Monthly - $29/month
            </button>
            
            <button
              onClick={() => handleSubscribe('yearly')}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
            >
              Subscribe Yearly - $290/year
            </button>
            
            {subscription?.status === 'past_due' && (
              <button
                onClick={handleManageBilling}
                className="w-full bg-orange-600 hover:bg-orange-700 text-white py-3 px-4 rounded-lg transition-colors font-medium"
              >
                Update Payment Method
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  return children;
};

export default SubscriptionGate;