import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where, orderBy, limit } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUserPlus, FaArrowUp, FaChartLine, FaFileAlt, FaFileInvoiceDollar,
  FaBoxOpen, FaUserCheck, FaComments, FaTasks, FaDatabase, FaEye,
  FaClock, FaExclamationTriangle, FaCheckCircle, FaBell
} from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState([]);

  const { userData, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user) return;
    const unsubscribes = [];

    const setupSnapshot = (col, setter) => {
      const q = query(collection(db, col), where('userId', '==', user.uid));
      const unsub = onSnapshot(q, (snapshot) => {
        setter(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      });
      unsubscribes.push(unsub);
    };

    setupSnapshot('leads', setLeads);
    setupSnapshot('quotes', setQuotes);
    setupSnapshot('invoices', setInvoices);
    setupSnapshot('items', setItems);

    setLoading(false);

    return () => unsubscribes.forEach(unsub => unsub());
  }, [user]);

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending' || q.status === 'draft').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    overdueInvoices: invoices.filter(i => {
      if (i.status === 'paid' || !i.dueDate) return false;
      try {
        const dueDate = i.dueDate?.toDate ? i.dueDate.toDate() : new Date(i.dueDate);
        return dueDate < new Date();
      } catch (error) {
        return false;
      }
    }).length,
    totalRevenue: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0),
    pendingRevenue: invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0)
  };

  const recentLeads = leads.slice(0, 5);
  const upcomingTasks = quotes.filter(q => q.validUntil && new Date(q.validUntil) > new Date()).slice(0, 3);

  // Generate notifications based on business data
  useEffect(() => {
    if (loading) return;
    
    const newNotifications = [];
    
    if (stats.overdueInvoices > 0) {
      newNotifications.push({
        id: 'overdue-invoices',
        type: 'urgent',
        title: `${stats.overdueInvoices} Overdue Invoice${stats.overdueInvoices > 1 ? 's' : ''}`,
        message: 'Requires immediate attention',
        action: '/invoices',
        icon: <FaExclamationTriangle />
      });
    }
    
    if (stats.pendingQuotes > 0) {
      newNotifications.push({
        id: 'pending-quotes',
        type: 'warning',
        title: `${stats.pendingQuotes} Pending Quote${stats.pendingQuotes > 1 ? 's' : ''}`,
        message: 'Awaiting customer response',
        action: '/quotes',
        icon: <FaClock />
      });
    }
    
    if (stats.newLeads > 0) {
      newNotifications.push({
        id: 'new-leads',
        type: 'success',
        title: `${stats.newLeads} New Lead${stats.newLeads > 1 ? 's' : ''}`,
        message: 'Ready for follow-up',
        action: '/leads',
        icon: <FaCheckCircle />
      });
    }
    
    setNotifications(newNotifications);
  }, [leads.length, quotes.length, invoices.length, loading]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <main className="space-y-6" role="main" aria-labelledby="dashboard-title">
      <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 id="dashboard-title" className="text-2xl font-bold text-gray-900 dark:text-white">Welcome back, {userData?.name || 'User'}!</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Here's what's happening with your business today.</p>
        </div>
        {isAdmin() && (
          <Link
            to="/admin"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
            aria-label="Go to Admin Panel"
          >
            Admin Panel
          </Link>
        )}
      </header>

      <section aria-labelledby="stats-title">
        <h2 id="stats-title" className="sr-only">Business Statistics</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6" role="group" aria-label="Business statistics overview">
          <StatCard
            title="Leads"
            value={stats.totalLeads}
            subtitle={`${stats.newLeads} new this month`}
            icon={<FaUserPlus aria-hidden="true" />}
            color="green"
          />
          <StatCard
            title="Quotes"
            value={stats.totalQuotes}
            subtitle={`${stats.pendingQuotes} pending`}
            icon={<FaFileAlt aria-hidden="true" />}
            color="yellow"
          />
          <StatCard
            title="Revenue"
            value={`KSh ${stats.totalRevenue.toLocaleString()}`}
            subtitle={`${stats.paidInvoices} paid invoices`}
            icon={<FaChartLine aria-hidden="true" />}
            color="green"
          />
          <StatCard
            title="Pending Revenue"
            value={`KSh ${stats.pendingRevenue.toLocaleString()}`}
            subtitle={`${stats.totalInvoices - stats.paidInvoices} unpaid`}
            icon={<FaFileInvoiceDollar aria-hidden="true" />}
            color="orange"
          />
        </div>
      </section>

      <section aria-labelledby="actions-title">
        <h2 id="actions-title" className="sr-only">Quick Actions</h2>
        <nav className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4" role="navigation" aria-label="Quick action navigation">
          <QuickAction to="/leads" title="Manage Leads" subtitle="Track prospects & opportunities" icon={<FaUserPlus aria-hidden="true" />} />
          <QuickAction to="/quotes" title="Create Quotes" subtitle="Generate professional quotes" icon={<FaFileAlt aria-hidden="true" />} />
          <QuickAction to="/invoices" title="Manage Invoices" subtitle="Track payments & billing" icon={<FaFileInvoiceDollar aria-hidden="true" />} />
          <QuickAction to="/items" title="Product Catalog" subtitle="Manage items & services" icon={<FaBoxOpen aria-hidden="true" />} />
        </nav>
      </section>

      {/* Recent Activity & Alerts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
            <Link to="/leads" className="text-primary hover:text-primary-dark text-sm font-medium">
              View All
            </Link>
          </div>
          {recentLeads.length > 0 ? (
            <div className="space-y-3 max-h-64 overflow-y-auto">
              {recentLeads.map(lead => (
                <Link
                  key={lead.id}
                  to={`/leads`}
                  className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-lg transition-colors"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 dark:text-white truncate">{lead.name || 'Unnamed Lead'}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400 truncate">{lead.email || 'No email'}</p>
                  </div>
                  <span className={`px-3 py-1 text-xs font-medium rounded-full ml-3 flex-shrink-0 ${
                    lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                    lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                    lead.status === 'qualified' ? 'bg-green-100 text-green-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {lead.status || 'new'}
                  </span>
                </Link>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <FaUserPlus className="mx-auto text-4xl text-gray-400 mb-3" />
              <p className="text-gray-700 dark:text-gray-300 font-medium mb-2">No leads yet</p>
              <Link 
                to="/leads" 
                className="inline-flex items-center text-primary hover:text-primary-dark font-medium transition-colors"
              >
                <FaUserPlus className="mr-2" />
                Add your first lead
              </Link>
            </div>
          )}
        </section>

        {/* Notifications */}
        <section className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
              <FaBell className="text-primary" />
              Notifications
            </h3>
            {notifications.length > 0 && (
              <span className="bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                {notifications.length}
              </span>
            )}
          </div>
          <div className="space-y-3 max-h-64 overflow-y-auto">
            {notifications.length > 0 ? notifications.map(notification => (
              <Link
                key={notification.id}
                to={notification.action}
                className={`flex items-center p-4 rounded-lg border-l-4 hover:shadow-md transition-all ${
                  notification.type === 'urgent' ? 'bg-red-50 border-red-500' :
                  notification.type === 'warning' ? 'bg-yellow-50 border-yellow-500' :
                  'bg-green-50 border-green-500'
                }`}
              >
                <div className={`mr-3 text-lg ${
                  notification.type === 'urgent' ? 'text-red-500' :
                  notification.type === 'warning' ? 'text-yellow-500' :
                  'text-green-500'
                }`}>
                  {notification.icon}
                </div>
                <div className="flex-1">
                  <p className={`font-medium ${
                    notification.type === 'urgent' ? 'text-red-800' :
                    notification.type === 'warning' ? 'text-yellow-800' :
                    'text-green-800'
                  }`}>
                    {notification.title}
                  </p>
                  <p className={`text-sm ${
                    notification.type === 'urgent' ? 'text-red-600' :
                    notification.type === 'warning' ? 'text-yellow-600' :
                    'text-green-600'
                  }`}>
                    {notification.message}
                  </p>
                </div>
                <FaArrowUp className={`transform rotate-45 text-sm ${
                  notification.type === 'urgent' ? 'text-red-400' :
                  notification.type === 'warning' ? 'text-yellow-400' :
                  'text-green-400'
                }`} />
              </Link>
            )) : (
              <div className="text-center py-8">
                <FaCheckCircle className="mx-auto text-4xl text-green-400 mb-3" />
                <p className="text-gray-700 dark:text-gray-300 font-medium">All caught up!</p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">No urgent items need attention</p>
              </div>
            )}
          </div>
        </section>
      </div>


    </main>
  );
}

