import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { getQuotes, createQuote, updateQuote, deleteQuote, convertQuoteToInvoice } from '../../services/quoteService';
import { FaFileAlt, FaPlus, FaSearch, FaEdit, FaTrash, FaFileInvoiceDollar, FaPrint } from 'react-icons/fa';
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

  const handlePrint = (quote) => {
    const printWindow = window.open('', '_blank');
    const printContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Estimate ${quote.quoteNumber || quote.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; line-height: 1.4; background: white; }
            .logo { position: absolute; top: 20px; left: 20px; max-width: 120px; height: auto; }
            .header { text-align: center; margin: 60px 0 30px 0; }
            .estimate-title { font-size: 24px; font-weight: bold; margin-bottom: 10px; color: black; }
            .estimate-info { margin-bottom: 30px; color: black; }
            .customer-section { margin-bottom: 30px; }
            .customer-title { font-weight: bold; margin-bottom: 10px; color: black; }
            .items-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
            .items-table th, .items-table td { border: 1px solid #000; padding: 8px; text-align: left; color: black; }
            .items-table th { background-color: #e8f5e8; font-weight: bold; color: black; }
            .totals { margin: 20px 0; color: black; }
            .total-row { font-weight: bold; color: black; }
            .notes { margin: 30px 0; color: black; }
            .payment-details { margin: 30px 0; color: black; }
            .footer { margin-top: 40px; text-align: center; font-style: italic; color: black; }
            @media print { body { margin: 0; } }
          </style>
        </head>
        <body>
          <img src="/logo.png" alt="Logo" class="logo" />
          
          <div class="header">
            <div class="estimate-title">ESTIMATE #${quote.quoteNumber || quote.id.substring(0, 8)}</div>
            <div>Estimate date: ${quote.createdAt ? new Date(quote.createdAt.toDate()).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]}</div>
            <div>Valid until: ${quote.validUntil || new Date(Date.now() + 30*24*60*60*1000).toISOString().split('T')[0]}</div>
          </div>
          
          <div class="customer-section">
            <div class="customer-title">Estimate To</div>
            <div><strong>${quote.customerName || 'Customer Name'}</strong></div>
            <div>${quote.customerCompany || 'Company Name'}</div>
            <div>${quote.customerAddress || 'Address'}</div>
            <div>Phone: ${quote.customerPhone || 'Phone Number'}</div>
            <div>Email: ${quote.customerEmail || 'Email'}</div>
            <div>Website: ${quote.website || 'Website'}</div>
            <div>VAT Number: ${quote.vatNumber || 'VAT Number'}</div>
            <div>${quote.location || 'Location'}</div>
          </div>
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Quantity</th>
                <th>Rate</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${quote.items?.map(item => `
                <tr>
                  <td><strong>${item.name}</strong><br><small>${item.description || ''}</small></td>
                  <td>${item.quantity} ${item.unit || 'Outlet'}</td>
                  <td>KES${item.price.toLocaleString()}</td>
                  <td>KES${(item.price * item.quantity).toLocaleString()}</td>
                </tr>
              `).join('') || '<tr><td colspan="4">No items</td></tr>'}
            </tbody>
          </table>
          
          <div class="totals">
            <div>Sub Total: KES${(quote.subtotal || 0).toLocaleString()}</div>
            <div class="total-row">Total: KES${(quote.total || 0).toLocaleString()}</div>
          </div>
          
          <div class="notes">
            <div><strong>Service Description:</strong></div>
            <div>${quote.notes || 'POS System only with Etims & M-pesa Integration'}</div>
            <div>1. Inventory Management</div>
            <div>2. Sales Management</div>
            <div>3. Purchase Management</div>
            <div>4. Expense Management</div>
            <div>5. Customer/Supplier Management</div>
            <div>6. Expense Management</div>
            <div>Add on integration Etims, M-pesa</div>
          </div>
          
          <div class="payment-details">
            <div><strong>Payment Details</strong></div>
            <div>M-Pesa Paybill: 542542 Acc: 424283</div>
            <div>I & M Bank Limited, Yaya Branch.</div>
            <div>An Annual Maintenance fee of Ksh 4720 will apply to cover Support, Hosting, Domain.</div>
            <div>E-tims integration Will Cost Ksh 25440 and Annual Renewal of 10,440. TAR for Integration is 4-5 Days.</div>
            <div>Mpesa integration cost KSh 13,440 and a TAR 7-10 Days of Payment.</div>
            <div>Hardware Cost is Upfront or on delivery.</div>
          </div>
          
          <div class="footer">
            <div><strong>Thank You for Choosing Us</strong></div>
            <div>We Believe on Creation</div>
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
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'sent': return 'bg-blue-100 text-blue-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      case 'converted': return 'bg-purple-100 text-purple-800';
      case 'expired': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="h-full bg-white">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-black flex items-center gap-2">
            <FaFileAlt className="text-green-600" />
            Quotes
          </h1>
          <p className="text-black">Create and manage your quotes</p>
        </div>
        <button 
          onClick={() => setShowForm(true)}
          className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-green-700 transition-colors"
        >
          <FaPlus />
          Create Quote
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
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Quotes list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-green-600 mx-auto"></div>
            <p className="text-black mt-2">Loading quotes...</p>
          </div>
        ) : filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-green-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-black uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-green-50">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-green-600">
                      {quote.quoteNumber || `Q-${quote.id.substring(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-black">{quote.customerName}</div>
                      <div className="text-sm text-black">{quote.customerEmail}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black font-medium">
                      KSh {quote.total?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-black">
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
                          onClick={() => handlePrint(quote)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Print Quote"
                        >
                          <FaPrint />
                        </button>
                        <button
                          onClick={() => handleEdit(quote)}
                          className="text-green-600 hover:text-green-800"
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
            <h3 className="text-lg font-medium text-black mb-2">No quotes found</h3>
            <p className="text-black mb-4">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first quote to get started'}
            </p>
            <button 
              onClick={() => setShowForm(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-green-700 transition-colors"
            >
              <FaPlus />
              Create Quote
            </button>
          </div>
        )}
      </div>

      {/* Quote Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-black mb-4">
                {editingQuote ? 'Edit Quote' : 'Create New Quote'}
              </h2>
              
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Customer Information */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-black">Customer Information</h3>
                    
                    <div className="mb-4">
                      <label className="block text-black text-sm font-bold mb-2">
                        Customer Name *
                      </label>
                      <input
                        type="text"
                        value={formData.customerName}
                        onChange={(e) => setFormData({...formData, customerName: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-black text-sm font-bold mb-2">
                        Email *
                      </label>
                      <input
                        type="email"
                        value={formData.customerEmail}
                        onChange={(e) => setFormData({...formData, customerEmail: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        required
                        disabled={submitting}
                      />
                    </div>
                  </div>
                  
                  {/* Quote Details */}
                  <div>
                    <h3 className="text-lg font-semibold mb-4 text-black">Quote Details</h3>
                    
                    <div className="mb-4">
                      <label className="block text-black text-sm font-bold mb-2">
                        Valid Until
                      </label>
                      <input
                        type="date"
                        value={formData.validUntil}
                        onChange={(e) => setFormData({...formData, validUntil: e.target.value})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        disabled={submitting}
                      />
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-black text-sm font-bold mb-2">
                        Tax Rate (%)
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={formData.taxRate}
                        onChange={(e) => setFormData({...formData, taxRate: parseFloat(e.target.value) || 0})}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500"
                        disabled={submitting}
                      />
                    </div>
                    
                    {/* Totals */}
                    <div className="bg-green-50 p-4 rounded-md">
                      <div className="flex justify-between mb-2">
                        <span className="text-black">Subtotal:</span>
                        <span className="text-black">KSh {formData.subtotal.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between mb-2">
                        <span className="text-black">Tax ({formData.taxRate}%):</span>
                        <span className="text-black">KSh {formData.tax.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between font-bold text-lg">
                        <span className="text-black">Total:</span>
                        <span className="text-black">KSh {formData.total.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Items Section */}
                <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-black">Items</h3>
                    <button
                      type="button"
                      onClick={() => setShowItemSelector(true)}
                      className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700"
                      disabled={submitting}
                    >
                      Add Items
                    </button>
                  </div>
                  
                  {formData.items.length > 0 && (
                    <div className="border border-gray-200 rounded-md overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-green-50">
                          <tr>
                            <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Item</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Qty</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Price</th>
                            <th className="px-4 py-2 text-left text-xs font-medium text-black uppercase">Total</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                          {formData.items.map((item, index) => (
                            <tr key={index}>
                              <td className="px-4 py-2">
                                <div className="font-medium text-black">{item.name}</div>
                                <div className="text-sm text-black">{item.description}</div>
                              </td>
                              <td className="px-4 py-2 text-black">{item.quantity}</td>
                              <td className="px-4 py-2 text-black">KSh {item.price.toLocaleString()}</td>
                              <td className="px-4 py-2 text-black">KSh {(item.price * item.quantity).toLocaleString()}</td>
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
                    className="px-4 py-2 border border-gray-300 rounded-md text-black hover:bg-gray-50"
                    disabled={submitting}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-green-600 text-white px-6 py-2 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
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