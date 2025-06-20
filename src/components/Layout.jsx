import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import ThemeToggle from './ThemeToggle';
import { 
  FaInbox, 
  FaUserFriends, 
  FaFileInvoiceDollar, 
  FaFileAlt, 
  FaBoxOpen, 
  FaTasks, 
  FaRobot, 
  FaTicketAlt, 
  FaFolder, 
  FaCog, 
  FaQuestionCircle, 
  FaSignOutAlt, 
  FaUser, 
  FaUserShield,
  FaTachometerAlt,
  FaBars,
  FaBell
} from 'react-icons/fa';

function Layout() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Check if a path is active
  const isActive = (path) => {
    return location.pathname.startsWith(path);
  };

  const navItems = [
    { path: '/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { path: '/leads', icon: <FaUserFriends />, label: 'Leads' },
    { path: '/quotes', icon: <FaFileAlt />, label: 'Quotes' },
    { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
    { path: '/items', icon: <FaBoxOpen />, label: 'Items' },
    { path: '/inbox', icon: <FaInbox />, label: 'Inbox' },
    { path: '/tasks', icon: <FaTasks />, label: 'Tasks' },
    { path: '/ai-agent', icon: <FaRobot />, label: 'AI Agent' },
    { path: '/tickets', icon: <FaTicketAlt />, label: 'Tickets' },
    { path: '/file-manager', icon: <FaFolder />, label: 'Files' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
    { path: '/support', icon: <FaQuestionCircle />, label: 'Support' },
  ];

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-gray-900">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-gray-200 dark:border-gray-700">
          {sidebarOpen && (
            <Link to="/dashboard" className="text-xl font-bold text-gray-900 dark:text-white">
              <span className="text-primary">Tari</span>Connect
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-400"
          >
            <FaBars />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-3 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User section */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
            </div>
            
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {userData?.name || user?.email}
                </p>
                <div className="flex items-center text-xs text-gray-500 dark:text-gray-400">
                  {userData?.role === 'admin' ? (
                    <Link to="/admin" className="flex items-center hover:text-primary">
                      <FaUserShield className="mr-1" /> Admin
                    </Link>
                  ) : (
                    <span>User</span>
                  )}
                </div>
              </div>
            )}
            
            {sidebarOpen && (
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Header */}
        <header className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
          <div className="px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <ThemeToggle />
              <button className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                <FaBell />
              </button>
              <Link 
                to="/profile" 
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
              >
                <FaUser />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;