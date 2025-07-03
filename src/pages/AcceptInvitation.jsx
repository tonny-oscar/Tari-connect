import React, { useState, useEffect } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { FaSpinner, FaCheck, FaTimes } from 'react-icons/fa';
import { acceptInvitation } from '../services/invitationService';
import { useAuth } from '../store/useAuth';

const AcceptInvitation = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user, login } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [invitation, setInvitation] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  });

  const invitationCode = searchParams.get('code');

  useEffect(() => {
    if (!invitationCode) {
      setError('Invalid invitation link');
      return;
    }

    if (user) {
      handleAcceptInvitation();
    }
  }, [invitationCode, user]);

  const handleAcceptInvitation = async () => {
    setIsLoading(true);
    setError('');

    try {
      const result = await acceptInvitation(invitationCode, user);
      
      if (result.success) {
        setInvitation(result.invitation);
        setSuccess('Invitation accepted successfully!');
        setTimeout(() => {
          navigate('/dashboard');
        }, 2000);
      } else {
        setError(result.error || 'Failed to accept invitation');
      }
    } catch (err) {
      setError('Failed to accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSignUpAndAccept = async (e) => {
    e.preventDefault();
    
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const signUpResult = await login(formData.email, formData.password, formData.name, true);
      
      if (signUpResult.success) {
        const acceptResult = await acceptInvitation(invitationCode, signUpResult.user);
        
        if (acceptResult.success) {
          setSuccess('Account created and invitation accepted!');
          setTimeout(() => {
            navigate('/dashboard');
          }, 2000);
        } else {
          setError(acceptResult.error || 'Failed to accept invitation');
        }
      } else {
        setError(signUpResult.error || 'Failed to create account');
      }
    } catch (err) {
      setError('Failed to create account and accept invitation');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  if (!invitationCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            <FaTimes className="mx-auto h-12 w-12 text-red-500" />
            <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
              Invalid Invitation
            </h2>
            <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
              The invitation link is invalid or has expired.
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center">
            {success ? (
              <>
                <FaCheck className="mx-auto h-12 w-12 text-green-500" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Invitation Accepted!
                </h2>
                <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                  {success}
                </p>
              </>
            ) : error ? (
              <>
                <FaTimes className="mx-auto h-12 w-12 text-red-500" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Error
                </h2>
                <p className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {error}
                </p>
              </>
            ) : (
              <>
                <FaSpinner className="mx-auto h-12 w-12 text-blue-500 animate-spin" />
                <h2 className="mt-6 text-3xl font-extrabold text-gray-900 dark:text-white">
                  Processing Invitation...
                </h2>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900 dark:text-white">
            Accept Invitation
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600 dark:text-gray-400">
            Create your account to join Tari Connect
          </p>
        </div>

        {error && (
          <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form className="mt-8 space-y-6" onSubmit={handleSignUpAndAccept}>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Full Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Enter your full name"
              />
            </div>
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Email Address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Create a password"
              />
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Confirm Password
              </label>
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={handleChange}
                className="mt-1 appearance-none relative block w-full px-3 py-2 border border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400 text-gray-900 dark:text-white rounded-md focus:outline-none focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700"
                placeholder="Confirm your password"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading && <FaSpinner className="animate-spin mr-2" />}
              Accept Invitation & Create Account
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AcceptInvitation;