import React, { useState } from 'react';
import { useAuth } from '../../store/useAuth';
import { doc, updateDoc } from 'firebase/firestore';
import { updateProfile } from 'firebase/auth';
import { db, auth } from '../../services/firebase';
import { FaUser, FaEdit } from 'react-icons/fa';

const Profile = () => {
  const { user, userData } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(userData?.name || '');
  const [originalName, setOriginalName] = useState(userData?.name || '');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [showSaveButton, setShowSaveButton] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      // Update Firebase Auth display name
      await updateProfile(auth.currentUser, { displayName: name });

      // Update Firestore user document
      await updateDoc(doc(db, 'users', user.uid), {
        name,
      });

      setSuccess('Profile updated successfully!');
      setIsEditing(false);
      setShowSaveButton(false);
      setOriginalName(name);
      
      // Hide success message after 3 seconds
      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      console.error('Profile update error:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">Your Profile</h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
            {success}
          </div>
        )}

        <div className="flex items-center mb-6">
          <div className="w-20 h-20 rounded-full bg-primary flex items-center justify-center text-white text-2xl mr-4">
            {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUser size={32} />}
          </div>

          <div>
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white">{userData?.name || 'User'}</h2>
            <p className="text-gray-600 dark:text-gray-300">{user?.email}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
              Role: {userData?.role === 'admin' ? 'Administrator' : 'User'}
            </p>
          </div>

          <button
            onClick={() => {
              setIsEditing(true);
              setShowSaveButton(false);
            }}
            className="ml-auto bg-primary/10 text-primary p-2 rounded-full hover:bg-primary/20"
          >
            <FaEdit />
          </button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2" htmlFor="name">
                Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => {
                  setName(e.target.value);
                  setShowSaveButton(e.target.value !== originalName);
                }}
                className="shadow appearance-none border border-gray-300 dark:border-gray-600 rounded w-full py-2 px-3 text-gray-700 dark:text-gray-200 dark:bg-gray-700 leading-tight focus:outline-none focus:shadow-outline focus:border-primary"
                placeholder="Your name"
                required
                disabled={isLoading}
              />
            </div>

            <div className="flex items-center justify-end">
              <button
                type="button"
                onClick={() => {
                  setIsEditing(false);
                  setName(originalName);
                  setShowSaveButton(false);
                }}
                className="bg-gray-300 hover:bg-gray-400 dark:bg-gray-600 dark:hover:bg-gray-500 text-gray-800 dark:text-gray-200 font-bold py-2 px-4 rounded mr-2"
                disabled={isLoading}
              >
                Cancel
              </button>
              {showSaveButton && (
                <button
                  type="submit"
                  className="bg-primary hover:bg-primary-dark text-white font-bold py-2 px-4 rounded"
                  disabled={isLoading}
                >
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </button>
              )}
            </div>
          </form>
        ) : (
          <div className="border-t pt-4 mt-4">
            <h3 className="font-semibold mb-2 text-gray-900 dark:text-white">Account Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Email</p>
                <p className="text-gray-900 dark:text-gray-200">{user?.email}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Account Created</p>
                <p className="text-gray-900 dark:text-gray-200">
                  {userData?.createdAt
                    ? userData.createdAt.toDate
                      ? new Date(userData.createdAt.toDate()).toLocaleDateString()
                      : new Date(userData.createdAt).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">Last Login</p>
                <p className="text-gray-900 dark:text-gray-200">
                  {userData?.lastLogin
                    ? userData.lastLogin.toDate
                      ? new Date(userData.lastLogin.toDate()).toLocaleDateString()
                      : new Date(userData.lastLogin).toLocaleDateString()
                    : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
