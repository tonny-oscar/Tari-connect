import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import AdminDashboard from './pages/AdminDashboard';
import LandingPage from './pages/LandingPage';
import PrivateRoute from './components/PrivateRoute';
import { useAuth, initAuth } from './store/useAuth';
import { initializePricingPlans } from './services/pricingService';
import { initializeAdminUsers } from './services/authService';

// New pages
import Inbox from './pages/Inbox';
import Leads from './pages/Leads';
import Quotes from './pages/Quotes';
import Invoices from './pages/Invoices';
import Items from './pages/Items';
import Tasks from './pages/Tasks';
import AIAgent from './pages/AIAgent';
import Tickets from './pages/Tickets';
import FileManager from './pages/FileManager';
import Settings from './pages/Settings';
import Support from './pages/Support';

function App() {
  const { isLoading, isAuthenticated } = useAuth();
  
  // Initialize authentication state, pricing plans, and admin users
  useEffect(() => {
    const unsubscribe = initAuth();
    
    // Initialize data
    const initializeApp = async () => {
      await initializeAdminUsers();
      await initializePricingPlans();
    };
    
    initializeApp();
    
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
        
        {/* Main features */}
        <Route path="/inbox" element={<Inbox />} />
        <Route path="/leads" element={<Leads />} />
        <Route path="/quotes" element={<Quotes />} />
        <Route path="/invoices" element={<Invoices />} />
        <Route path="/items" element={<Items />} />
        <Route path="/tasks" element={<Tasks />} />
        <Route path="/ai-agent" element={<AIAgent />} />
        <Route path="/tickets" element={<Tickets />} />
        <Route path="/file-manager" element={<FileManager />} />
        
        {/* Settings and support */}
        <Route path="/settings/*" element={<Settings />} />
        <Route path="/support" element={<Support />} />
        
        {/* Profile */}
        <Route path="/profile" element={<Profile />} />
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