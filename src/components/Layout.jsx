import React, { useState } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
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
  FaBars
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
    { path: '/inbox', icon: <FaInbox />, label: 'Inbox' },
    { path: '/leads', icon: <FaUserFriends />, label: 'Leads' },
    { path: '/quotes', icon: <FaFileAlt />, label: 'Quotes' },
    { path: '/invoices', icon: <FaFileInvoiceDollar />, label: 'Invoices' },
    { path: '/items', icon: <FaBoxOpen />, label: 'Items' },
    { path: '/tasks', icon: <FaTasks />, label: 'Tasks' },
    { path: '/ai-agent', icon: <FaRobot />, label: 'AI Agent' },
    { path: '/tickets', icon: <FaTicketAlt />, label: 'Tickets' },
    { path: '/file-manager', icon: <FaFolder />, label: 'Files' },
    { path: '/settings', icon: <FaCog />, label: 'Settings' },
    { path: '/support', icon: <FaQuestionCircle />, label: 'Support' },
  ];

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} bg-slate-800 text-white transition-all duration-300 flex flex-col`}>
        {/* Logo */}
        <div className="p-4 flex items-center justify-between border-b border-slate-700">
          {sidebarOpen && (
            <Link to="/dashboard" className="text-xl font-bold">
              <span className="text-blue-500">Tari</span>Connect
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)} 
            className="p-2 rounded-md hover:bg-slate-700"
          >
            <FaBars />
          </button>
        </div>
        
        {/* Navigation */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="px-2 space-y-1">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive(item.path)
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-slate-700 hover:text-white'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="ml-3">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User section */}
        <div className="p-4 border-t border-slate-700">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
            </div>
            
            {sidebarOpen && (
              <div className="ml-3">
                <p className="text-sm font-medium">{userData?.name || user?.email}</p>
                <div className="flex items-center text-xs text-gray-400">
                  {userData?.role === 'admin' ? (
                    <Link to="/admin" className="flex items-center hover:text-white">
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
                className="ml-auto p-2 text-gray-400 hover:text-white"
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
        <header className="bg-white shadow-sm z-10">
          <div className="px-4 py-3 flex items-center justify-between">
            <h1 className="text-xl font-semibold text-gray-800">
              {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
            </h1>
            
            <div className="flex items-center space-x-4">
              <Link to="/profile" className="text-gray-600 hover:text-gray-900">
                <FaUser />
              </Link>
              <button
                onClick={handleLogout}
                className="text-gray-600 hover:text-gray-900"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;