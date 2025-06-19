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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="contact@yourcompany.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="+1 (123) 456-7890"
            />
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              rows="3"
              placeholder="Your company address"
            ></textarea>
          </div>
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Company Logo</label>
            <div className="flex items-center">
              <div className="w-20 h-20 bg-gray-200 rounded-md flex items-center justify-center mr-4">
                <FaBuilding className="text-gray-400 text-3xl" />
              </div>
              <label className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors cursor-pointer">
                Upload Logo
                <input type="file" className="hidden" />
              </label>
            </div>
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
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-md flex items-center justify-center mr-4">
              <span className="text-blue-600 text-xl font-bold">F</span>
            </div>
            <div>
              <h4 className="font-medium">Facebook Messenger</h4>
              <p className="text-sm text-gray-600">Connect your Facebook Page</p>
            </div>
          </div>
          <button className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            Connect
          </button>
        </div>
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-purple-100 rounded-md flex items-center justify-center mr-4">
              <span className="text-purple-600 text-xl font-bold">I</span>
            </div>
            <div>
              <h4 className="font-medium">Instagram</h4>
              <p className="text-sm text-gray-600">Connect your Instagram Business account</p>
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
          <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50">
            <div className="w-full h-24 bg-gray-900 rounded-md mb-2 overflow-hidden">
              <div className="h-6 bg-gray-800"></div>
              <div className="p-2">
                <div className="h-3 bg-gray-700 rounded mb-1"></div>
                <div className="h-3 bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
            <div className="font-medium">Dark</div>
          </div>
          <div className="border rounded-md p-4 flex flex-col items-center cursor-pointer hover:bg-gray-50">
            <div className="w-full h-24 bg-white rounded-md mb-2 overflow-hidden">
              <div className="h-6 bg-purple-600"></div>
              <div className="p-2">
                <div className="h-3 bg-gray-200 rounded mb-1"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </div>
            <div className="font-medium">Purple</div>
          </div>
        </div>
      </div>
      <div>
        <h3 className="text-lg font-medium mb-4">Accent Color</h3>
        <div className="flex flex-wrap gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-600 cursor-pointer ring-2 ring-offset-2 ring-blue-600"></div>
          <div className="w-8 h-8 rounded-full bg-purple-600 cursor-pointer"></div>
          <div className="w-8 h-8 rounded-full bg-green-600 cursor-pointer"></div>
          <div className="w-8 h-8 rounded-full bg-red-600 cursor-pointer"></div>
          <div className="w-8 h-8 rounded-full bg-yellow-500 cursor-pointer"></div>
          <div className="w-8 h-8 rounded-full bg-pink-600 cursor-pointer"></div>
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
      <div className="p-6 border-b">
        <div className="flex justify-between items-center mb-4">
          <div>
            <h4 className="font-medium">Professional Plan</h4>
            <p className="text-sm text-gray-600">KSh 7,900 / month</p>
          </div>
          <button className="text-blue-600 hover:text-blue-800 font-medium">Change Plan</button>
        </div>
        <div className="bg-gray-50 p-4 rounded-md">
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Next billing date</span>
            <span>June 15, 2023</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-gray-600">Payment method</span>
            <span>Visa ending in 4242</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Billing email</span>
            <span>billing@yourcompany.com</span>
          </div>
        </div>
      </div>
      <div className="p-6">
        <h4 className="font-medium mb-4">Payment Methods</h4>
        <div className="flex items-center justify-between mb-4 p-3 border rounded-md">
          <div className="flex items-center">
            <div className="w-10 h-6 bg-blue-100 rounded mr-3 flex items-center justify-center text-blue-800 font-bold text-xs">
              VISA
            </div>
            <span>•••• •••• •••• 4242</span>
          </div>
          <span className="text-sm text-gray-500">Expires 12/24</span>
        </div>
        <button className="text-blue-600 hover:text-blue-800 font-medium flex items-center gap-1">
          <FaCreditCard /> Add Payment Method
        </button>
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
          <FaUsers /> Invite User
        </button>
      </div>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Last Active</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                    JD
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">John Doe</div>
                    <div className="text-sm text-gray-500">john@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                  Admin
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Today, 2:30 PM
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-900">Remove</button>
              </td>
            </tr>
            <tr>
              <td className="px-6 py-4 whitespace-nowrap">
                <div className="flex items-center">
                  <div className="flex-shrink-0 h-10 w-10 rounded-full bg-green-600 flex items-center justify-center text-white">
                    JS
                  </div>
                  <div className="ml-4">
                    <div className="text-sm font-medium text-gray-900">Jane Smith</div>
                    <div className="text-sm text-gray-500">jane@example.com</div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  Agent
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                  Active
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                Yesterday, 5:12 PM
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button className="text-blue-600 hover:text-blue-900 mr-3">Edit</button>
                <button className="text-red-600 hover:text-red-900">Remove</button>
              </td>
            </tr>
          </tbody>
        </table>
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
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Date Format</h4>
              <p className="text-sm text-gray-600">Choose your preferred date format</p>
            </div>
            <select className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>DD/MM/YYYY</option>
              <option>MM/DD/YYYY</option>
              <option>YYYY-MM-DD</option>
            </select>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Language</h4>
              <p className="text-sm text-gray-600">Set your preferred language</p>
            </div>
            <select className="border border-gray-300 rounded-md p-2 focus:ring-blue-500 focus:border-blue-500">
              <option>English</option>
              <option>Swahili</option>
              <option>French</option>
              <option>Spanish</option>
            </select>
          </div>
        </div>
      </div>
      <div className="mb-6">
        <h3 className="text-lg font-medium mb-4">Notifications</h3>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Email Notifications</h4>
              <p className="text-sm text-gray-600">Receive notifications via email</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Browser Notifications</h4>
              <p className="text-sm text-gray-600">Show desktop notifications</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" checked />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <h4 className="font-medium">Sound Alerts</h4>
              <p className="text-sm text-gray-600">Play sound for new messages</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            </label>
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
    { path: '/settings/company', icon: <FaBuilding />, label: 'Company Profile' },
    { path: '/settings/integrations', icon: <FaPlug />, label: 'Integrations' },
    { path: '/settings/appearance', icon: <FaPalette />, label: 'Appearance' },
    { path: '/settings/billing', icon: <FaCreditCard />, label: 'Billing' },
    { path: '/settings/users', icon: <FaUsers />, label: 'User Management' },
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