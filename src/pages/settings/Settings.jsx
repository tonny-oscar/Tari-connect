import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaPlug, FaPalette, FaCreditCard, FaUsers, FaCog, FaSpinner } from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';
import { useSettings } from '../../store/useSettings';
import { useTheme } from '../../store/useTheme';
import { getTimezones, getIndustries } from '../../services/settingsService';
import PaymentModal from '../../components/PaymentModal';

// Settings sub-pages
const CompanyProfile = () => {
  const { user } = useAuth();
  const { settings, updateCompany, isLoading, error, success, clearMessages } = useSettings();
  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    address: '',
    phone: '',
    website: ''
  });

  useEffect(() => {
    if (settings?.company) {
      setFormData(settings.company);
    }
  }, [settings]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      await updateCompany(user.uid, formData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Company Profile</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 mb-4 rounded">
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Company Name</label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Your Company Name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Industry</label>
              <select 
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select Industry</option>
                {getIndustries().map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Address</label>
              <input
                type="text"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Company Address"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone</label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="Company Phone"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Website</label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                placeholder="https://yourcompany.com"
              />
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Integrations = () => {
  const { user } = useAuth();
  const { settings, connectWhatsApp, disconnectWhatsApp, isLoading, error, success, clearMessages } = useSettings();
  const [whatsappForm, setWhatsappForm] = useState({ businessId: '', accessToken: '' });
  const [showWhatsappForm, setShowWhatsappForm] = useState(false);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => {
        clearMessages();
        setShowWhatsappForm(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  const handleWhatsappConnect = async (e) => {
    e.preventDefault();
    if (user && whatsappForm.businessId && whatsappForm.accessToken) {
      await connectWhatsApp(user.uid, whatsappForm.businessId, whatsappForm.accessToken);
      setWhatsappForm({ businessId: '', accessToken: '' });
    }
  };

  const handleWhatsappDisconnect = async () => {
    if (user) {
      await disconnectWhatsApp(user.uid);
    }
  };

  const isWhatsappConnected = settings?.integrations?.whatsapp?.connected;

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Integrations</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 mb-4 rounded">
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium dark:text-white">Available Integrations</h3>
          <p className="text-gray-600 dark:text-gray-400">Connect your accounts to enhance your workflow</p>
        </div>
        <div className="divide-y dark:divide-gray-700">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center">
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-md flex items-center justify-center mr-4">
                  <span className="text-green-600 dark:text-green-400 text-xl font-bold">W</span>
                </div>
                <div>
                  <h4 className="font-medium dark:text-white">WhatsApp Business</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    {isWhatsappConnected ? 'Connected and ready to use' : 'Connect your WhatsApp Business account'}
                  </p>
                  {isWhatsappConnected && (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 mt-1">
                      Connected
                    </span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                {isWhatsappConnected ? (
                  <button 
                    onClick={handleWhatsappDisconnect}
                    disabled={isLoading}
                    className="bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors disabled:opacity-50"
                  >
                    {isLoading ? <FaSpinner className="animate-spin" /> : 'Disconnect'}
                  </button>
                ) : (
                  <button 
                    onClick={() => setShowWhatsappForm(!showWhatsappForm)}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Connect
                  </button>
                )}
              </div>
            </div>
            
            {showWhatsappForm && !isWhatsappConnected && (
              <form onSubmit={handleWhatsappConnect} className="mt-4 p-4 bg-gray-50 dark:bg-gray-700 rounded-md">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Business ID</label>
                    <input
                      type="text"
                      value={whatsappForm.businessId}
                      onChange={(e) => setWhatsappForm({...whatsappForm, businessId: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Your WhatsApp Business ID"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Access Token</label>
                    <input
                      type="password"
                      value={whatsappForm.accessToken}
                      onChange={(e) => setWhatsappForm({...whatsappForm, accessToken: e.target.value})}
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-600 dark:text-white"
                      placeholder="Your Access Token"
                      required
                    />
                  </div>
                </div>
                <div className="mt-4 flex gap-2">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
                  >
                    {isLoading && <FaSpinner className="animate-spin" />}
                    Connect WhatsApp
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowWhatsappForm(false)}
                    className="bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

const Appearance = () => {
  const { isDark, toggleTheme } = useTheme();
  const [selectedTheme, setSelectedTheme] = useState(isDark ? 'dark' : 'light');

  const handleThemeChange = (theme) => {
    setSelectedTheme(theme);
    if ((theme === 'dark' && !isDark) || (theme === 'light' && isDark)) {
      toggleTheme();
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Appearance</h2>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <div className="mb-6">
          <h3 className="text-lg font-medium mb-4 dark:text-white">Theme</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div 
              onClick={() => handleThemeChange('light')}
              className={`border rounded-md p-4 flex flex-col items-center cursor-pointer transition-colors ${
                selectedTheme === 'light' 
                  ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <div className="w-full h-24 bg-white rounded-md mb-2 overflow-hidden border">
                <div className="h-6 bg-blue-600"></div>
                <div className="p-2">
                  <div className="h-3 bg-gray-200 rounded mb-1"></div>
                  <div className="h-3 bg-gray-200 rounded w-2/3"></div>
                </div>
              </div>
              <div className={`font-medium ${
                selectedTheme === 'light' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Light
              </div>
            </div>
            
            <div 
              onClick={() => handleThemeChange('dark')}
              className={`border rounded-md p-4 flex flex-col items-center cursor-pointer transition-colors ${
                selectedTheme === 'dark' 
                  ? 'bg-blue-50 border-blue-500 dark:bg-blue-900 dark:border-blue-400' 
                  : 'border-gray-300 hover:border-gray-400 dark:border-gray-600 dark:hover:border-gray-500'
              }`}
            >
              <div className="w-full h-24 bg-gray-800 rounded-md mb-2 overflow-hidden border">
                <div className="h-6 bg-blue-600"></div>
                <div className="p-2">
                  <div className="h-3 bg-gray-600 rounded mb-1"></div>
                  <div className="h-3 bg-gray-600 rounded w-2/3"></div>
                </div>
              </div>
              <div className={`font-medium ${
                selectedTheme === 'dark' ? 'text-blue-600' : 'text-gray-700 dark:text-gray-300'
              }`}>
                Dark
              </div>
            </div>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Theme changes are applied immediately. Your preference is saved automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

const Billing = () => {
  const { user } = useAuth();
  const [subscription, setSubscription] = useState(null);
  const [paymentHistory, setPaymentHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [pricingPlans, setPricingPlans] = useState([]);
  const [showPaymentModal, setShowPaymentModal] = useState(false);

  useEffect(() => {
    if (user) {
      loadBillingData();
    }
  }, [user]);

  const loadBillingData = async () => {
    setIsLoading(true);
    try {
      // Load subscription
      const { getUserSubscription } = await import('../../services/billingService');
      const { getPricingPlans } = await import('../../services/pricingService');
      const { getPaymentHistory } = await import('../../services/billingService');
      
      const [subResult, plansResult, paymentsResult] = await Promise.all([
        getUserSubscription(user.uid),
        getPricingPlans(),
        getPaymentHistory(user.uid)
      ]);
      
      if (subResult.success) setSubscription(subResult.subscription);
      if (plansResult.success) setPricingPlans(plansResult.plans);
      if (paymentsResult.success) setPaymentHistory(paymentsResult.payments);
      
    } catch (err) {
      setError('Failed to load billing data');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpgrade = async (plan) => {
    setSelectedPlan(plan);
    setShowUpgradeModal(true);
  };

  const confirmUpgrade = async () => {
    if (!selectedPlan) return;
    
    setShowUpgradeModal(false);
    setShowPaymentModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'pending': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'cancelled': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <FaSpinner className="animate-spin text-2xl text-blue-500" />
      </div>
    );
  }

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">Billing & Subscription</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {/* Current Subscription */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6 border-b dark:border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-lg font-medium dark:text-white">Current Plan</h3>
              <p className="text-gray-600 dark:text-gray-400">Manage your subscription and billing details</p>
            </div>
            {subscription && (
              <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(subscription.status)}`}>
                {subscription.planName}
              </span>
            )}
          </div>
        </div>
        
        {subscription && (
          <div className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Plan Details</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {subscription.planName} - {subscription.currency} {subscription.price.toLocaleString()}
                  {subscription.billingPeriod !== 'trial' && `/${subscription.billingPeriod}`}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Status</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 capitalize">
                  {subscription.status}
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-900 dark:text-white">Next Billing</h4>
                <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                  {new Date(subscription.endDate).toLocaleDateString()}
                </p>
              </div>
            </div>
            
            {subscription.features && (
              <div className="mt-6">
                <h4 className="font-medium text-gray-900 dark:text-white mb-2">Plan Features</h4>
                <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                  {subscription.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2">
                      <span className="text-green-500">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )}
      </div>
      
      {/* Available Plans */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow mb-6">
        <div className="p-6 border-b dark:border-gray-700">
          <h3 className="text-lg font-medium dark:text-white">Available Plans</h3>
          <p className="text-gray-600 dark:text-gray-400">Upgrade or change your subscription plan</p>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pricingPlans.map(plan => (
              <div key={plan.id} className={`border rounded-lg p-4 ${plan.isPopular ? 'border-blue-500 bg-blue-50 dark:bg-blue-900' : 'border-gray-200 dark:border-gray-700'}`}>
                <h4 className="font-bold text-lg dark:text-white">{plan.name}</h4>
                <p className="text-2xl font-bold mt-2 dark:text-white">
                  {plan.currency} {plan.price.toLocaleString()}
                  <span className="text-sm font-normal text-gray-600 dark:text-gray-400">/{plan.billingPeriod}</span>
                </p>
                <p className="text-gray-600 dark:text-gray-400 mt-2">{plan.description}</p>
                <ul className="mt-4 space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-center gap-2 text-sm">
                      <span className="text-green-500">✓</span>
                      <span className="dark:text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleUpgrade(plan)}
                  disabled={subscription?.planId === plan.id}
                  className={`w-full mt-4 px-4 py-2 rounded-md transition-colors ${
                    subscription?.planId === plan.id
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-blue-600 text-white hover:bg-blue-700'
                  }`}
                >
                  {subscription?.planId === plan.id ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Payment History */}
      {paymentHistory.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="p-6 border-b dark:border-gray-700">
            <h3 className="text-lg font-medium dark:text-white">Payment History</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Method</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {paymentHistory.slice(0, 5).map(payment => (
                  <tr key={payment.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {new Date(payment.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                      {payment.currency} {payment.amount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300 capitalize">
                      {payment.paymentMethod}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(payment.status)}`}>
                        {payment.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {/* Upgrade Modal */}
      {showUpgradeModal && selectedPlan && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Confirm Plan Upgrade</h3>
              <p className="text-gray-600 dark:text-gray-400 mb-4">
                You are about to upgrade to the <strong>{selectedPlan.name}</strong> plan for {selectedPlan.currency} {selectedPlan.price.toLocaleString()}/{selectedPlan.billingPeriod}.
              </p>
              <div className="flex gap-4">
                <button
                  onClick={confirmUpgrade}
                  className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                >
                  Confirm Upgrade
                </button>
                <button
                  onClick={() => setShowUpgradeModal(false)}
                  className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Payment Modal */}
      <PaymentModal 
        isOpen={showPaymentModal}
        onClose={() => {
          setShowPaymentModal(false);
          setSelectedPlan(null);
        }}
        plan={selectedPlan}
      />
    </div>
  );
};

const UserManagement = () => {
  const { user, userData } = useAuth();
  const [teamMembers, setTeamMembers] = useState([]);
  const [showAddUser, setShowAddUser] = useState(false);
  const [newUser, setNewUser] = useState({ email: '', role: 'user' });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    loadTeamMembers();
  }, []);

  const loadTeamMembers = async () => {
    // In a real implementation, this would load team members from the database
    // For now, we'll show the current user
    if (user && userData) {
      setTeamMembers([{
        id: user.uid,
        email: user.email,
        name: userData.name || user.displayName,
        role: userData.role || 'user',
        status: 'active',
        lastLogin: userData.lastLogin || new Date().toISOString()
      }]);
    }
  };

  const handleAddUser = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');
    
    try {
      // In a real implementation, this would send an invitation email
      // For demo purposes, we'll just show a success message
      setSuccess(`Invitation sent to ${newUser.email}`);
      setNewUser({ email: '', role: 'user' });
      setShowAddUser(false);
    } catch (err) {
      setError('Failed to send invitation');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">User Management</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 mb-4 rounded">
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow">
        <div className="p-6 border-b dark:border-gray-700 flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium dark:text-white">Team Members</h3>
            <p className="text-gray-600 dark:text-gray-400">Manage your team and their access</p>
          </div>
          <button 
            onClick={() => setShowAddUser(true)}
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <FaUsers />
            Add User
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Role</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Last Login</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {teamMembers.map(member => (
                <tr key={member.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900 dark:text-gray-300">{member.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{member.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      member.role === 'admin' 
                        ? 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200'
                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200'
                    }`}>
                      {member.role}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200">
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-300">
                    {new Date(member.lastLogin).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4">
                      Edit
                    </button>
                    {member.id !== user?.uid && (
                      <button className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300">
                        Remove
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Add User Modal */}
      {showAddUser && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Add Team Member</h3>
              <form onSubmit={handleAddUser}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                  <input
                    type="email"
                    value={newUser.email}
                    onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                    placeholder="user@example.com"
                    required
                  />
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Role</label>
                  <select
                    value={newUser.role}
                    onChange={(e) => setNewUser({...newUser, role: e.target.value})}
                    className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <button
                    type="submit"
                    disabled={isLoading}
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isLoading && <FaSpinner className="animate-spin" />}
                    Send Invitation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowAddUser(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const GeneralSettings = () => {
  const { user } = useAuth();
  const { settings, updateSystem, isLoading, error, success, clearMessages } = useSettings();
  const [formData, setFormData] = useState({
    timezone: 'Africa/Nairobi',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    currency: 'KSh'
  });

  useEffect(() => {
    if (settings?.system) {
      setFormData(settings.system);
    }
  }, [settings]);

  useEffect(() => {
    if (success || error) {
      const timer = setTimeout(() => clearMessages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [success, error, clearMessages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (user) {
      await updateSystem(user.uid, formData);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  return (
    <div>
      <h2 className="text-xl font-bold mb-4 dark:text-white">General Settings</h2>
      
      {error && (
        <div className="bg-red-100 dark:bg-red-900 border border-red-400 dark:border-red-600 text-red-700 dark:text-red-200 px-4 py-3 mb-4 rounded">
          {error}
        </div>
      )}
      
      {success && (
        <div className="bg-green-100 dark:bg-green-900 border border-green-400 dark:border-green-600 text-green-700 dark:text-green-200 px-4 py-3 mb-4 rounded">
          {success}
        </div>
      )}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6">
        <form onSubmit={handleSubmit}>
          <div className="mb-6">
            <h3 className="text-lg font-medium mb-4 dark:text-white">System Preferences</h3>
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Time Zone</label>
                  <select 
                    name="timezone"
                    value={formData.timezone}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    {getTimezones().map(tz => (
                      <option key={tz.value} value={tz.value}>{tz.label}</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Language</label>
                  <select 
                    name="language"
                    value={formData.language}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Date Format</label>
                  <select 
                    name="dateFormat"
                    value={formData.dateFormat}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                    <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                    <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Currency</label>
                  <select 
                    name="currency"
                    value={formData.currency}
                    onChange={handleChange}
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  >
                    <option value="KSh">Kenyan Shilling (KSh)</option>
                    <option value="USD">US Dollar ($)</option>
                    <option value="EUR">Euro (€)</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end">
            <button
              type="submit"
              disabled={isLoading}
              className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center gap-2"
            >
              {isLoading && <FaSpinner className="animate-spin" />}
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const Settings = () => {
  const location = useLocation();
  const { user } = useAuth();
  const { loadSettings, settings } = useSettings();
  const [currentPath, setCurrentPath] = useState('/settings');
  
  React.useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);
  
  // Load user settings when component mounts
  React.useEffect(() => {
    if (user && !settings) {
      loadSettings(user.uid);
    }
  }, [user, settings, loadSettings]);

  const settingsMenu = [
    { path: '/settings', icon: <FaCog />, label: 'General' },
    { path: '/settings/company', icon: <FaBuilding />, label: 'Company' },
    { path: '/settings/integrations', icon: <FaPlug />, label: 'Integrations' },
    { path: '/settings/appearance', icon: <FaPalette />, label: 'Appearance' },
    { path: '/settings/billing', icon: <FaCreditCard />, label: 'Billing' },
    { path: '/settings/users', icon: <FaUsers />, label: 'Users' },
  ];

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Settings</h1>
        <p className="text-gray-600">Configure your application preferences</p>
      </div>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings navigation */}
        <div className="w-full md:w-64 bg-white dark:bg-gray-800 rounded-lg shadow p-4">
          <nav className="space-y-1">
            {settingsMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  currentPath === item.path
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900 dark:text-blue-400'
                    : 'text-gray-700 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-700'
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </nav>
        </div>
        
        {/* Settings content */}
        <div className="flex-1">
          <Routes>
            <Route path="/" element={<GeneralSettings />} />
            <Route path="/company" element={<CompanyProfile />} />
            <Route path="/integrations" element={<Integrations />} />
            <Route path="/appearance" element={<Appearance />} />
            <Route path="/billing" element={<Billing />} />
            <Route path="/users" element={<UserManagement />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;