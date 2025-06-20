import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FaUserPlus, 
  FaBell, 
  FaChartLine, 
  FaUserCheck, 
  FaComments, 
  FaTasks, 
  FaDatabase,
  FaFileInvoiceDollar,
  FaFileAlt,
  FaBoxOpen,
  FaArrowUp,
  FaArrowDown,
  FaEye
} from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';
import { createSampleItems, createSampleLeads } from '../../utils/sampleData';

function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const { userData, isAdmin, user } = useAuth();
  const navigate = useNavigate();

  // Fetch all data
  useEffect(() => {
    if (!user) return;

    const unsubscribes = [];

    // Fetch leads
    const leadsQuery = query(collection(db, 'leads'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(leadsQuery, (snapshot) => {
      setLeads(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Fetch quotes
    const quotesQuery = query(collection(db, 'quotes'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(quotesQuery, (snapshot) => {
      setQuotes(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Fetch invoices
    const invoicesQuery = query(collection(db, 'invoices'), where('userId', '==', user.uid), orderBy('createdAt', 'desc'));
    unsubscribes.push(onSnapshot(invoicesQuery, (snapshot) => {
      setInvoices(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    // Fetch items
    const itemsQuery = query(collection(db, 'items'), where('userId', '==', user.uid));
    unsubscribes.push(onSnapshot(itemsQuery, (snapshot) => {
      setItems(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    }));

    setLoading(false);

    return () => unsubscribes.forEach(unsubscribe => unsubscribe());
  }, [user]);

  const handleCreateSampleData = async () => {
    if (!user) return;
    
    try {
      await createSampleItems(user.uid);
      await createSampleLeads(user.uid);
      alert('Sample data created successfully! Check Items and Leads pages.');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Error creating sample data. Please try again.');
    }
  };

  // Calculate stats
  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'sent').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    totalRevenue: invoices.filter(i => i.status === 'paid').reduce((sum, i) => sum + (i.total || 0), 0),
    pendingRevenue: invoices.filter(i => i.status === 'pending').reduce((sum, i) => sum + (i.total || 0), 0)
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Welcome back, {userData?.name || 'User'}!
          </h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">
            Here's what's happening with your business today.
          </p>
        </div>
        <div className="flex gap-3">
          {isAdmin() && (
            <Link 
              to="/admin" 
              className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              Admin Panel
            </Link>
          )}
          <button
            onClick={handleCreateSampleData}
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
          >
            <FaDatabase className="text-sm" /> Sample Data
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Leads</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalLeads}</p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <FaArrowUp className="text-xs" />
                {stats.newLeads} new this month
              </p>
            </div>
            <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded-lg">
              <FaUserPlus className="text-blue-600 dark:text-blue-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Active Quotes</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">{stats.totalQuotes}</p>
              <p className="text-sm text-yellow-600 flex items-center gap-1 mt-1">
                <FaChartLine className="text-xs" />
                {stats.pendingQuotes} pending
              </p>
            </div>
            <div className="bg-yellow-100 dark:bg-yellow-900 p-3 rounded-lg">
              <FaFileAlt className="text-yellow-600 dark:text-yellow-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                KSh {stats.totalRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-green-600 flex items-center gap-1 mt-1">
                <FaArrowUp className="text-xs" />
                {stats.paidInvoices} paid invoices
              </p>
            </div>
            <div className="bg-green-100 dark:bg-green-900 p-3 rounded-lg">
              <FaChartLine className="text-green-600 dark:text-green-400 text-xl" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">Pending Revenue</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white">
                KSh {stats.pendingRevenue.toLocaleString()}
              </p>
              <p className="text-sm text-orange-600 flex items-center gap-1 mt-1">
                <FaChartLine className="text-xs" />
                {stats.totalInvoices - stats.paidInvoices} unpaid
              </p>
            </div>
            <div className="bg-orange-100 dark:bg-orange-900 p-3 rounded-lg">
              <FaFileInvoiceDollar className="text-orange-600 dark:text-orange-400 text-xl" />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Link 
          to="/leads"
          className="group bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Manage Leads</h3>
              <p className="text-blue-100 text-sm mt-1">Track prospects & opportunities</p>
            </div>
            <FaUserPlus className="text-2xl opacity-80 group-hover:opacity-100" />
          </div>
        </Link>
        
        <Link 
          to="/quotes"
          className="group bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Create Quotes</h3>
              <p className="text-yellow-100 text-sm mt-1">Generate professional quotes</p>
            </div>
            <FaFileAlt className="text-2xl opacity-80 group-hover:opacity-100" />
          </div>
        </Link>
        
        <Link 
          to="/invoices"
          className="group bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Manage Invoices</h3>
              <p className="text-green-100 text-sm mt-1">Track payments & billing</p>
            </div>
            <FaFileInvoiceDollar className="text-2xl opacity-80 group-hover:opacity-100" />
          </div>
        </Link>
        
        <Link 
          to="/items"
          className="group bg-gradient-to-r from-purple-500 to-purple-600 hover:from-purple-600 hover:to-purple-700 text-white p-6 rounded-xl shadow-lg transition-all duration-300 transform hover:scale-105"
        >
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Product Catalog</h3>
              <p className="text-purple-100 text-sm mt-1">Manage items & services</p>
            </div>
            <FaBoxOpen className="text-2xl opacity-80 group-hover:opacity-100" />
          </div>
        </Link>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Leads */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Leads</h3>
              <Link to="/leads" className="text-primary hover:text-primary-dark text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {leads.length === 0 ? (
              <div className="text-center py-8">
                <FaUserPlus className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No leads yet</p>
                <Link to="/leads" className="text-primary hover:text-primary-dark text-sm">
                  Add your first lead
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {leads.slice(0, 5).map(lead => (
                  <div key={lead.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">{lead.name}</p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{lead.company}</p>
                    </div>
                    <div className="text-right">
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      }`}>
                        {lead.status}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Recent Invoices */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Invoices</h3>
              <Link to="/invoices" className="text-primary hover:text-primary-dark text-sm font-medium">
                View All
              </Link>
            </div>
          </div>
          <div className="p-6">
            {invoices.length === 0 ? (
              <div className="text-center py-8">
                <FaFileInvoiceDollar className="mx-auto text-4xl text-gray-400 mb-4" />
                <p className="text-gray-500 dark:text-gray-400">No invoices yet</p>
                <Link to="/invoices" className="text-primary hover:text-primary-dark text-sm">
                  Create your first invoice
                </Link>
              </div>
            ) : (
              <div className="space-y-4">
                {invoices.slice(0, 5).map(invoice => (
                  <div key={invoice.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                    <div>
                      <p className="font-medium text-gray-900 dark:text-white">
                        {invoice.invoiceNumber || `INV-${invoice.id.substring(0, 6)}`}
                      </p>
                      <p className="text-sm text-gray-500 dark:text-gray-400">{invoice.customerName}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-gray-900 dark:text-white">
                        KSh {invoice.total?.toLocaleString() || '0'}
                      </p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        invoice.status === 'paid' ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' :
                        invoice.status === 'pending' ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200' :
                        'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {invoice.status || 'pending'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;