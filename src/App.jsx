import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth, initAuth } from './store/useAuth';
import { useTheme } from './store/useTheme';
import { initializePricingPlans } from './services/pricingService';
import { initializeAdminUsers } from './services/authService';
import PrivateRoute from './components/PrivateRoute';
import TrialExpiredModal from './components/TrialExpiredModal';

// Import all pages from the pages directory
import {
  // Auth pages
  Login,
  Register,
  ForgotPassword,
  
  // Dashboard pages
  Dashboard,
  Profile,
  
  // Admin pages
  AdminDashboard,
  
  // Communication pages
  Inbox,
  Chat,
  Tickets,
  AIAgent,
  CombinedView,
  
  // Finance pages
  Quotes,
  Invoices,
  Items,
  Leads,
  
  // Support pages
  Support,
  Tasks,
  FileManager,
  
  // Settings pages
  Settings,
  
  // Other pages
  LandingPage
} from './pages';

// Import components
import ContactDetails from './components/ContactDetails';
import AdminCreator from './pages/auth/AdminCreator';
import FreeTrial from './pages/FreeTrial';

function App() {
  const { isLoading, isAuthenticated, hasTrialExpired } = useAuth();
  const { initTheme } = useTheme();
  const [showTrialExpiredModal, setShowTrialExpiredModal] = useState(false);
  
  // Initialize theme and authentication
  useEffect(() => {
    // Initialize theme first
    initTheme();
    
    // Initialize auth
    const unsubscribe = initAuth();
    
    // Initialize data
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
  
  // Show trial expired modal when trial expires
  useEffect(() => {
    if (hasTrialExpired()) {
      setShowTrialExpiredModal(true);
    }
  }, [hasTrialExpired]);
  
  // Show loading state while initializing auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-white dark:bg-gray-900 flex items-center justify-center">
        <div className="text-gray-800 dark:text-white text-center">
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
        {/* Public routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/admin-creator" element={<AdminCreator />} />
        <Route path="/free-trial" element={<FreeTrial />} />
        
        {/* Protected routes */}
        <Route element={<PrivateRoute />}>
          {/* Dashboard */}
          <Route path="/dashboard" element={<Dashboard />} />
          
          {/* Communication */}
          <Route path="/inbox" element={<Inbox />} />
          <Route path="/chat/:conversationId" element={<Chat />} />
          <Route path="/tickets" element={<Tickets />} />
          <Route path="/ai-agent" element={<AIAgent />} />
          <Route path="/combined" element={<CombinedView />} />
          <Route path="/combined/:conversationId" element={<CombinedView />} />
          
          {/* Finance */}
          <Route path="/leads" element={<Leads />} />
          <Route path="/quotes" element={<Quotes />} />
          <Route path="/invoices" element={<Invoices />} />
          <Route path="/items" element={<Items />} />
          
          {/* Support */}
          <Route path="/tasks" element={<Tasks />} />
          <Route path="/file-manager" element={<FileManager />} />
          <Route path="/support" element={<Support />} />
          
          {/* Settings */}
          <Route path="/settings/*" element={<Settings />} />
          <Route path="/profile" element={<Profile />} />
          
          {/* Legacy routes */}
          <Route path="/contact/:conversationId" element={<ContactDetails />} />
        </Route>
        
        {/* Admin routes */}
        <Route element={<PrivateRoute requireAdmin={true} />}>
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/admin/pricing" element={<AdminDashboard />} />
        </Route>
        
        {/* Redirect to appropriate page */}
        <Route path="*" element={<Navigate to={isAuthenticated() ? "/dashboard" : "/"} />} />
      </Routes>
    </>
  );
}

export default App;