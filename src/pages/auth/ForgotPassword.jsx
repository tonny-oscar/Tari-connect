import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { FaEnvelope, FaArrowLeft, FaCheck } from 'react-icons/fa';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      return saved === 'dark' || (!saved && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });

  useEffect(() => {
    if (isDark) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDark]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      await sendPasswordResetEmail(auth, email);
      setSuccess(true);
    } catch (error) {
      setError(error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Theme Toggle */}
        <div className="flex justify-end mb-4">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg bg-white shadow-md hover:shadow-lg transition-all duration-200"
          >
            {isDark ? '☀️' : '🌙'}
          </button>
        </div>

        {/* Forgot Password Card */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-8">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-primary to-primary-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="text-2xl font-bold text-white">TC</span>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reset Password</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your email address and we'll send you a link to reset your password
            </p>
          </div>

          {success ? (
            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <FaCheck className="text-green-600 text-2xl" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Check your email</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                We've sent a password reset link to <strong>{email}</strong>
              </p>
              <div className="space-y-4">
                <p className="text-sm text-gray-500 dark:text-gray-300">
                  Didn't receive the email? Check your spam folder or try again.
                </p>
                <button
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="text-primary hover:text-primary-dark font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {error && (
                <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-red-600 text-sm">{error}</p>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaEnvelope className="h-5 w-5 text-gray-400" />
                    </div>
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:opacity-50 dark:bg-gray-700 dark:text-white"
                      placeholder="Enter your email address"
                      required
                      disabled={loading}
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-primary to-primary-600 text-white py-3 px-4 rounded-lg font-medium hover:from-primary-600 hover:to-primary-700 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    'Send Reset Link'
                  )}
                </button>
              </form>
            </>
          )}

          {/* Back to Login Link */}
          <div className="mt-8 text-center">
            <Link
              to="/login"
              className="inline-flex items-center gap-2 text-primary hover:text-primary-dark font-medium"
            >
              <FaArrowLeft className="w-4 h-4" />
              Back to Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-8">
          <p className="text-gray-500 dark:text-gray-400 text-sm">
            © 2024 TariConnect. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
