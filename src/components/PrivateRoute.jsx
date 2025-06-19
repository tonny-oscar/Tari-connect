import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import Layout from './Layout';

const PrivateRoute = ({ requireAdmin = false }) => {
  const { user, userData, isLoading, isAuthenticated, isAdmin } = useAuth();
  
  // Show loading state while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="text-white text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  // Check if user is authenticated
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  // Check if admin access is required
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  // Render the protected content with Layout
  return <Layout />;
};

export default PrivateRoute;