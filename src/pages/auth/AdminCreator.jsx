import React, { useState } from 'react';
import { createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../services/firebase';

const AdminCreator = () => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const createAdminAccount = async () => {
    setLoading(true);
    setMessage('');
    
    try {
      // Create admin user
      const email = 'admin@tariconnect.com';
      const password = 'admin123';
      
      // Create user in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      
      // Update profile with display name
      await updateProfile(user, {
        displayName: 'Admin User'
      });
      
      // Create user document in Firestore
      await setDoc(doc(db, 'users', user.uid), {
        uid: user.uid,
        email,
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        createdAt: new Date()
      });
      
      setMessage(`Admin account created successfully! 
        Email: admin@tariconnect.com
        Password: admin123
        
        You can now login with these credentials.`);
    } catch (error) {
      if (error.code === 'auth/email-already-in-use') {
        setMessage('Admin account already exists. You can login with:\nEmail: admin@tariconnect.com\nPassword: admin123');
      } else {
        setMessage(`Error creating admin account: ${error.message}`);
      }
      console.error('Error creating admin account:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-6 bg-white rounded-lg shadow-lg">
      <h1 className="text-2xl font-bold mb-6 text-center">Admin Account Creator</h1>
      
      <div className="mb-6">
        <p className="text-gray-600 mb-4">
          This utility will create an admin account with the following credentials:
        </p>
        <div className="bg-gray-100 p-4 rounded">
          <p><strong>Email:</strong> admin@tariconnect.com</p>
          <p><strong>Password:</strong> admin123</p>
        </div>
      </div>
      
      <button
        onClick={createAdminAccount}
        disabled={loading}
        className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
      >
        {loading ? 'Creating...' : 'Create Admin Account'}
      </button>
      
      {message && (
        <div className="mt-4 p-3 bg-blue-100 border border-blue-300 text-blue-800 rounded whitespace-pre-line">
          {message}
        </div>
      )}
    </div>
  );
};

export default AdminCreator;