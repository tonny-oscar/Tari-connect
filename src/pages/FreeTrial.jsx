import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { FaRocket, FaCheck } from 'react-icons/fa';

const FreeTrial = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

  // Redirect to signup if not authenticated
  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/register?trial=true');
    }
  }, [isAuthenticated, navigate]);

  const handleStartTrial = () => {
    navigate('/register?trial=true');
  };

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto pt-24 px-6 pb-16">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-gray-800">Start Your 14-Day Free Trial</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Experience all premium features of TariConnect with no commitment. No credit card required.
          </p>
        </div>
        
        <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden mb-8">
          <div className="bg-primary text-white p-6 text-center">
            <h2 className="text-2xl font-bold mb-2">14-Day Free Trial</h2>
            <p className="opacity-90">Full access to all premium features</p>
          </div>
          
          <div className="p-8">
            <ul className="space-y-4 mb-8">
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary flex-shrink-0" />
                <span>Unified inbox for all communication channels</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary flex-shrink-0" />
                <span>AI-powered customer assistance</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary flex-shrink-0" />
                <span>Lead management and tracking</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary flex-shrink-0" />
                <span>Task management and collaboration tools</span>
              </li>
              <li className="flex items-center gap-3">
                <FaCheck className="text-primary flex-shrink-0" />
                <span>Quotes and invoices generation</span>
              </li>
            </ul>
            
            <button
              onClick={handleStartTrial}
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-4 rounded-lg font-semibold text-lg transition-colors flex items-center justify-center gap-2"
            >
              <FaRocket /> Sign Up & Start Free Trial
            </button>
            
            <div className="mt-6 text-center">
              <p className="text-gray-500 mb-2">
                Already have an account?
              </p>
              <Link to="/login?trial=true" className="text-primary hover:underline">
                Log in to start your trial
              </Link>
            </div>
            
            <div className="border-t border-gray-200 mt-6 pt-6">
              <div className="text-sm text-gray-500">
                <p className="mb-2"><strong>Important:</strong> After your 14-day trial ends:</p>
                <ul className="list-disc pl-5 space-y-1">
                  <li>Your account will be automatically logged out</li>
                  <li>All your data will be permanently deleted</li>
                  <li>You'll need to subscribe to a plan to continue using TariConnect</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center text-gray-600">
          <p>
            After your free trial ends, you can choose from our flexible pricing plans to continue using TariConnect.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;