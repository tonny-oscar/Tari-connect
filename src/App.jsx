import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Chat from './pages/Chat';
import ContactDetails from './components/ContactDetails';
import CombinedView from './pages/CombinedView';
import Tasks from './pages/Tasks';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth, initAuth } from './store/useAuth';
import { initializePricingPlans } from './services/pricingService';

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Initialize authentication state and pricing plans
  useEffect(() => {
    const unsubscribe = initAuth();
    initializePricingPlans(); // Initialize pricing plans
    return () => unsubscribe();
  }, []);
  
  // Show loading state while initializing auth
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

  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      
      {/* Protected routes */}
      <Route element={<PrivateRoute />}>
        {/* Dashboard */}
        <Route path="/dashboard" element={<Dashboard />} />
        
        {/* Tasks */}
        <Route path="/tasks" element={<Tasks />} />
        
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
        
        {/* Individual routes */}
        <Route path="/chat/:conversationId" element={<Chat />} />
        <Route path="/contact/:conversationId" element={<ContactDetails />} />
        
        {/* Combined view */}
        <Route path="/combined" element={<CombinedView />} />
        <Route path="/combined/:conversationId" element={<CombinedView />} />
      </Route>
      
      {/* Admin routes */}
      <Route element={<PrivateRoute requireAdmin={true} />}>
        <Route path="/admin" element={<AdminDashboard />} />
        <Route path="/admin/pricing" element={<AdminDashboard />} />
      </Route>
      
      {/* Redirect to appropriate page */}
      <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/"} />} />
    </Routes>
  );
}

export default App;