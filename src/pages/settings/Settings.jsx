import React, { useState } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { FaBuilding, FaPlug, FaPalette, FaCreditCard, FaUsers, FaCog } from 'react-icons/fa';

// Settings sub-pages
const CompanyProfile = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">Company Profile</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <form>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Name</label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Your Company Name"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <select className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500">
              <option>Select Industry</option>
              <option>Technology</option>
              <option>Retail</option>
              <option>Healthcare</option>
              <option>Finance</option>
              <option>Education</option>
              <option>Other</option>
            </select>
          </div>
        </div>
        <div className="mt-6 flex justify-end">
          <button
            type="submit"
            className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
          >
            Save Changes
          </button>
        </div>
      </form>
    </div>
  </div>
);

const Integrations = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">Integrations</h2>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <h3 className="text-lg font-medium">Available Integrations</h3>
        <p className="text-gray-600">Connect your accounts to enhance your workflow</p>
      </div>
      <div className="divide-y">
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-md flex items-center justify-center mr-4">
              <span className="text-green-600 text-xl font-bold">W</span>
            </div>
            <div>
              <h4 className="font-medium">WhatsApp Business</h4>
              <p className="text-sm text-gray-600">Connect your WhatsApp Business account</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Connect
          </button>
        </div>
      </div>
    </div>
  </div>
);

const Appearance = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">Appearance</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Theme</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer bg-blue-50 border-blue-500">
            <div className="w-full h-24 bg-white rounded-md mb-2 overflow-hidden">
              <div className="h-6 bg-blue-600"></div>
              <div className="p-2">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="font-medium text-blue-600">Light (Default)</div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

const Billing = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">Billing & Subscription</h2>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="text-lg font-medium">Current Plan</h3>
            <p className="text-gray-600">Manage your subscription and billing details</p>
          </div>
          <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">Professional</span>
        </div>
      </div>
    </div>
  </div>
);

const UserManagement = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">User Management</h2>
    <div className="bg-white rounded-lg shadow">
      <div className="p-6 border-b flex justify-between items-center">
        <div>
          <h3 className="text-lg font-medium">Team Members</h3>
          <p className="text-gray-600">Manage your team and their access</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors flex items-center gap-1">
          <FaUsers />
          Add User
        </button>
      </div>
    </div>
  </div>
);

const GeneralSettings = () => (
  <div>
    <h2 className="text-xl font-bold mb-4">General Settings</h2>
    <div className="bg-white rounded-lg shadow p-6">
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">System Preferences</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Time Zone</h4>
              <p className="text-sm text-gray-600">Set your local time zone</p>
            </div>
            <select className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>Africa/Nairobi (GMT+3)</option>
              <option>UTC (GMT+0)</option>
              <option>America/New_York (GMT-5)</option>
              <option>Europe/London (GMT+0)</option>
              <option>Asia/Tokyo (GMT+9)</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mt-6 flex justify-end">
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
          Save Changes
        </button>
      </div>
    </div>
  </div>
);

const Settings = () => {
  const location = useLocation();
  const [currentPath, setCurrentPath] = useState('/settings');
  
  React.useEffect(() => {
    setCurrentPath(location.pathname);
  }, [location]);

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
        <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <nav className="space-y-1">
            {settingsMenu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  currentPath === item.path
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-50'
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