import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getInvoices, createInvoice, updateInvoice, deleteInvoice, markInvoiceAsPaid } from '../../services/invoiceService';
import { FaFileInvoiceDollar, FaPlus, FaSearch, FaEdit, FaTrash, FaCheck, FaPrint } from 'react-icons/fa';
import ItemSelector from '../../components/ItemSelector';

const Invoices = () => {
  const { user } = useAuth();
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
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
    notes: '',
    status: 'pending'
  });

  useEffect(() => {
    if (user?.uid) {
      fetchInvoices();
    } else {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate]);

  const fetchInvoices = async () => {
    if (!user?.uid) return;
    
    setLoading(true);
    try {
      const result = await getInvoices(user.uid);
      if (result.success) {
        setInvoices(result.invoices || []);
      } else {
        setInvoices([]);
      }
    } catch (error) {
      console.error('Error in fetchInvoices:', error);
      setInvoices([]);
    } finally {
      setLoading(false);
    }
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
    if (!user?.uid) return;
    
    setSubmitting(true);
    try {
      const invoiceData = {
        ...formData,
        invoiceNumber: formData.invoiceNumber || `INV-${Date.now()}`
      };
      
      let result;
      if (editingInvoice) {
        result = await updateInvoice(editingInvoice.id, invoiceData);
      } else {
        result = await createInvoice(invoiceData, user.uid);
      }
      
      if (result.success) {
        await fetchInvoices();
        resetForm();
        alert(`Invoice ${editingInvoice ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error ${editingInvoice ? 'updating' : 'creating'} invoice: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
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
      dueDate: invoice.dueDate || '',
      notes: invoice.notes || '',
      status: invoice.status || 'pending'
    });
    setShowForm(true);
  };

  const handleDelete = async (invoiceId) => {
    if (window.confirm('Are you sure you want to delete this invoice?')) {
      try {
        const result = await deleteInvoice(invoiceId);
        if (result.success) {
          await fetchInvoices();
          alert('Invoice deleted successfully!');
        } else {
          alert('Error deleting invoice: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting invoice:', error);
        alert('An error occurred while deleting the invoice.');
      }
    }
  };

  const handleMarkAsPaid = async (invoiceId) => {
    try {
      const result = await markInvoiceAsPaid(invoiceId);
      if (result.success) {
        await fetchInvoices();
        alert('Invoice marked as paid!');
      } else {
        alert('Error marking invoice as paid: ' + result.error);
      }
    } catch (error) {
      console.error('Error marking invoice as paid:', error);
      alert('An error occurred while updating the invoice.');
    }
  };

  const handlePrint = (invoice) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Invoice ${invoice.invoiceNumber || invoice.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; }
            .customer-info { margin-bottom: 20px; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .items-table th { background-color: #f2f2f2; }
            .totals { margin-top: 20px; text-align: right; }
            .total-row { font-weight: bold; font-size: 1.2em; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>INVOICE</h1>
            <h2>Invoice #: ${invoice.invoiceNumber || invoice.id}</h2>
            <p>Date: ${invoice.createdAt ? new Date(invoice.createdAt.toDate()).toLocaleDateString() : new Date().toLocaleDateString()}</p>
          </div>
          
          <div class="customer-info">
            <h3>Bill To:</h3>
            <p><strong>${invoice.customerName || 'N/A'}</strong></p>
            <p>${invoice.customerEmail || 'N/A'}</p>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${invoice.items?.map(item => `
                <tr>
                  <td>${item.name || 'Unnamed Item'}</td>
                  <td>${item.quantity || 0}</td>
                  <td>KSh ${(item.price || 0).toLocaleString()}</td>
                  <td>KSh ${((item.price || 0) * (item.quantity || 0)).toLocaleString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>
          
          <div class="totals">
            <p>Subtotal: KSh ${(invoice.subtotal || 0).toLocaleString()}</p>
            <p>Tax (${invoice.taxRate || 0}%): KSh ${(invoice.tax || 0).toLocaleString()}</p>
            <p class="total-row">Total: KSh ${(invoice.total || 0).toLocaleString()}</p>
          </div>
          
          <script>
            window.onload = function() {
              window.print();
              window.onafterprint = function() {
                window.close();
              }
            }
          </script>
        </body>
      </html>
    `;
    printWindow.document.write(printContent);
    printWindow.document.close();
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
      notes: '',
      status: 'pending'
    });
    setEditingInvoice(null);
    setShowForm(false);
  };

  const formatDate = (date) => {
    if (!date) return 'No due date';
    if (typeof date === 'string') return date;
    if (date.toDate) return date.toDate().toLocaleDateString();
    if (date instanceof Date) return date.toLocaleDateString();
    return 'Invalid date';
  };

  const filteredInvoices = invoices.filter(invoice =>
    invoice.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    invoice.invoiceNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'paid': return 'bg-green-100 text-green-800';
      case 'overdue': return 'bg-red-100 text-red-800';
      case 'cancelled': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <FaFileInvoiceDollar className="text-primary" />
            Invoices
          </h1>
          <p className="text-gray-600">Manage your invoices and billing</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus />
          Create Invoice
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
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Invoices list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="text-gray-500 mt-2">Loading invoices...</p>
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
                      {invoice.invoiceNumber || `INV-${invoice.id?.substring(0, 6) || 'NEW'}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{invoice.customerName}</div>
                      <div className="text-sm text-gray-500">{invoice.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      KSh {(invoice.total || 0).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(invoice.dueDate)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(invoice.status || 'pending')}`}>
                        {invoice.status || 'pending'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handlePrint(invoice)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Print Invoice"
                        >
                          <FaPrint />
                        </button>
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
            <h3 className="text-lg font-medium text-gray-900 mb-2">No invoices found</h3>
            <p className="text-gray-500 mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first invoice to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
            >
              <FaPlus />
              Create Invoice
            </button>
          </div>
        )}
      </div>

      {/* Invoice Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4">
                {editingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Customer Information</h3>
                    
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
                        disabled={submitting}
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
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  
                  {/* Invoice Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4">Invoice Details</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 text-sm font-bold mb-2">
                        Due Date
                      </label>
                      <input
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({...formData, dueDate: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                        disabled={submitting}
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
                        disabled={submitting}
                      />
                    </div>
                    
                    {/* Totals */}
                    <div className="bg-gray-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span>Subtotal:</span>
                        <span>KSh {(formData.subtotal || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span>Tax ({formData.taxRate}%):</span>
                        <span>KSh {(formData.tax || 0).toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span>Total:</span>
                        <span>KSh {(formData.total || 0).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Items Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold">Items</h3>
                    <button
                      type="button"
                      onClick={() => setShowItemSelector(true)}
                      className="bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-dark"
                      disabled={submitting}
                    >
                      Add Items
                    </button>
                  </div>
                  
                  {formData.items.length > 0 && (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="font-medium">{item.name}</div>
                                <div className="text-sm text-gray-500">{item.description}</div>
                              </td>
                              <td className="px-4 py-2">{item.quantity}</td>
                              <td className="px-4 py-2">KSh {item.price.toLocaleString()}</td>
                              <td className="px-4 py-2">KSh {(item.price * item.quantity).toLocaleString()}</td>
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
                    {submitting ? 'Saving...' : (editingInvoice ? 'Update Invoice' : 'Create Invoice')}
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