const StatCard = ({ title, value, subtitle, icon, color }) => {
  const getColorClasses = (color) => {
    const colors = {
      green: { bg: 'bg-green-100', text: 'text-green-600', subtitle: 'text-green-600' },
      yellow: { bg: 'bg-yellow-100', text: 'text-yellow-600', subtitle: 'text-yellow-600' },
      orange: { bg: 'bg-orange-100', text: 'text-orange-600', subtitle: 'text-orange-600' },
      red: { bg: 'bg-red-100', text: 'text-red-600', subtitle: 'text-red-600' }
    };
    return colors[color] || colors.green;
  };
  
  const colorClasses = getColorClasses(color);
  
  return (
    <article className="bg-white dark:bg-gray-800 p-4 sm:p-6 rounded-lg shadow hover:shadow-md transition-shadow" role="article" aria-labelledby={`stat-${title.toLowerCase()}`}>
      <div className="flex justify-between items-center">
        <div className="flex-1 min-w-0">
          <h3 id={`stat-${title.toLowerCase()}`} className="text-gray-500 dark:text-gray-400 text-sm font-medium">{title}</h3>
          <p className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white truncate" aria-label={`${title}: ${value}`}>{value}</p>
          <p className={`text-xs sm:text-sm ${colorClasses.subtitle} mt-1 flex items-center gap-1`} aria-label={subtitle}>
            <FaArrowUp className="text-xs flex-shrink-0" aria-hidden="true" />
            <span className="truncate">{subtitle}</span>
          </p>
        </div>
        <div className={`${colorClasses.bg} p-2 sm:p-3 rounded-full ${colorClasses.text} flex-shrink-0 ml-3`} aria-hidden="true">
          {icon}
        </div>
      </div>
    </article>
  );
};

const QuickAction = ({ to, title, subtitle, icon }) => (
  <Link
    to={to}
    className="group bg-gradient-to-r from-primary to-primary-dark text-white p-4 sm:p-6 rounded-xl shadow-lg hover:scale-105 transition transform duration-300 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-primary block"
    aria-label={`${title}: ${subtitle}`}
    role="button"
  >
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center">
      <div className="flex-1">
        <h3 className="text-base sm:text-lg font-semibold text-white mb-1">{title}</h3>
        <p className="text-sm text-white/80 leading-relaxed">{subtitle}</p>
      </div>
      <div className="text-2xl sm:text-3xl group-hover:opacity-100 opacity-80 mt-2 sm:mt-0 sm:ml-4 self-start sm:self-center" aria-hidden="true">{icon}</div>
    </div>
  </Link>
);

export default Dashboard;
