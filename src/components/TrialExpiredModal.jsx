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
    navigate('/pricing');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full shadow-xl">
        <div className="text-center mb-6">
          <div className="bg-red-100 p-3 rounded-full inline-block mb-4">
            <FaExclamationTriangle className="text-red-500 text-3xl" />
          </div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Your Free Trial Has Expired</h2>
          <p className="text-gray-600">
            Your 14-day free trial has ended and your data has been deleted. 
            Subscribe to a plan to continue using TariConnect.
          </p>
        </div>
        
        <div className="flex flex-col gap-3">
          <button
            onClick={handleSubscribe}
            className="w-full bg-primary hover:bg-primary-dark text-white py-2 rounded-lg transition-colors"
          >
            View Pricing Plans
          </button>
          <button
            onClick={handleClose}
            className="w-full bg-gray-100 hover:bg-gray-200 text-gray-800 py-2 rounded-lg transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrialExpiredModal;