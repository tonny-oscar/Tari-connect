import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaInbox, FaSearch, FaPlus, FaWhatsapp, FaFacebook, FaInstagram, FaGlobe } from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';
import { getUserConversations, createConversation } from '../../services/inboxService';

const Inbox = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showNewConversation, setShowNewConversation] = useState(false);

  useEffect(() => {
    if (!user) return;

    const unsubscribe = getUserConversations(user.uid, (conversationList) => {
      setConversations(conversationList);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const filteredConversations = conversations.filter((convo) =>
    convo.contactName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    convo.lastMessage?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleNewConversation = async (contactData) => {
    const result = await createConversation({ ...contactData, userId: user.uid });
    if (result.success) {
      navigate(`/chat/${result.conversationId}`);
      setShowNewConversation(false);
    }
  };

  const getPlatformIcon = (platform) => {
    switch (platform) {
      case 'whatsapp': return <FaWhatsapp className="text-green-500" />;
      case 'facebook': return <FaFacebook className="text-blue-500" />;
      case 'instagram': return <FaInstagram className="text-purple-500" />;
      default: return <FaGlobe className="text-gray-500" />;
    }
  };

  return (
    <div className="h-full">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold mb-2 dark:text-white">Unified Inbox</h1>
          <p className="text-gray-600 dark:text-gray-400">Manage all your customer conversations in one place</p>
        </div>
        <button
          onClick={() => setShowNewConversation(true)}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <FaPlus /> New Chat
        </button>
      </div>

      {/* Search */}
      <div className="mb-6 relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FaSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          placeholder="Search conversations..."
          className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {/* Conversations list */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading conversations...</p>
          </div>
        ) : filteredConversations.length > 0 ? (
          <div className="divide-y">
            {filteredConversations.map((convo) => (
              <div
                key={convo.id}
                className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 cursor-pointer transition-colors border-b dark:border-gray-700 last:border-b-0"
                onClick={() => navigate(`/chat/${convo.id}`)}
              >
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium dark:text-white">{convo.contactName || 'Unknown Contact'}</h3>
                      {convo.unreadCount > 0 && (
                        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">
                          {convo.unreadCount}
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1 truncate">
                      {convo.lastMessage || 'No messages'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 ml-4">
                    {convo.lastUpdated?.toDate
                      ? new Date(convo.lastUpdated.toDate()).toLocaleDateString()
                      : ''}
                  </div>
                </div>
                <div className="flex items-center justify-between mt-2">
                  <div className="flex items-center gap-1 text-xs">
                    {getPlatformIcon(convo.platform)}
                    <span className="text-gray-500 dark:text-gray-400 capitalize">
                      {convo.platform || 'web'}
                    </span>
                  </div>
                  <span className={`px-2 py-1 rounded-full text-xs ${
                    convo.status === 'active' 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                      : 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300'
                  }`}>
                    {convo.status || 'active'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaInbox className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">No conversations found</h3>
            <p className="mt-1 text-gray-500 dark:text-gray-400">
              {searchTerm
                ? 'Try adjusting your search term'
                : 'Start a new conversation or connect your channels'}
            </p>
            {!searchTerm && (
              <button
                onClick={() => setShowNewConversation(true)}
                className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Start New Conversation
              </button>
            )}
          </div>
        )}
      </div>

      {/* New Conversation Modal */}
      {showNewConversation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md">
            <div className="p-6">
              <h3 className="text-lg font-semibold mb-4 dark:text-white">Start New Conversation</h3>
              <form onSubmit={(e) => {
                e.preventDefault();
                const formData = new FormData(e.target);
                handleNewConversation({
                  name: formData.get('name'),
                  email: formData.get('email'),
                  phone: formData.get('phone')
                });
              }}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
                    <input
                      name="name"
                      type="text"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Contact name"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label>
                    <input
                      name="email"
                      type="email"
                      required
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Contact email"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Phone (Optional)</label>
                    <input
                      name="phone"
                      type="tel"
                      className="w-full p-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Contact phone"
                    />
                  </div>
                </div>
                <div className="flex gap-4 mt-6">
                  <button
                    type="submit"
                    className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    Start Chat
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowNewConversation(false)}
                    className="flex-1 bg-gray-600 text-white px-4 py-2 rounded-md hover:bg-gray-700 transition-colors"
                  >
                    Cancel
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

export default Inbox;
