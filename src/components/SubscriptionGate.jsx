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

  // Allow full access during 14-day trial period
  // Data will be deleted after 14 days if no subscription

  return children;
};

export default SubscriptionGate;