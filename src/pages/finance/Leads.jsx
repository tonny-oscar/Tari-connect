import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getLeads, createLead, updateLead, deleteLead, convertLeadToQuote } from '../../services/leadService';
import { FaUserFriends, FaPlus, FaSearch, FaEdit, FaTrash, FaFileAlt } from 'react-icons/fa';

const Leads = () => {
  const { user } = useAuth();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingLead, setEditingLead] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    source: '',
    status: 'new',
    notes: '',
    value: ''
  });

  useEffect(() => {
    if (user) {
      fetchLeads();
    }
  }, [user]);

  const fetchLeads = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { success, leads: fetchedLeads } = await getLeads(user.uid);
      if (success && fetchedLeads) {
        setLeads(fetchedLeads);
      } else {
        setLeads([]);
      }
    } catch (error) {
      console.error('Error fetching leads:', error);
      setLeads([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      const leadData = {
        ...formData,
        value: parseFloat(formData.value) || 0
      };
      
      let result;
      if (editingLead) {
        result = await updateLead(editingLead.id, leadData);
      } else {
        result = await createLead(leadData, user.uid);
      }
      
      if (result.success) {
        await fetchLeads();
        resetForm();
        alert(`Lead ${editingLead ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error ${editingLead ? 'updating' : 'creating'} lead: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (lead) => {
    setEditingLead(lead);
    setFormData({
      name: lead.name || '',
      email: lead.email || '',
      phone: lead.phone || '',
      company: lead.company || '',
      source: lead.source || '',
      status: lead.status || 'new',
      notes: lead.notes || '',
      value: lead.value?.toString() || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (leadId) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        const result = await deleteLead(leadId);
        if (result.success) {
          await fetchLeads();
          alert('Lead deleted successfully!');
        } else {
          alert('Error deleting lead: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting lead:', error);
        alert('An error occurred while deleting the lead.');
      }
    }
  };

  const handleConvertToQuote = async (lead) => {
    try {
      const quoteData = {
        customerName: lead.name,
        customerEmail: lead.email,
        customerPhone: lead.phone,
        customerCompany: lead.company,
        items: [],
        subtotal: 0,
        tax: 0,
        total: 0,
        notes: `Converted from lead: ${lead.notes || ''}`
      };
      
      const result = await convertLeadToQuote(lead.id, quoteData, user.uid);
      if (result.success) {
        await fetchLeads();
        alert('Lead converted to quote successfully!');
      } else {
        alert('Error converting lead to quote: ' + result.error);
      }
    } catch (error) {
      console.error('Error converting lead:', error);
      alert('An error occurred while converting the lead.');
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      source: '',
      status: 'new',
      notes: '',
      value: ''
    });
    setEditingLead(null);
    setShowForm(false);
  };

  const filteredLeads = leads.filter(lead =>
    lead.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    lead.company?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'new': return 'bg-blue-100 text-blue-800';
      case 'contacted': return 'bg-yellow-100 text-yellow-800';
      case 'qualified': return 'bg-green-100 text-green-800';
      case 'quoted': return 'bg-purple-100 text-purple-800';
      case 'won': return 'bg-green-100 text-green-800';
      case 'lost': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaUserFriends className="text-primary" />
            Leads
          </h1>
          <p className="text-gray-600">Manage your sales leads and prospects</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus />
          Add Lead
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search leads..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Leads list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading leads...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Source</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{lead.name}</div>
                        <div className="text-sm text-gray-500">{lead.email}</div>
                        <div className="text-sm text-gray-500">{lead.phone}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.company || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {lead.source || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      {lead.value ? `KSh ${lead.value.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(lead.status)}`}>
                        {lead.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(lead)}
                          className="text-primary hover:text-primary-dark"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {lead.status !== 'quoted' && (
                          <button
                            onClick={() => handleConvertToQuote(lead)}
                            className="text-green-600 hover:text-green-900"
                            title="Convert to Quote"
                          >
                            <FaFileAlt />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(lead.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaUserFriends className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">No leads found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Add your first lead to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
            >
              <FaPlus />
              Add Lead
            </button>
          </div>
        )}
      </div>

      {/* Lead Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-md w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingLead ? 'Edit Lead' : 'Add New Lead'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    required
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Phone
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Company
                  </label>
                  <input
                    type="text"
                    value={formData.company}
                    onChange={(e) => setFormData({...formData, company: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    disabled={submitting}
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Source
                    </label>
                    <select
                      value={formData.source}
                      onChange={(e) => setFormData({...formData, source: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      disabled={submitting}
                    >
                      <option value="">Select Source</option>
                      <option value="website">Website</option>
                      <option value="referral">Referral</option>
                      <option value="social_media">Social Media</option>
                      <option value="email">Email</option>
                      <option value="phone">Phone</option>
                      <option value="pos">POS</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-gray-700 text-sm font-bold mb-2">
                      Status
                    </label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData({...formData, status: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      disabled={submitting}
                    >
                      <option value="new">New</option>
                      <option value="contacted">Contacted</option>
                      <option value="qualified">Qualified</option>
                      <option value="quoted">Quoted</option>
                      <option value="won">Won</option>
                      <option value="lost">Lost</option>
                    </select>
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Estimated Value (KSh)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.value}
                    onChange={(e) => setFormData({...formData, value: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    disabled={submitting}
                  />
                </div>
                
                <div className="mb-6">
                  <label className="block text-gray-700 text-sm font-bold mb-2">
                    Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    rows="3"
                    disabled={submitting}
                  />
                </div>
                
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : (editingLead ? 'Update Lead' : 'Create Lead')}
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

export default Leads;