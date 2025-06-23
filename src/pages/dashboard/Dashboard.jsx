import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import {
  FaUserPlus, FaArrowUp, FaChartLine, FaFileAlt, FaFileInvoiceDollar,
  FaBoxOpen, FaUserCheck, FaComments, FaTasks, FaDatabase, FaEye
} from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';
import { createSampleItems, createSampleLeads } from '../../utils/sampleData';

function Dashboard() {
  const [leads, setLeads] = useState([]);
  const [quotes, setQuotes] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const handleCreateSampleData = async () => {
    if (!user) return;
    try {
      await createSampleItems(user.uid);
      await createSampleLeads(user.uid);
      alert('Sample data created successfully!');
    } catch (error) {
      console.error('Error creating sample data:', error);
      alert('Failed to create sample data.');
    }
  };

  const stats = {
    totalLeads: leads.length,
    newLeads: leads.filter(l => l.status === 'new').length,
    totalQuotes: quotes.length,
    pendingQuotes: quotes.filter(q => q.status === 'pending').length,
    totalInvoices: invoices.length,
    paidInvoices: invoices.filter(i => i.status === 'paid').length,
    totalRevenue: invoices
      .filter(i => i.status === 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0),
    pendingRevenue: invoices
      .filter(i => i.status !== 'paid')
      .reduce((sum, i) => sum + (i.total || 0), 0)
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
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold">Welcome back, {userData?.name || 'User'}!</h1>
          <p className="text-gray-600 mt-1">Here's what's happening with your business today.</p>
        </div>
        {isAdmin() && (
          <Link
            to="/admin"
            className="bg-primary hover:bg-primary-dark text-white px-4 py-2 rounded-lg"
          >
            Admin Panel
          </Link>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Leads"
          value={stats.totalLeads}
          subtitle={`${stats.newLeads} new this month`}
          icon={<FaUserPlus />}
          color="green"
        />
        <StatCard
          title="Quotes"
          value={stats.totalQuotes}
          subtitle={`${stats.pendingQuotes} pending`}
          icon={<FaFileAlt />}
          color="yellow"
        />
        <StatCard
          title="Revenue"
          value={`KSh ${stats.totalRevenue.toLocaleString()}`}
          subtitle={`${stats.paidInvoices} paid invoices`}
          icon={<FaChartLine />}
          color="green"
        />
        <StatCard
          title="Pending Revenue"
          value={`KSh ${stats.pendingRevenue.toLocaleString()}`}
          subtitle={`${stats.totalInvoices - stats.paidInvoices} unpaid`}
          icon={<FaFileInvoiceDollar />}
          color="orange"
        />
      </div>

      {/* Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickAction to="/leads" title="Manage Leads" subtitle="Track prospects & opportunities" icon={<FaUserPlus />} />
        <QuickAction to="/quotes" title="Create Quotes" subtitle="Generate professional quotes" icon={<FaFileAlt />} />
        <QuickAction to="/invoices" title="Manage Invoices" subtitle="Track payments & billing" icon={<FaFileInvoiceDollar />} />
        <QuickAction to="/items" title="Product Catalog" subtitle="Manage items & services" icon={<FaBoxOpen />} />
      </div>
    </div>
  );
}

const StatCard = ({ title, value, subtitle, icon, color }) => (
  <div className="bg-white p-6 rounded-lg shadow">
    <div className="flex justify-between items-center">
      <div>
        <h4 className="text-gray-500 text-sm">{title}</h4>
        <p className="text-xl font-bold">{value}</p>
        <p className={`text-sm text-${color}-600 mt-1 flex items-center gap-1`}>
          <FaArrowUp className="text-xs" />
          {subtitle}
        </p>
      </div>
      <div className={`bg-${color}-100 p-3 rounded-full text-${color}-600`}>
        {icon}
      </div>
    </div>
  </div>
);

const QuickAction = ({ to, title, subtitle, icon }) => (
  <Link
    to={to}
    className="group bg-gradient-to-r from-primary to-primary-dark text-white p-6 rounded-xl shadow-lg hover:scale-105 transition transform duration-300"
  >
    <div className="flex justify-between items-center">
      <div>
        <h3 className="text-lg font-semibold">{title}</h3>
        <p className="text-sm mt-1 text-white/70">{subtitle}</p>
      </div>
      <div className="text-2xl group-hover:opacity-100 opacity-80">{icon}</div>
    </div>
  </Link>
);

export default Dashboard;
