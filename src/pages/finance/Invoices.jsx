import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, markInvoiceAsPaid } from '../../services/invoiceService';
import { FaFileInvoiceDollar, FaPlus, FaSearch, FaEdit, FaTrash, FaCheck, FaEye } from 'react-icons/fa';
import ItemSelector from '../../components/ItemSelector';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [editingInvoice, setEditingInvoice] = useState(null);
  const [formData, setFormData] = useState({
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    customerCompany: '',
    customerAddress: '',
    items: [],
    subtotal: 0,
    taxRate: 16,
    tax: 0,
    total: 0,
    dueDate: '',
    notes: ''
  });

  useEffect(() => {
    fetchInvoices();
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate]);

  const fetchInvoices = async () => {
    if (!user) return;
    
    const { success, invoices: fetchedInvoices } = await getInvoices(user.uid);
    if (success) {
      setInvoices(fetchedInvoices);
    }
    setLoading(false);
  };

  const calculateTotals = () => {
    const subtotal = formData.items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const tax = (subtotal * formData.taxRate) / 100;
    const total = subtotal + tax;
    
    setFormData(prev => ({
      ...prev,
      subtotal,
      tax,
      total
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const invoiceData = {
      ...formData,
      invoiceNumber: formData.invoiceNumber || `INV-${Date.now()}`,
      dueDate: new Date(formData.dueDate)
    };
    
    let result;
    if (editingInvoice) {
      result = await updateInvoice(editingInvoice.id, invoiceData);
    } else {
      result = await createInvoice(invoiceData, user.uid);
    }
    
    if (result.success) {
      fetchInvoices();
      resetForm();
    }
  };

  const handleEdit = (invoice) => {
    setEditingInvoice(invoice);
    setFormData({
      customerName: invoice.customerName || '',
      customerEmail: invoice.customerEmail || '',
      customerPhone: invoice.customerPhone || '',
      customerCompany: invoice.customerCompany || '',
      customerAddress: invoice.customerAddress || '',
      items: invoice.items || [],
      subtotal: invoice.subtotal || 0,
      taxRate: invoice.taxRate || 16,
      tax: invoice.tax || 0,
      total: invoice.total || 0,
      dueDate: invoice.dueDate ? new Date(invoice.dueDate.toDate()).toISOString().split('T')[0] : '',
      notes: invoice.notes || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      const result = await deleteInvoice(invoiceId);
      if (result.success) {
        fetchInvoices();
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    const paymentMethod = prompt('Enter payment method (optional):');
    const paymentReference = prompt('Enter payment reference (optional):');
    
    const result = await markInvoiceAsPaid(invoiceId, {
      paymentMethod,
      paymentReference
    });
    
    if (result.success) {
      fetchInvoices();
      alert('Invoice marked as paid successfully!');
    }
  };

  const handleItemsChange = (items) => {
    setFormData(prev => ({ ...prev, items }));
  };

  const resetForm = () => {
    setFormData({
      customerName: '',
      customerEmail: '',
      customerPhone: '',
      customerCompany: '',
      customerAddress: '',
      items: [],
      subtotal: 0,
      taxRate: 16,
      tax: 0,
      total: 0,
      dueDate: '',
      notes: ''
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const filteredInvoices = invoices.filter(invoice => 
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isOverdue = (invoice) => {
    if (invoice.status === 'paid' || !invoice.dueDate) return false;
    return new Date() > new Date(invoice.dueDate.toDate());
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Invoices</h1>
          <p className="text-gray-600">Create and manage customer invoices</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Create Invoice
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search invoices..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Invoices list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading invoices...</p>
          </div>
        ) : filteredInvoices.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Invoice #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInvoices.map(invoice => (
                  <tr key={invoice.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                      {invoice.invoiceNumber || `INV-${invoice.id.substring(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{invoice.customerName || 'Unnamed Customer'}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      KSh {invoice.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {invoice.dueDate ? new Date(invoice.dueDate.toDate()).toLocaleDateString() : 'N/A'}
                      {isOverdue(invoice) && (
                        <div className="text-red-600 text-xs font-medium">OVERDUE</div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        getStatusColor(isOverdue(invoice) ? 'overdue' : invoice.status)
                      }`}>
                        {isOverdue(invoice) ? 'overdue' : (invoice.status || 'pending')}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(invoice)}
                          className="text-primary hover:text-primary-dark"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {invoice.status !== 'paid' && (
                          <button
                            onClick={() => handleMarkAsPaid(invoice.id)}
                            className="text-green-600 hover:text-green-900"
                            title="Mark as Paid"
                          >
                            <FaCheck />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(invoice.id)}
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
            <FaFileInvoiceDollar className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No invoices found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first invoice to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
            >
              <FaPlus /> Create Invoice
            </button>
          </div>
        )}
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Customer Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.customerCompany}
                        onChange={(e) => setFormData({...formData, customerCompany: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows="3"
                      />
                    </div>
                  </div>
                  
                  {/* Invoice Details */}
                  <div>
                    <h3 className="text-lg font-medium mb-4">Invoice Details</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Due Date *
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        required
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        rows="3"
                      />
                    </div>
                    
                    {/* Totals */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>KSh {formData.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Tax ({formData.taxRate}%):</span>
                        <span>KSh {formData.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total:</span>
                        <span>KSh {formData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Items Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium">Items ({formData.items.length})</h3>
                    <button
                      type="button"
                      onClick={() => setShowItemSelector(true)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                    >
                      Add Items
                    </button>
                  </div>
                  
                  {formData.items.length > 0 && (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.description}</div>
                              </td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">KSh {item.price.toLocaleString()}</td>
                              <td className="px-4 py-2 font-medium">KSh {(item.price * item.quantity).toLocaleString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end gap-4 mt-6">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 text-gray-600 hover:text-gray-800"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark"
                  >
                    {editingInvoice ? 'Update' : 'Create'} Invoice
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Item Selector Modal */}
      {showItemSelector && (
        <ItemSelector
          selectedItems={formData.items}
          onItemsChange={handleItemsChange}
          onClose={() => setShowItemSelector(false)}
        />
      )}
    </div>
  );
};

export default Invoices;