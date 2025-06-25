import React, { useEffect } from 'react';
import { useAuth } from '../store/useAuth';
import { useSubscription } from '../store/useSubscription';
import { createSubscription, createPortalSession } from '../services/stripeService';
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
    await createSubscription(priceId);
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
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-6 text-center">
          <FaCreditCard className="mx-auto text-4xl text-blue-500 mb-4" />
          <h2 className="text-2xl font-bold mb-2">Subscription Required</h2>
          <p className="text-gray-600 mb-6">
            You need an active subscription to access the CRM dashboard.
          </p>
          
          <div className="space-y-4">
            <button
              onClick={() => handleSubscribe('price_monthly')}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg hover:bg-blue-700 transition-colors"
            >
              Subscribe Monthly - $29/month
            </button>
            
            <button
              onClick={() => handleSubscribe('price_yearly')}
              className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 transition-colors"
            >
              Subscribe Yearly - $290/year
            </button>
            
            {subscription?.status === 'past_due' && (
              <button
                onClick={handleManageBilling}
                className="w-full bg-orange-600 text-white py-3 px-4 rounded-lg hover:bg-orange-700 transition-colors"
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