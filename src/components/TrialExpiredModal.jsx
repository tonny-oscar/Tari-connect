import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FaExclamationTriangle } from 'react-icons/fa';
import { useAuth } from '../store/useAuth';

const TrialExpiredModal = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { resetTrialExpiredFlag } = useAuth();
  
  if (!isOpen) return null;
  
  const handleClose = () => {
    resetTrialExpiredFlag();
    onClose();
  };
  
  const handleSubscribe = () => {
    resetTrialExpiredFlag();
    navigate('/free-trial');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-8 max-w-md w-full shadow-xl border dark:border-gray-700">
        <div className="text-center mb-6">
          <div className="bg-red-100 dark:bg-red-900 p-3 rounded-full inline-block mb-4">
            <FaExclamationTriangle className="text-red-500 dark:text-red-400 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">Your Free Trial Has Expired</h2>
          <p className="text-gray-800 dark:text-gray-300">
            Your 14-day free trial has ended and your data has been deleted. 
            Subscribe to a plan to continue using TariConnect.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubscribe}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg transition-colors font-medium"
          >
            View Subscription Plans
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-gray-200 py-3 rounded-lg transition-colors font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;