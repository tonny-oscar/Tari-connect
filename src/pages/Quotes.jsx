import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaFileAlt, FaPlus, FaSearch } from 'react-icons/fa';

const Quotes = () => {
  const [quotes, setQuotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'quotes'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const quotesList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setQuotes(quotesList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredQuotes = quotes.filter(quote => 
    quote.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    quote.quoteNumber?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Quotes</h1>
          <p className="text-gray-600">Create and manage sales quotations</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors">
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
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Quotes list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading quotes...</p>
          </div>
        ) : filteredQuotes.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quote #</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Customer</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredQuotes.map(quote => (
                  <tr key={quote.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap font-medium text-blue-600">
                      {quote.quoteNumber || `Q-${quote.id.substring(0, 6)}`}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{quote.customerName || 'Unnamed Customer'}</div>
                      <div className="text-sm text-gray-500">{quote.customerEmail || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 font-medium">
                      KSh {quote.totalAmount?.toLocaleString() || '0'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {quote.createdAt ? new Date(quote.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        quote.status === 'draft' ? 'bg-gray-100 text-gray-800' :
                        quote.status === 'sent' ? 'bg-blue-100 text-blue-800' :
                        quote.status === 'accepted' ? 'bg-green-100 text-green-800' :
                        quote.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        quote.status === 'expired' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {quote.status || 'draft'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaFileAlt className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No quotes found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Create your first quote to get started'}
            </p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
              <FaPlus /> Create Quote
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Quotes;