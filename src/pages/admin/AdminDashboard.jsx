import React, { useEffect, useState } from 'react';
import { collection, query, onSnapshot, doc, updateDoc, deleteDoc, orderBy, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { Link } from 'react-router-dom';
import { FaUserEdit, FaTrash, FaUserSlash, FaUserCheck, FaChartLine, FaTasks, FaComments, FaUsers, FaDollarSign } from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';
import PricingManager from '../../components/admin/PricingManager';
import { initializePricingPlans } from '../../services/pricingService';

const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [contactMessages, setContactMessages] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const { userData } = useAuth();
  
  // Stats
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    totalConversations: 0,
    totalTasks: 0,
    completedTasks: 0,
    totalMessages: 0
  });

  // Initialize pricing plans
  useEffect(() => {
    const init = async () => {
      await initializePricingPlans();
    };
    init();
  }, []);

  // Fetch all users
  useEffect(() => {
    const q = query(collection(db, 'users'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const usersList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setUsers(usersList);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalUsers: usersList.length,
          activeUsers: usersList.filter(u => u.status === 'active').length
        }));
        
        setIsLoading(false);
      } catch (err) {
        console.error('Error fetching users:', err);
        setError('Failed to load users. Please try again.');
        setIsLoading(false);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch conversations
  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdated', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const convoList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setConversations(convoList);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalConversations: convoList.length
        }));
      } catch (err) {
        console.error('Error fetching conversations:', err);
      }
    });
    
    return () => unsubscribe();
  }, []);
  
  // Fetch tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const taskList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setTasks(taskList);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalTasks: taskList.length,
          completedTasks: taskList.filter(t => t.status === 'completed').length
        }));
      } catch (err) {
        console.error('Error fetching tasks:', err);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Fetch contact messages
  useEffect(() => {
    const q = query(collection(db, 'contactMessages'), orderBy('createdAt', 'desc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      try {
        const messagesList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setContactMessages(messagesList);
        
        // Update stats
        setStats(prev => ({
          ...prev,
          totalMessages: messagesList.length
        }));
      } catch (err) {
        console.error('Error fetching contact messages:', err);
      }
    });
    
    return () => unsubscribe();
  }, []);

  // Toggle user role (admin/user)
  const toggleUserRole = async (userId, currentRole) => {
    try {
      const newRole = currentRole === 'admin' ? 'user' : 'admin';
      await updateDoc(doc(db, 'users', userId), {
        role: newRole
      });
    } catch (err) {
      console.error('Error updating user role:', err);
      setError('Failed to update user role. Please try again.');
    }
  };

  // Toggle user status (active/inactive)
  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
      await updateDoc(doc(db, 'users', userId), {
        status: newStatus
      });
    } catch (err) {
      console.error('Error updating user status:', err);
      setError('Failed to update user status. Please try again.');
    }
  };

  // Delete user
  const deleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user? This action cannot be undone.')) {
      try {
        await deleteDoc(doc(db, 'users', userId));
      } catch (err) {
        console.error('Error deleting user:', err);
        setError('Failed to delete user. Please try again.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Admin Dashboard</h1>
        <Link 
          to="/dashboard" 
          className="bg-blue-600 text-white px-3 py-2 rounded hover:bg-blue-700 transition-colors"
        >
          Back to User Dashboard
        </Link>
      </div>
      
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}
      
      {/* Admin Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Users</h3>
          <p className="text-3xl font-bold">{stats.totalUsers}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Active Users</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeUsers}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Conversations</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.totalConversations}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Tasks</h3>
          <p className="text-3xl font-bold text-purple-600">{stats.totalTasks}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Contact Messages</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.totalMessages}</p>
        </div>
      </div>
      
      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        <Link 
          to="/dashboard"
          className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-3"
        >
          <FaChartLine className="text-2xl" />
          <div>
            <h3 className="font-semibold">Dashboard</h3>
            <p className="text-sm opacity-90">View user dashboard</p>
          </div>
        </Link>
        
        <Link 
          to="/combined"
          className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors flex items-center gap-3"
        >
          <FaComments className="text-2xl" />
          <div>
            <h3 className="font-semibold">Conversations</h3>
            <p className="text-sm opacity-90">Manage conversations</p>
          </div>
        </Link>
        
        <Link 
          to="/tasks"
          className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center gap-3"
        >
          <FaTasks className="text-2xl" />
          <div>
            <h3 className="font-semibold">Tasks</h3>
            <p className="text-sm opacity-90">Manage tasks</p>
          </div>
        </Link>
        
        <button 
          onClick={() => setActiveTab('pricing')}
          className="bg-yellow-600 text-white p-4 rounded-lg shadow hover:bg-yellow-700 transition-colors flex items-center gap-3"
        >
          <FaDollarSign className="text-2xl" />
          <div className="text-left">
            <h3 className="font-semibold">Pricing</h3>
            <p className="text-sm opacity-90">Manage pricing plans</p>
          </div>
        </button>
        
        <Link 
          to="/profile"
          className="bg-orange-600 text-white p-4 rounded-lg shadow hover:bg-orange-700 transition-colors flex items-center gap-3"
        >
          <FaUsers className="text-2xl" />
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm opacity-90">Manage your profile</p>
          </div>
        </Link>
      </div>
      
      {/* Tabs */}
      <div className="mb-4 border-b">
        <div className="flex">
          <button
            className={`py-2 px-4 ${activeTab === 'overview' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'users' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('users')}
          >
            User Management
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'pricing' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('pricing')}
          >
            Pricing Management
          </button>
          <button
            className={`py-2 px-4 ${activeTab === 'messages' ? 'border-b-2 border-blue-600 text-blue-600' : 'text-gray-500'}`}
            onClick={() => setActiveTab('messages')}
          >
            Contact Messages
          </button>
        </div>
      </div>
      
      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Recent Users */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Users</h2>
              <button 
                onClick={() => setActiveTab('users')}
                className="text-sm text-blue-600 hover:underline"
              >
                View All
              </button>
            </div>
            <div className="p-4">
              {users.slice(0, 5).map(user => (
                <div key={user.id} className="mb-3 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white mr-3">
                      {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <div>
                      <p className="font-medium">{user.name || 'No Name'}</p>
                      <p className="text-sm text-gray-500">{user.email}</p>
                    </div>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                  }`}>
                    {user.role || 'user'}
                  </span>
                </div>
              ))}
            </div>
          </div>
          
          {/* Recent Conversations */}
          <div className="bg-white rounded-lg shadow overflow-hidden">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Recent Conversations</h2>
              <Link to="/combined" className="text-sm text-blue-600 hover:underline">
                View All
              </Link>
            </div>
            <div className="p-4">
              {conversations.slice(0, 5).map(convo => (
                <div key={convo.id} className="mb-3">
                  <div className="flex justify-between">
                    <p className="font-medium">{convo.contactName || 'Unknown Contact'}</p>
                    <p className="text-sm text-gray-500">
                      {convo.lastUpdated ? new Date(convo.lastUpdated.toDate()).toLocaleDateString() : ''}
                    </p>
                  </div>
                  <p className="text-sm text-gray-600 truncate">
                    {convo.lastMessage || 'No messages'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
      
      {activeTab === 'users' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">User Management</h2>
            <p className="text-sm text-gray-500">Total users: {users.length}</p>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white">
                          {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {user.name || 'No Name'}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.role === 'admin' ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
                      }`}>
                        {user.role || 'user'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        user.status === 'inactive' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                      }`}>
                        {user.status || 'active'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {user.createdAt ? new Date(user.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex space-x-2">
                        <button
                          onClick={() => toggleUserRole(user.id, user.role)}
                          className="text-blue-600 hover:text-blue-900"
                          title={user.role === 'admin' ? 'Remove admin rights' : 'Make admin'}
                        >
                          <FaUserEdit />
                        </button>
                        <button
                          onClick={() => toggleUserStatus(user.id, user.status)}
                          className={user.status === 'inactive' ? 'text-green-600 hover:text-green-900' : 'text-yellow-600 hover:text-yellow-900'}
                          title={user.status === 'inactive' ? 'Activate user' : 'Deactivate user'}
                        >
                          {user.status === 'inactive' ? <FaUserCheck /> : <FaUserSlash />}
                        </button>
                        <button
                          onClick={() => deleteUser(user.id)}
                          className="text-red-600 hover:text-red-900"
                          title="Delete user"
                        >
                          <FaTrash />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
                
                {users.length === 0 && (
                  <tr>
                    <td colSpan="6" className="px-6 py-4 text-center text-gray-500">
                      No users found
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
      
      {activeTab === 'pricing' && (
        <PricingManager />
      )}
      
      {activeTab === 'messages' && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="p-4 border-b">
            <h2 className="text-lg font-semibold">Contact Messages</h2>
            <p className="text-sm text-gray-500">Total messages: {contactMessages.length}</p>
          </div>
          
          <div className="divide-y divide-gray-200">
            {contactMessages.map(message => (
              <div key={message.id} className="p-4">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-medium text-gray-900">{message.name}</h3>
                    <p className="text-sm text-gray-600">{message.email}</p>
                  </div>
                  <span className="text-xs text-gray-500">
                    {message.createdAt ? new Date(message.createdAt.toDate()).toLocaleDateString() : 'N/A'}
                  </span>
                </div>
                <p className="text-gray-800">{message.message}</p>
              </div>
            ))}
            
            {contactMessages.length === 0 && (
              <div className="p-8 text-center text-gray-500">
                No contact messages found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;