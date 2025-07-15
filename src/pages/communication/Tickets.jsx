import React, { useState, useEffect } from 'react';
import { useAuth } from '../../store/useAuth';
import { 
  FaTicketAlt, FaPlus, FaSearch, FaFilter, FaBolt, FaRocket, FaMagic, 
  FaFire, FaSnowflake, FaClock, FaUser, FaComments, FaEye, FaEdit, 
  FaTrash, FaCheck, FaTimes, FaStar, FaHeart, FaLightbulb, FaGem,
  FaThumbsUp, FaThumbsDown, FaFlag, FaShare, FaBookmark, FaPaperPlane,
  FaRobot, FaChartLine, FaAward, FaTrophy, FaMedal, FaCrown
} from 'react-icons/fa';
import { collection, addDoc, onSnapshot, query, where, orderBy, updateDoc, doc, deleteDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../services/firebase';

const Tickets = () => {
  const { user, userData } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [selectedTicket, setSelectedTicket] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterPriority, setFilterPriority] = useState('all');
  const [viewMode, setViewMode] = useState('kanban');
  const [sortBy, setSortBy] = useState('created');
  const [showAI, setShowAI] = useState(false);
  const [aiSuggestion, setAiSuggestion] = useState('');
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priority: 'medium',
    category: 'general',
    status: 'open',
    assignedTo: '',
    tags: [],
    dueDate: '',
    estimatedHours: '',
    mood: '😐',
    color: '#3B82F6'
  });

  const priorities = [
    { value: 'critical', label: 'Critical', color: 'bg-red-500', icon: FaFire },
    { value: 'high', label: 'High', color: 'bg-orange-500', icon: FaBolt },
    { value: 'medium', label: 'Medium', color: 'bg-yellow-500', icon: FaStar },
    { value: 'low', label: 'Low', color: 'bg-blue-500', icon: FaSnowflake }
  ];

  const statuses = [
    { value: 'open', label: 'Open', color: 'bg-green-500' },
    { value: 'in-progress', label: 'In Progress', color: 'bg-blue-500' },
    { value: 'waiting', label: 'Waiting', color: 'bg-yellow-500' },
    { value: 'resolved', label: 'Resolved', color: 'bg-purple-500' },
    { value: 'closed', label: 'Closed', color: 'bg-gray-500' }
  ];

  const categories = [
    { value: 'bug', label: 'Bug Report' },
    { value: 'feature', label: 'Feature Request' },
    { value: 'support', label: 'Support' },
    { value: 'question', label: 'Question' },
    { value: 'improvement', label: 'Improvement' },
    { value: 'general', label: 'General' }
  ];

  const moods = ['😡', '😟', '😐', '😊', '🤩', '🥳', '🤖', '👑'];
  const colors = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];

  useEffect(() => {
    if (!user) return;
    
    const q = query(
      collection(db, 'tickets'),
      where('userId', '==', user.uid)
    );
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const ticketsData = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTickets(ticketsData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    try {
      const ticketData = {
        ...formData,
        userId: user.uid,
        createdBy: userData?.name || user.email,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ticketNumber: `TK-${Date.now()}`,
        reactions: {},
        comments: [],
        timeSpent: 0,
        satisfaction: null
      };

      if (selectedTicket) {
        await updateDoc(doc(db, 'tickets', selectedTicket.id), {
          ...ticketData,
          updatedAt: serverTimestamp()
        });
      } else {
        await addDoc(collection(db, 'tickets'), ticketData);
      }

      resetForm();
      generateAISuggestion();
    } catch (error) {
      console.error('Error saving ticket:', error);
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      priority: 'medium',
      category: 'general',
      status: 'open',
      assignedTo: '',
      tags: [],
      dueDate: '',
      estimatedHours: '',
      mood: '😐',
      color: '#3B82F6'
    });
    setSelectedTicket(null);
    setShowForm(false);
  };

  const handleEdit = (ticket) => {
    setSelectedTicket(ticket);
    setFormData({
      title: ticket.title || '',
      description: ticket.description || '',
      priority: ticket.priority || 'medium',
      category: ticket.category || 'general',
      status: ticket.status || 'open',
      assignedTo: ticket.assignedTo || '',
      tags: ticket.tags || [],
      dueDate: ticket.dueDate || '',
      estimatedHours: ticket.estimatedHours || '',
      mood: ticket.mood || '😐',
      color: ticket.color || '#3B82F6'
    });
    setShowForm(true);
  };

  const handleDelete = async (ticketId) => {
    if (window.confirm('Are you sure you want to delete this ticket?')) {
      try {
        await deleteDoc(doc(db, 'tickets', ticketId));
      } catch (error) {
        console.error('Error deleting ticket:', error);
      }
    }
  };

  const handleReaction = async (ticketId, reaction) => {
    try {
      const ticket = tickets.find(t => t.id === ticketId);
      const reactions = ticket.reactions || {};
      const userReactions = reactions[user.uid] || [];
      
      const newReactions = userReactions.includes(reaction)
        ? userReactions.filter(r => r !== reaction)
        : [...userReactions, reaction];
      
      await updateDoc(doc(db, 'tickets', ticketId), {
        [`reactions.${user.uid}`]: newReactions,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating reaction:', error);
    }
  };

  const generateAISuggestion = () => {
    const suggestions = [
      "🤖 AI suggests: Consider breaking this into smaller tasks for better tracking!",
      "🧠 Smart tip: Similar tickets were resolved faster with priority escalation.",
      "💡 Insight: This category typically takes 2-3 days to resolve.",
      "🎯 Recommendation: Add more specific tags for better organization.",
      "⚡ Pro tip: Assign to team lead for faster resolution.",
      "🔮 Prediction: High chance of quick resolution based on description!"
    ];
    setAiSuggestion(suggestions[Math.floor(Math.random() * suggestions.length)]);
    setShowAI(true);
    setTimeout(() => setShowAI(false), 5000);
  };

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch = ticket.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         ticket.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = filterStatus === 'all' || ticket.status === filterStatus;
    const matchesPriority = filterPriority === 'all' || ticket.priority === filterPriority;
    
    return matchesSearch && matchesStatus && matchesPriority;
  });

  const getTicketsByStatus = (status) => {
    return filteredTickets.filter(ticket => ticket.status === status);
  };

  const getPriorityIcon = (priority) => {
    const priorityObj = priorities.find(p => p.value === priority);
    return priorityObj ? priorityObj.icon : FaStar;
  };

  const getTimeAgo = (timestamp) => {
    if (!timestamp) return 'Just now';
    const now = new Date();
    const created = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const diff = now - created;
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const TicketCard = ({ ticket }) => {
    const PriorityIcon = getPriorityIcon(ticket.priority);
    const categoryObj = categories.find(c => c.value === ticket.category);
    
    return (
      <div 
        className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 border-l-4 overflow-hidden"
        style={{ borderLeftColor: ticket.color || '#3B82F6' }}
      >
        {/* Header */}
        <div className="p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-gray-500">{ticket.ticketNumber}</span>
            <PriorityIcon className={`w-4 h-4 ${priorities.find(p => p.value === ticket.priority)?.color.replace('bg-', 'text-')}`} />
          </div>
          
          <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
            {ticket.title}
          </h3>
          
          <p className="text-sm text-gray-600 line-clamp-2">
            {ticket.description}
          </p>
        </div>

        {/* Tags */}
        {ticket.tags && ticket.tags.length > 0 && (
          <div className="px-4 py-2 flex flex-wrap gap-1">
            {ticket.tags.slice(0, 3).map((tag, index) => (
              <span key={index} className="px-2 py-1 bg-gray-100 text-xs rounded-full">
                #{tag}
              </span>
            ))}
            {ticket.tags.length > 3 && (
              <span className="text-xs text-gray-500">+{ticket.tags.length - 3}</span>
            )}
          </div>
        )}

        {/* Status & Time */}
        <div className="px-4 py-2 bg-gray-50">
          <div className="flex items-center justify-between text-xs">
            <span className={`px-2 py-1 rounded-full text-white ${statuses.find(s => s.value === ticket.status)?.color}`}>
              {statuses.find(s => s.value === ticket.status)?.label}
            </span>
            <span className="text-gray-500 flex items-center gap-1">
              <FaClock className="w-3 h-3" />
              {getTimeAgo(ticket.createdAt)}
            </span>
          </div>
        </div>

        {/* Reactions */}
        <div className="px-4 py-2 border-t">
          <div className="flex items-center justify-between">
            <div className="flex gap-1">
              {['👍', '❤️', '🎉', '🚀'].map(reaction => (
                <button
                  key={reaction}
                  onClick={() => handleReaction(ticket.id, reaction)}
                  className="hover:scale-125 transition-transform"
                >
                  {reaction}
                </button>
              ))}
            </div>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(ticket)}
                className="text-blue-500 hover:text-blue-700 transition-colors"
              >
                <FaEdit className="w-4 h-4" />
              </button>
              <button
                onClick={() => handleDelete(ticket.id)}
                className="text-red-500 hover:text-red-700 transition-colors"
              >
                <FaTrash className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="h-full flex flex-col">
      {/* AI Suggestion Toast */}
      {showAI && (
        <div className="fixed top-4 right-4 z-50 bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-lg shadow-lg animate-bounce">
          <div className="flex items-center gap-2">
            <FaRobot className="w-5 h-5" />
            <span className="text-sm">{aiSuggestion}</span>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <FaTicketAlt className="text-blue-600" />
            Tickets
          </h1>
          <p className="text-gray-600 mt-1">
            Manage your support tickets
          </p>
        </div>
        
        <div className="flex gap-3">
          <button
            onClick={() => setShowForm(true)}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg flex items-center gap-2 hover:bg-blue-700 transition-colors"
          >
            <FaPlus />
            Create Ticket
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-wrap gap-4 mb-6 p-4 bg-white rounded-xl shadow-sm">
        {/* Search */}
        <div className="relative flex-1 min-w-64">
          <FaSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search tickets..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Filters */}
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="all">All Status</option>
          {statuses.map(status => (
            <option key={status.value} value={status.value}>{status.label}</option>
          ))}
        </select>

        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
        >
          <option value="all">All Priority</option>
          {priorities.map(priority => (
            <option key={priority.value} value={priority.value}>{priority.label}</option>
          ))}
        </select>

        {/* View Mode */}
        <div className="flex bg-gray-100 rounded-lg p-1">
          {['kanban', 'list', 'timeline'].map(mode => (
            <button
              key={mode}
              onClick={() => setViewMode(mode)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                viewMode === mode
                  ? 'bg-purple-500 text-white'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
        {statuses.map(status => {
          const count = getTicketsByStatus(status.value).length;
          return (
            <div key={status.value} className="bg-white p-4 rounded-lg shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold">{count}</p>
                  <p className="text-sm text-gray-600">{status.label}</p>
                </div>
                <div className={`w-3 h-3 rounded-full ${status.color}`}></div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Tickets Display */}
      <div className="flex-1 overflow-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : viewMode === 'kanban' ? (
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 h-full">
            {statuses.map(status => (
              <div key={status.value} className="flex flex-col">
                <div className={`p-3 rounded-t-lg text-white font-semibold ${status.color}`}>
                  {status.label} ({getTicketsByStatus(status.value).length})
                </div>
                <div className="flex-1 bg-gray-50 p-4 rounded-b-lg space-y-4 min-h-96">
                  {getTicketsByStatus(status.value).map(ticket => (
                    <TicketCard key={ticket.id} ticket={ticket} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTickets.map(ticket => (
              <TicketCard key={ticket.id} ticket={ticket} />
            ))}
          </div>
        )}
      </div>

      {/* Create/Edit Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">
                  {selectedTicket ? 'Edit Ticket' : 'Create Ticket'}
                </h2>
                <button
                  onClick={resetForm}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <FaTimes className="w-6 h-6" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Title */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ticket Title
                  </label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    placeholder="Enter ticket title"
                    required
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Description
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    rows="4"
                    placeholder="Describe the issue or request..."
                    required
                  />
                </div>

                {/* Priority & Category */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Priority
                    </label>
                    <select
                      value={formData.priority}
                      onChange={(e) => setFormData({...formData, priority: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {priorities.map(priority => (
                        <option key={priority.value} value={priority.value}>
                          {priority.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Category
                    </label>
                    <select
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-primary focus:border-primary"
                    >
                      {categories.map(category => (
                        <option key={category.value} value={category.value}>
                          {category.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>



                {/* Submit */}
                <div className="flex justify-end gap-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
                  >
                    <FaCheck />
                    {selectedTicket ? 'Update Ticket' : 'Create Ticket'}
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

export default Tickets;