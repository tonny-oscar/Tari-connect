import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getQuotes, createQuote, updateQuote, deleteQuote, convertQuoteToInvoice } from '../../services/quoteService';
import { FaFileAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaFileInvoiceDollar } from 'react-icons/fa';
import ItemSelector from '../../components/ItemSelector';

const Quotes = () => {
  const { user } = useAuth();
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showItemSelector, setShowItemSelector] = useState(false);
  const [editingQuote, setEditingQuote] = useState(null);
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
    notes: '',
    validUntil: ''
  });

  useEffect(() => {
    if (user) {
      fetchQuotes();
    }
  }, [user]);

  useEffect(() => {
    calculateTotals();
  }, [formData.items, formData.taxRate]);

  const fetchQuotes = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { success, quotes: fetchedQuotes } = await getQuotes(user.uid);
      if (success && fetchedQuotes) {
        setQuotes(fetchedQuotes);
      } else {
        setQuotes([]);
      }
    } catch (error) {
      console.error('Error fetching quotes:', error);
      setQuotes([]);
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
    if (!user) return;
    
    setSubmitting(true);
    
    try {
      const quoteData = {
        ...formData,
        quoteNumber: formData.quoteNumber || `Q-${Date.now()}`
      };
      
      let result;
      if (editingQuote) {
        result = await updateQuote(editingQuote.id, quoteData);
      } else {
        result = await createQuote(quoteData, user.uid);
      }
      
      if (result.success) {
        await fetchQuotes();
        resetForm();
        alert(`Quote ${editingQuote ? 'updated' : 'created'} successfully!`);
      } else {
        alert(`Error ${editingQuote ? 'updating' : 'creating'} quote: ${result.error}`);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      alert('An error occurred. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleEdit = (quote) => {
    setEditingQuote(quote);
    setFormData({
      customerName: quote.customerName || '',
      customerEmail: quote.customerEmail || '',
      customerPhone: quote.customerPhone || '',
      customerCompany: quote.customerCompany || '',
      customerAddress: quote.customerAddress || '',
      items: quote.items || [],
      subtotal: quote.subtotal || 0,
      taxRate: quote.taxRate || 16,
      tax: quote.tax || 0,
      total: quote.total || 0,
      notes: quote.notes || '',
      validUntil: quote.validUntil || ''
    });
    setShowForm(true);
  };

  const handleDelete = async (quoteId) => {
    if (window.confirm('Are you sure you want to delete this quote?')) {
      try {
        const result = await deleteQuote(quoteId);
        if (result.success) {
          await fetchQuotes();
          alert('Quote deleted successfully!');
        } else {
          alert('Error deleting quote: ' + result.error);
        }
      } catch (error) {
        console.error('Error deleting quote:', error);
        alert('An error occurred while deleting the quote.');
      }
    }
  };

  const handleConvertToInvoice = async (quote) => {
    try {
      const invoiceData = {
        customerName: quote.customerName,
        customerEmail: quote.customerEmail,
        customerPhone: quote.customerPhone,
        customerCompany: quote.customerCompany,
        customerAddress: quote.customerAddress,
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        notes: `Converted from quote: ${quote.quoteNumber}`
      };
      
      const result = await convertQuoteToInvoice(quote.id, invoiceData, user.uid);
      if (result.success) {
        await fetchQuotes();
        alert('Quote converted to invoice successfully!');
      } else {
        alert('Error converting quote to invoice: ' + result.error);
      }
    } catch (error) {
      console.error('Error converting quote:', error);
      alert('An error occurred while converting the quote.');
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
      notes: '',
      validUntil: ''
    });
    setEditingQuote(null);
    setShowForm(false);
  };

  const filteredQuotes = quotes.filter(quote => 
    quote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.customerEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case 'draft': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      case 'sent': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'accepted': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'converted': return 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200';
      case 'expired': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2 text-gray-900 dark:text-white">Quotes</h1>
          <p className="text-gray-600 dark:text-gray-400">Create and manage sales quotations</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-primary-dark transition-colors"
        >
          <FaPlus /> Create Quote
        </button>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search quotes..."
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-primary focus:border-primary bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Quotes list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary mx-auto"></div>
            <p className="mt-2 text-gray-600 dark:text-gray-400">Loading quotes...</p>
          </div>
        ) : filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-primary">
                      {quote.quoteNumber || `Q-${quote.id.substring(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900 dark:text-white">{quote.customerName || 'Unnamed Customer'}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">{quote.customerEmail || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-medium">
                      KSh {quote.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {quote.createdAt ? new Date(quote.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(quote.status)}`}>
                        {quote.status || 'draft'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => handleEdit(quote)}
                          className="text-primary hover:text-primary-dark"
                          title="Edit"
                        >
                          <FaEdit />
                        </button>
                        {quote.status !== 'converted' && (
                          <button
                            onClick={() => handleConvertToInvoice(quote)}
                            className="text-green-600 hover:text-green-900"
                            title="Convert to Invoice"
                          >
                            <FaFileInvoiceDollar />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(quote.id)}
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
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No quotes found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first quote to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="mt-4 bg-primary text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-primary-dark transition-colors"
            >
              <FaPlus /> Create Quote
            </button>
          </div>
        )}
      </div>

      {/* Quote Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">
                {editingQuote ? 'Edit Quote' : 'Create New Quote'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Customer Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Phone
                      </label>
                      <input
                        type="tel"
                        value={formData.customerPhone}
                        onChange={(e) => setFormData({...formData, customerPhone: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Company
                      </label>
                      <input
                        type="text"
                        value={formData.customerCompany}
                        onChange={(e) => setFormData({...formData, customerCompany: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Address
                      </label>
                      <textarea
                        value={formData.customerAddress}
                        onChange={(e) => setFormData({...formData, customerAddress: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows="3"
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  
                  {/* Quote Details */}
                  <div>
                    <h3 className="text-lg font-medium mb-4 text-gray-900 dark:text-white">Quote Details</h3>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-gray-700 dark:text-gray-300 text-sm font-bold mb-2">
                        Notes
                      </label>
                      <textarea
                        value={formData.notes}
                        onChange={(e) => setFormData({...formData, notes: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-primary focus:border-primary bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                        rows="3"
                        disabled={submitting}
                      />
                    </div>
                    
                    {/* Totals */}
                    <div className="bg-gray-50 dark:bg-gray-700 p-4 rounded-md">
                      <div className="flex justify-between mb-2 text-gray-900 dark:text-white">
                        <span>Subtotal:</span>
                        <span>KSh {formData.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2 text-gray-900 dark:text-white">
                        <span>Tax ({formData.taxRate}%):</span>
                        <span>KSh {formData.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg border-t pt-2 text-gray-900 dark:text-white">
                        <span>Total:</span>
                        <span>KSh {formData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Items Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-medium text-gray-900 dark:text-white">Items ({formData.items.length})</h3>
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
                    <div className="border border-gray-200 dark:border-gray-600 rounded-md overflow-hidden">
                      <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-600">
                        <thead className="bg-gray-50 dark:bg-gray-700">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-600">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="font-medium text-gray-900 dark:text-white">{item.name}</div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">{item.description}</div>
                              </td>
                              <td className="px-4 py-2 text-gray-900 dark:text-white">{item.quantity}</td>
                              <td className="px-4 py-2 text-gray-900 dark:text-white">KSh {item.price.toLocaleString()}</td>
                              <td className="px-4 py-2 font-medium text-gray-900 dark:text-white">KSh {(item.price * item.quantity).toLocaleString()}</td>
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
                    className="px-4 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-primary text-white px-6 py-2 rounded-md hover:bg-primary-dark disabled:opacity-50 disabled:cursor-not-allowed"
                    disabled={submitting}
                  >
                    {submitting ? 'Saving...' : (editingQuote ? 'Update Quote' : 'Create Quote')}
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

export default Quotes;