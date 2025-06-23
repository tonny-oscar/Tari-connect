import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, initAuth } from './store/useAuth';
import { useTheme } from './store/useTheme';
import { initializePricingPlans } from './services/pricingService';
import { initializeAdminUsers } from './services/authService';
import PrivateRoute from './components/PrivateRoute';
import TrialExpiredModal from './components/TrialExpiredModal';

import {
  Login,
  Register,
  ForgotPassword,
  Dashboard,
  Profile,
  AdminDashboard,
  Inbox,
  Chat,
  Tickets,
  AIAgent,
  CombinedView,
  Quotes,
  Invoices,
  Items,
  Leads,
  Support,
  Tasks,
  FileManager,
  Settings,
  LandingPage
} from './pages';

import ContactDetails from './components/ContactDetails';
import FreeTrial from './pages/FreeTrial';

function App() {
  const { isLoading, isAuthenticated, hasTrialExpired } = useAuth();
  const { initTheme } = useTheme();
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  
  useEffect(() => {
    initTheme();
    
    const unsubscribe = initAuth();
    
    const initializeApp = async () => {
      try {
        await initializeAdminUsers();
        await initializePricingPlans();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
    
    return () => unsubscribe();
  }, [initTheme]);
  
  useEffect(() => {
    if (hasTrialExpired()) {
      setShowTrialExpiredModal(true);
    }
  }, [hasTrialExpired]);
  
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

  return (
    <>
      <TrialExpiredModal 
        isOpen={showTrialExpiredModal} 
        onClose={() => setShowTrialExpiredModal(false)}
      />
      
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        
        <Route element={<PrivateRoute />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/ai-agent" element={<AIAgent />} />
          <Route path="/combined" element={<CombinedView />} />
          <Route path="/combined/:conversationId" element={<CombinedView />} />
          <Route path="/leads" element={<Leads />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/items" element={<Items />} />
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/file-manager" element={<FileManager />} />
          <Route path="/support" element={<Support />} />
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/contact/:conversationId" element={<ContactDetails />} />
        </Route>
        
        <Route element={<PrivateRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pricing" element={<AdminDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

export default App;