import React, { useState, useEffect } from 'react';
import { Link, Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../store/useAuth';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
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
  const [notificationCount, setNotificationCount] = useState(0);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!user) return;
    
    const unsubscribes = [];
    
    // Listen to invoices for overdue notifications
    const invoicesQuery = query(collection(db, 'invoices'), where('userId', '==', user.uid));
    const invoicesUnsub = onSnapshot(invoicesQuery, (snapshot) => {
      const invoices = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      const overdueCount = invoices.filter(i => {
        if (i.status === 'paid' || !i.dueDate) return false;
        try {
          const dueDate = i.dueDate?.toDate ? i.dueDate.toDate() : new Date(i.dueDate);
          return dueDate < new Date();
        } catch (error) {
          return false;
        }
      }).length;
      
      // Listen to quotes for pending notifications
      const quotesQuery = query(collection(db, 'quotes'), where('userId', '==', user.uid));
      const quotesUnsub = onSnapshot(quotesQuery, (snapshot) => {
        const quotes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        const pendingCount = quotes.filter(q => q.status === 'pending' || q.status === 'draft').length;
        
        // Listen to leads for new notifications
        const leadsQuery = query(collection(db, 'leads'), where('userId', '==', user.uid));
        const leadsUnsub = onSnapshot(leadsQuery, (snapshot) => {
          const leads = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          const newLeadsCount = leads.filter(l => l.status === 'new').length;
          
          setNotificationCount(overdueCount + pendingCount + newLeadsCount);
        });
        
        unsubscribes.push(leadsUnsub);
      });
      
      unsubscribes.push(quotesUnsub);
    });
    
    unsubscribes.push(invoicesUnsub);
    
    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };
  
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
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`${sidebarOpen ? 'w-64' : 'w-20'} ${sidebarOpen ? 'fixed md:relative' : 'hidden md:flex'} bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 transition-all duration-300 flex flex-col z-50 h-full`}>
        {/* Logo */}
        <div className="p-4 border-b border-gray-200 flex items-center justify-between">
          {sidebarOpen && (
            <Link to="/dashboard" className="text-xl font-bold">
              <span className="text-primary">Tari</span>Connect
            </Link>
          )}
          <button 
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-lg hover:bg-gray-100 min-h-[44px] min-w-[44px] flex items-center justify-center"
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
                onClick={() => window.innerWidth < 768 && setSidebarOpen(false)}
                className={`flex items-center px-3 py-2.5 rounded-lg transition-colors ${
                  isActive(item.path)
                    ? 'bg-primary text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                <span className="text-lg">{item.icon}</span>
                {sidebarOpen && <span className="ml-3 font-medium">{item.label}</span>}
              </Link>
            ))}
          </nav>
        </div>
        
        {/* User section */}
        <div className="p-4 border-t border-gray-200">
          <div className="flex items-center">
            <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-white font-semibold">
              {userData?.name ? userData.name.charAt(0).toUpperCase() : <FaUser />}
            </div>
            
            {sidebarOpen && (
              <div className="ml-3 flex-1">
                <p className="text-sm font-medium text-gray-900">
                  {userData?.name || user?.email}
                </p>
                <div className="text-xs text-gray-500">
                  {userData?.role === 'admin' ? (
                    <Link to="/admin" className="flex items-center hover:text-primary">
                      <FaUserShield className="mr-1" />
                      Admin
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
                className="p-2 text-gray-400 hover:text-gray-600"
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
          <div className="px-4 md:px-6 py-4 flex items-center justify-between">
            <div className="flex items-center">
              <button 
                onClick={() => setSidebarOpen(true)}
                className="p-2 rounded-lg hover:bg-gray-100 md:hidden mr-3 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <FaBars />
              </button>
              <h1 className="text-xl md:text-2xl font-semibold text-gray-900 dark:text-white">
                {navItems.find(item => isActive(item.path))?.label || 'Dashboard'}
              </h1>
            </div>
            
            <div className="flex items-center space-x-2 md:space-x-4">
              <ThemeToggle />
              <button 
                onClick={() => navigate('/dashboard')}
                className="relative p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="View Notifications"
              >
                <FaBell />
                {notificationCount > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center font-medium">
                    {notificationCount > 9 ? '9+' : notificationCount}
                  </span>
                )}
              </button>
              <Link 
                to="/profile" 
                className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
              >
                <FaUser />
              </Link>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-400 hover:text-gray-600 min-h-[44px] min-w-[44px] flex items-center justify-center"
                title="Logout"
              >
                <FaSignOutAlt />
              </button>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 overflow-auto p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
}

export default Layout;