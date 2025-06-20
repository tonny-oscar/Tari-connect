import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/useAuth';
import { startFreeTrial } from '../../services/trialService';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { register, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTrialSignup = location.search.includes('trial=true');
  
  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated()) {
      navigate(isAdmin() ? '/admin' : '/dashboard');
    }
  }, [isAuthenticated, isAdmin, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      setIsLoading(false);
      return;
    }
    
    // Validate password strength
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setIsLoading(false);
      return;
    }
    
    try {
      const { success, error, user } = await register(email, password, name);
      
      if (success) {
        // Start free trial if coming from trial page
        if (isTrialSignup && user) {
          await startFreeTrial(user.uid);
        }
        navigate('/dashboard');
      } else {
        setError(error || 'Failed to register. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Registration error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-white flex flex-col justify-center items-center p-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-2xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-primary">Tari</span>Connect
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-white rounded-2xl shadow-xl border border-gray-200 p-8">
          <h2 className="text-3xl font-bold text-gray-800 mb-6 text-center">
            {isTrialSignup ? 'Start Your Free Trial' : 'Create Account'}
          </h2>
          
          {isTrialSignup && (
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-50 text-primary p-3 rounded mb-6 text-sm">
              You're signing up for a 14-day free trial. No credit card required.
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="name">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                placeholder="John Doe"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="confirmPassword">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary text-gray-700"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Creating Account...' : isTrialSignup ? 'Start Free Trial' : 'Create Account'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            Already have an account?{' '}
            <Link to={isTrialSignup ? "/login?trial=true" : "/login"} className="text-primary hover:text-primary-dark">
              Sign in
            </Link>
          </div>
          
          {isTrialSignup && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
              By starting a free trial, you agree that after 14 days, your trial will end and all data will be deleted unless you subscribe to a paid plan.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Register;