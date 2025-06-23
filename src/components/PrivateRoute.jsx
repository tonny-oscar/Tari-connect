import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import Layout from './Layout';

const PrivateRoute = ({ requireAdmin = false }) => {
  const { user, userData, isLoading, isAuthenticated, isAdmin } = useAuth();
  
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="text-gray-800 text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Loading...</p>
        </div>
      </div>
    );
  }
  
  if (!isAuthenticated()) {
    return <Navigate to="/login" />;
  }
  
  if (requireAdmin && !isAdmin()) {
    return <Navigate to="/dashboard" />;
  }
  
  return <Layout />;
};

export default PrivateRoute;