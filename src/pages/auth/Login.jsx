import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/useAuth';
import { startFreeTrial } from '../../services/trialService';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const isTrialLogin = location.search.includes('trial=true');
  
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
    
    try {
      const { success, error, user } = await login(email, password);
      
      if (success) {
        // Start free trial if coming from trial page
        if (isTrialLogin && user) {
          await startFreeTrial(user.uid);
        }
        // Redirect based on user role
        navigate(isAdmin() ? '/admin' : '/dashboard');
      } else {
        setError(error || 'Invalid email or password. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Login error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    setIsLoading(true);
    setError('');
    
    try {
      const { success, error, user } = await login('demo@example.com', 'demo123');
      
      if (success) {
        // Start free trial if coming from trial page
        if (isTrialLogin && user) {
          await startFreeTrial(user.uid);
        }
        navigate('/dashboard');
      } else {
        setError(error || 'Failed to login with demo account. Please try again.');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
      console.error('Demo login error:', err);
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
            {isTrialLogin ? 'Log In to Start Your Trial' : 'Welcome Back'}
          </h2>
          
          {isTrialLogin && (
            <div className="bg-primary bg-opacity-10 border border-primary border-opacity-50 text-primary p-3 rounded mb-6 text-sm">
              Log in to start your 14-day free trial. No credit card required.
            </div>
          )}
          
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
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
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-gray-700" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-primary text-sm hover:text-primary-dark">
                  Forgot Password?
                </Link>
              </div>
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
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-primary hover:bg-primary-dark text-white py-3 rounded-lg font-medium transition-colors"
            >
              {isLoading ? 'Signing in...' : isTrialLogin ? 'Log In & Start Trial' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-600">
            Don't have an account?{' '}
            <Link to={isTrialLogin ? "/register?trial=true" : "/register"} className="text-primary hover:text-primary-dark">
              Sign up
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-gray-200 text-center">
            <div className="bg-gray-100 p-3 rounded mb-4 text-sm">
              <p className="font-medium mb-1 text-gray-700">Admin Access:</p>
              <p className="text-gray-600">Use your registered email: betttonny26@gmail.com</p>
              <p className="text-xs mt-1 text-gray-500">This email has been configured with admin privileges</p>
            </div>
            
            <button 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="text-primary hover:text-primary-dark"
            >
              Continue as Demo User
            </button>
          </div>
          
          {isTrialLogin && (
            <div className="mt-6 pt-6 border-t border-gray-200 text-xs text-gray-500 text-center">
              By starting a free trial, you agree that after 14 days, your trial will end and all data will be deleted unless you subscribe to a paid plan.
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default Login;