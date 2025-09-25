import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, initAuth } from './store/useAuth';
import { useTheme } from './store/useTheme';
import './App.css';
import { initializePricingPlans } from './services/pricingService';
import { initializeAdminUsers } from './services/authService';
import { startTrialCleanup } from './utils/trialCleanup';
import PrivateRoute from './components/PrivateRoute';
import TrialExpiredModal from './components/TrialExpiredModal';
import SubscriptionGate from './components/SubscriptionGate';

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
import PaymentVerification from './pages/PaymentVerification';
import DirectPaymentDemo from './pages/DirectPaymentDemo';
import AcceptInvitation from './pages/AcceptInvitation';
import Integrations from './components/Intergrations'; 

function App() {
  const { isLoading, isAuthenticated, hasTrialExpired, user } = useAuth(); // ✅ now user is defined
  const { initTheme } = useTheme();
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  
  useEffect(() => {
    initTheme();
    
    const unsubscribe = initAuth();
    
    const initializeApp = async () => {
      try {
        await initializeAdminUsers();
        await initializePricingPlans();
        startTrialCleanup();
      } catch (error) {
        console.error('Error initializing app:', error);
      }
    };
    
    initializeApp();
    
    return () => unsubscribe();
  }, [initTheme]);
  
  useEffect(() => {
    if (hasTrialExpired && hasTrialExpired()) {
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
        <Route path="/accept-invitation" element={<AcceptInvitation />} />
        <Route path="/payment/verify" element={<PaymentVerification />} />
        <Route path="/payment/demo" element={<DirectPaymentDemo />} />
        
        <Route path="/" element={<PrivateRoute />}>
          <Route path="dashboard" element={<SubscriptionGate><Dashboard /></SubscriptionGate>} />
          <Route path="inbox" element={<SubscriptionGate><Inbox /></SubscriptionGate>} />
          <Route path="chat/:conversationId" element={<SubscriptionGate><Chat /></SubscriptionGate>} />
          <Route path="tickets" element={<SubscriptionGate><Tickets /></SubscriptionGate>} />
          <Route path="ai-agent" element={<SubscriptionGate><AIAgent /></SubscriptionGate>} />
          <Route path="combined" element={<SubscriptionGate><CombinedView /></SubscriptionGate>} />
          <Route path="combined/:conversationId" element={<SubscriptionGate><CombinedView /></SubscriptionGate>} />
          <Route path="leads" element={<SubscriptionGate><Leads /></SubscriptionGate>} />
          <Route path="quotes" element={<SubscriptionGate><Quotes /></SubscriptionGate>} />
          <Route path="invoices" element={<SubscriptionGate><Invoices /></SubscriptionGate>} />
          <Route path="items" element={<SubscriptionGate><Items /></SubscriptionGate>} />
          <Route path="tasks" element={<SubscriptionGate><Tasks /></SubscriptionGate>} />
          <Route path="file-manager" element={<SubscriptionGate><FileManager /></SubscriptionGate>} />
          <Route path="support" element={<Support />} />
          <Route path="settings/*" element={<Settings />} />
          <Route path="profile" element={<Profile />} />
          <Route path="contact/:conversationId" element={<ContactDetails />} />
          <Route path="integrations" element={<Integrations userId={user?.uid} />} /> {/* ✅ fixed */}
        </Route>
        
        <Route path="admin" element={<PrivateRoute requireAdmin={true} />}>
          <Route index element={<AdminDashboard />} />
          <Route path="pricing" element={<AdminDashboard />} />
        </Route>
        
        <Route path="*" element={<Navigate to={isAuthenticated && isAuthenticated() ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

export default App;
