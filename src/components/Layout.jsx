import React from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import NotificationSystem from './NotificationSystem';
import { FaHome, FaTasks, FaComments, FaSignOutAlt, FaUser, FaUserShield } from 'react-icons/fa';

function Layout() {
  const { user, userData, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
  // Check if a path is active
  const isActive = (path) => {
    if (path === '/dashboard' && location.pathname === '/dashboard') {
      return true;
    }
    if (path === '/combined' && location.pathname.includes('/combined')) {
      return true;
    }
    if (path === '/tasks' && location.pathname === '/tasks') {
      return true;
    }
    if (path === '/admin' && location.pathname === '/admin') {
      return true;
    }
    return false;
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-600 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <Link to="/dashboard" className="text-xl font-bold">
            <span className="text-white">Tari</span>Connect
          </Link>
          {user && (
            <div className="flex items-center gap-4">
              <NotificationSystem />
              
              <div className="relative group">
                <button className="flex items-center gap-2 hover:bg-blue-700 p-2 rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-blue-700 flex items-center justify-center">
                    {userData?.name ? (
                      userData.name.charAt(0).toUpperCase()
                    ) : (
                      <FaUser />
                    )}
                  </div>
                  <span className="hidden md:inline">{userData?.name || user.email}</span>
                </button>
                
                <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 hidden group-hover:block">
                  <div className="py-2">
                    <Link to="/profile" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                      Profile
                    </Link>
                    {userData?.role === 'admin' && (
                      <Link to="/admin" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                        Admin Dashboard
                      </Link>
                    )}
                    <button 
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                    >
                      Sign out
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Navigation */}
      <div className="bg-white shadow">
        <div className="max-w-7xl mx-auto flex">
          <Link 
            to="/dashboard" 
            className={`px-4 py-3 flex items-center gap-1 transition-colors ${
              isActive('/dashboard') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaHome /> Dashboard
          </Link>
          <Link 
            to="/combined" 
            className={`px-4 py-3 flex items-center gap-1 transition-colors ${
              isActive('/combined') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaComments /> Conversations
          </Link>
          <Link 
            to="/tasks" 
            className={`px-4 py-3 flex items-center gap-1 transition-colors ${
              isActive('/tasks') 
                ? 'text-blue-600 border-b-2 border-blue-600' 
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <FaTasks /> Tasks
          </Link>
          {userData?.role === 'admin' && (
            <Link 
              to="/admin" 
              className={`px-4 py-3 flex items-center gap-1 transition-colors ${
                isActive('/admin') 
                  ? 'text-blue-600 border-b-2 border-blue-600' 
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              <FaUserShield /> Admin
            </Link>
          )}
          <div className="ml-auto">
            <button 
              onClick={handleLogout}
              className="px-4 py-3 flex items-center gap-1 text-gray-700 hover:bg-gray-100 transition-colors"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto p-4">
        <Outlet />
      </main>
    </div>
  );
}

export default Layout;