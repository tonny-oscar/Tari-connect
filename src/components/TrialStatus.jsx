import React from 'react';
import { FaClock, FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../store/useAuth';

const TrialStatus = () => {
  const { trialActive, trialDaysRemaining } = useAuth();

  if (!trialActive) return null;

  const isUrgent = trialDaysRemaining <= 3;

  return (
    <div className={`p-3 rounded-lg border ${
      isUrgent 
        ? 'bg-red-50 border-red-200 dark:bg-red-900/20 dark:border-red-700' 
        : 'bg-yellow-50 border-yellow-200 dark:bg-yellow-900/20 dark:border-yellow-700'
    }`}>
      <div className="flex items-center gap-2">
        {isUrgent ? (
          <FaExclamationTriangle className="text-red-500" />
        ) : (
          <FaClock className="text-yellow-500" />
        )}
        <div className="flex-1">
          <p className={`text-sm font-medium ${
            isUrgent 
              ? 'text-red-800 dark:text-red-200' 
              : 'text-yellow-800 dark:text-yellow-200'
          }`}>
            Free Trial: {trialDaysRemaining} day{trialDaysRemaining !== 1 ? 's' : ''} remaining
          </p>
          <p className={`text-xs ${
            isUrgent 
              ? 'text-red-600 dark:text-red-300' 
              : 'text-yellow-600 dark:text-yellow-300'
          }`}>
            {isUrgent 
              ? 'Subscribe now to keep your data!' 
              : 'Upgrade to continue using all features'
            }
          </p>
        </div>
      </div>
    </div>
  );
};

export default TrialStatus;