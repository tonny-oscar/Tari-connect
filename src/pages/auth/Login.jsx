import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../../store/useAuth';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login, isAuthenticated, isAdmin } = useAuth();
  const navigate = useNavigate();
  
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
      const { success, error } = await login(email, password);
      
      if (success) {
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
      const { success, error } = await login('demo@example.com', 'demo123');
      
      if (success) {
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
    <div className="min-h-screen bg-slate-900 flex flex-col justify-center items-center p-4">
      <div className="absolute top-6 left-6">
        <Link to="/" className="text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-blue-500">Tari</span>Connect
        </Link>
      </div>
      
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md"
      >
        <div className="bg-slate-800 bg-opacity-80 backdrop-blur-sm p-8 rounded-2xl shadow-xl border border-slate-700">
          <h2 className="text-3xl font-bold text-white mb-6 text-center">Welcome Back</h2>
          
          {error && (
            <div className="bg-red-500 bg-opacity-10 border border-red-500 border-opacity-50 text-red-500 p-3 rounded mb-4 text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-300 mb-2" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full p-3 bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="you@example.com"
                required
                disabled={isLoading}
              />
            </div>
            
            <div className="mb-6">
              <div className="flex justify-between mb-2">
                <label className="text-gray-300" htmlFor="password">
                  Password
                </label>
                <Link to="/forgot-password" className="text-blue-400 text-sm hover:text-blue-300">
                  Forgot Password?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full p-3 bg-slate-700 bg-opacity-50 border border-slate-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-white"
                placeholder="••••••••"
                required
                disabled={isLoading}
              />
            </div>
            
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white py-3 rounded-lg font-medium transition-all duration-300 btn-hover"
            >
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
          
          <div className="mt-6 text-center text-gray-400">
            Don't have an account?{' '}
            <Link to="/register" className="text-blue-400 hover:text-blue-300">
              Sign up
            </Link>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-700 border-opacity-50 text-center">
            <div className="bg-blue-500 bg-opacity-10 border border-blue-500 border-opacity-50 text-blue-400 p-3 rounded mb-4 text-sm">
              <p className="font-medium mb-1">Admin Access:</p>
              <p>Use your registered email: betttonny26@gmail.com</p>
              <p className="text-xs mt-1 opacity-75">This email has been configured with admin privileges</p>
            </div>
            
            <button 
              onClick={handleDemoLogin}
              disabled={isLoading}
              className="text-blue-400 hover:text-blue-300"
            >
              Continue as Demo User
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;