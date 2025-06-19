import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaUserFriends, FaPlus, FaFilter } from 'react-icons/fa';

const Leads = () => {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadsList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setLeads(leadsList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredLeads = filter === 'all' 
    ? leads 
    : leads.filter(lead => lead.status === filter);

  const stages = [
    { id: 'all', name: 'All Leads' },
    { id: 'new', name: 'New' },
    { id: 'contacted', name: 'Contacted' },
    { id: 'qualified', name: 'Qualified' },
    { id: 'proposal', name: 'Proposal' },
    { id: 'negotiation', name: 'Negotiation' },
    { id: 'won', name: 'Won' },
    { id: 'lost', name: 'Lost' }
  ];

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Leads Management</h1>
          <p className="text-gray-600">Track and manage your sales pipeline</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FaPlus /> Add Lead
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-6 flex items-center">
        <FaFilter className="text-gray-500 mr-2" />
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {stages.map(stage => (
            <button
              key={stage.id}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === stage.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter(stage.id)}
            >
              {stage.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Leads list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading leads...</p>
          </div>
        ) : filteredLeads.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Value</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Created</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredLeads.map(lead => (
                  <tr key={lead.id} className="hover:bg-gray-50 cursor-pointer">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{lead.name || 'Unnamed Lead'}</div>
                      <div className="text-sm text-gray-500">{lead.email || 'No email'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.company || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        lead.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        lead.status === 'contacted' ? 'bg-yellow-100 text-yellow-800' :
                        lead.status === 'qualified' ? 'bg-indigo-100 text-indigo-800' :
                        lead.status === 'proposal' ? 'bg-purple-100 text-purple-800' :
                        lead.status === 'negotiation' ? 'bg-orange-100 text-orange-800' :
                        lead.status === 'won' ? 'bg-green-100 text-green-800' :
                        lead.status === 'lost' ? 'bg-red-100 text-red-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {lead.status || 'new'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.value ? `KSh ${lead.value.toLocaleString()}` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {lead.createdAt ? new Date(lead.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaUserFriends className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No leads found</h3>
            <p className="mt-1 text-gray-500">
              {filter !== 'all' ? 'No leads in this stage' : 'Add your first lead to get started'}
            </p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
              <FaPlus /> Add Lead
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Leads;