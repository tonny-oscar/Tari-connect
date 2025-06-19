import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaInbox, FaSearch } from 'react-icons/fa';

const Inbox = () => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdated', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const conversationList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setConversations(conversationList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, []);

  const filteredConversations = conversations.filter(convo => 
    convo.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="h-full">
      <div className="mb-6">
        <h1 className="text-2xl font-bold mb-2">Unified Inbox</h1>
        <p className="text-gray-600">Manage all your customer conversations in one place</p>
      </div>
      
      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search conversations..."
          className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
      
      {/* Conversations list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map(convo => (
              <div 
                key={convo.id} 
                className="p-4 hover:bg-gray-50 cursor-pointer transition-colors"
                onClick={() => window.location.href = `/chat/${convo.id}`}
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-medium">{convo.contactName || 'Unknown Contact'}</h3>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-1">{convo.lastMessage || 'No messages'}</p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {convo.lastUpdated ? new Date(convo.lastUpdated.toDate()).toLocaleString() : ''}
                  </div>
                </div>
                <div className="flex items-center mt-2 text-xs">
                  <span className={`px-2 py-1 rounded-full ${
                    convo.platform === 'whatsapp' ? 'bg-green-100 text-green-800' :
                    convo.platform === 'facebook' ? 'bg-blue-100 text-blue-800' :
                    convo.platform === 'instagram' ? 'bg-purple-100 text-purple-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {convo.platform || 'web'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaInbox className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No conversations found</h3>
            <p className="mt-1 text-gray-500">
              {searchTerm ? 'Try adjusting your search term' : 'Start connecting your channels to receive messages'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Inbox;