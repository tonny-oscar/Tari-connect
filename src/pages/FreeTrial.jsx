import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { FaRocket, FaCheck } from 'react-icons/fa';

const FreeTrial = () => {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);

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
              <FaRocket />
              Start Free Trial
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
        
        <div className="mt-12">
          <h2 className="text-2xl font-bold text-center mb-6">Our Subscription Plans</h2>
          
          <div className="grid md:grid-cols-3 gap-6">
            {/* Monthly Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-blue-600 text-white p-4 text-center">
                <h3 className="text-xl font-bold">Monthly Plan</h3>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">$29</span>
                  <span className="text-gray-600">/month</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm">All core features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm">Monthly billing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-blue-600 flex-shrink-0" />
                    <span className="text-sm">Cancel anytime</span>
                  </li>
                </ul>
                <a
                  href="https://paystack.shop/pay/r-i8pq-8tk"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
            
            {/* Yearly Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-green-600 text-white p-4 text-center">
                <h3 className="text-xl font-bold">Yearly Plan</h3>
                <span className="text-xs bg-white text-green-600 px-2 py-1 rounded-full font-bold">SAVE 17%</span>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">$290</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-600 flex-shrink-0" />
                    <span className="text-sm">All core features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-600 flex-shrink-0" />
                    <span className="text-sm">Annual billing</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-green-600 flex-shrink-0" />
                    <span className="text-sm">Priority support</span>
                  </li>
                </ul>
                <a
                  href="https://paystack.shop/pay/yeru84kx5i"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
            
            {/* Premium Plan */}
            <div className="bg-white rounded-lg shadow-lg border border-gray-200 overflow-hidden">
              <div className="bg-purple-600 text-white p-4 text-center">
                <h3 className="text-xl font-bold">Premium Plan</h3>
                <span className="text-xs bg-white text-purple-600 px-2 py-1 rounded-full font-bold">BEST VALUE</span>
              </div>
              <div className="p-6">
                <div className="text-center mb-4">
                  <span className="text-3xl font-bold">$490</span>
                  <span className="text-gray-600">/year</span>
                </div>
                <ul className="space-y-2 mb-6">
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm">All core features</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm">Advanced AI capabilities</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <FaCheck className="text-purple-600 flex-shrink-0" />
                    <span className="text-sm">Dedicated support</span>
                  </li>
                </ul>
                <a
                  href="https://paystack.shop/pay/0t6ohcvmbo"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full bg-purple-600 hover:bg-purple-700 text-white py-2 px-4 rounded-lg transition-colors font-medium text-center"
                >
                  Subscribe Now
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FreeTrial;