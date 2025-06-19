import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useNavigate, Link } from 'react-router-dom';
import { FaUserPlus, FaBell, FaChartLine, FaUserCheck, FaUserClock, FaComments, FaTasks } from 'react-icons/fa';
import { useAuth } from '../store/useAuth';

function Dashboard() {
  const [conversations, setConversations] = useState([]);
  const [agents, setAgents] = useState([]);
  const [leads, setLeads] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [stats, setStats] = useState({
    totalLeads: 0,
    activeLeads: 0,
    unassignedLeads: 0,
    totalAgents: 0,
    activeAgents: 0,
    pendingTasks: 0
  });
  
  const { userData, isAdmin } = useAuth();
  const navigate = useNavigate();

  // Fetch conversations
  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('lastUpdated', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const convos = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setConversations(convos);
    });
    return () => unsubscribe();
  }, []);

  // Fetch agents
  useEffect(() => {
    const q = query(collection(db, 'agents'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentList);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalAgents: agentList.length,
        activeAgents: agentList.filter(a => a.status === 'active').length
      }));
    });
    return () => unsubscribe();
  }, []);

  // Fetch leads
  useEffect(() => {
    const q = query(collection(db, 'leads'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const leadList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setLeads(leadList);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        totalLeads: leadList.length,
        activeLeads: leadList.filter(l => l.status === 'active').length,
        unassignedLeads: leadList.filter(l => !l.assignedTo).length
      }));
    });
    return () => unsubscribe();
  }, []);
  
  // Fetch tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), where('status', '!=', 'completed'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
      
      // Update stats
      setStats(prev => ({
        ...prev,
        pendingTasks: taskList.length
      }));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Welcome, {userData?.name || 'User'}</h1>
        <div className="flex gap-2">
          {isAdmin() && (
            <Link 
              to="/admin" 
              className="bg-purple-600 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-purple-700 transition-colors"
            >
              Admin Dashboard
            </Link>
          )}
          <Link 
            to="/tasks"
            className="bg-green-600 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-green-700 transition-colors"
          >
            <FaTasks className="text-sm" /> Manage Tasks
          </Link>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Link 
          to="/combined"
          className="bg-blue-600 text-white p-4 rounded-lg shadow hover:bg-blue-700 transition-colors flex items-center gap-3"
        >
          <FaComments className="text-2xl" />
          <div>
            <h3 className="font-semibold">Conversations</h3>
            <p className="text-sm opacity-90">Manage customer interactions</p>
          </div>
        </Link>
        
        <Link 
          to="/tasks"
          className="bg-green-600 text-white p-4 rounded-lg shadow hover:bg-green-700 transition-colors flex items-center gap-3"
        >
          <FaTasks className="text-2xl" />
          <div>
            <h3 className="font-semibold">Tasks</h3>
            <p className="text-sm opacity-90">Manage and assign tasks</p>
          </div>
        </Link>
        
        <Link 
          to="/profile"
          className="bg-purple-600 text-white p-4 rounded-lg shadow hover:bg-purple-700 transition-colors flex items-center gap-3"
        >
          <FaUserCheck className="text-2xl" />
          <div>
            <h3 className="font-semibold">Profile</h3>
            <p className="text-sm opacity-90">Manage your account</p>
          </div>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Leads</h3>
          <p className="text-3xl font-bold">{stats.totalLeads}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Active Leads</h3>
          <p className="text-3xl font-bold text-green-600">{stats.activeLeads}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Unassigned</h3>
          <p className="text-3xl font-bold text-yellow-600">{stats.unassignedLeads}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Total Agents</h3>
          <p className="text-3xl font-bold">{stats.totalAgents}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Active Agents</h3>
          <p className="text-3xl font-bold text-blue-600">{stats.activeAgents}</p>
        </div>
        
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-medium text-gray-700">Pending Tasks</h3>
          <p className="text-3xl font-bold text-orange-600">{stats.pendingTasks}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Recent Messages */}
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaBell /> Recent Messages
            </h2>
            <Link to="/combined" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4">
            {conversations.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No recent messages</p>
            ) : (
              <div className="divide-y">
                {conversations.slice(0, 5).map(convo => (
                  <div 
                    key={convo.id} 
                    className="py-3 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => navigate(`/combined/${convo.id}`)}
                  >
                    <div className="flex justify-between">
                      <p className="font-medium">{convo.contactName || 'Unknown Contact'}</p>
                      <p className="text-sm text-gray-500">
                        {convo.lastUpdated ? new Date(convo.lastUpdated.toDate()).toLocaleString() : ''}
                      </p>
                    </div>
                    <p className="text-sm text-gray-600 truncate">
                      {convo.lastMessage || 'No messages'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Pending Tasks */}
        <div className="bg-white rounded shadow">
          <div className="p-4 border-b flex justify-between items-center">
            <h2 className="text-xl font-semibold flex items-center gap-2">
              <FaTasks /> Pending Tasks
            </h2>
            <Link to="/tasks" className="text-sm text-blue-600 hover:underline">
              View All
            </Link>
          </div>
          <div className="p-4">
            {tasks.length === 0 ? (
              <p className="text-gray-500 text-center py-4">No pending tasks</p>
            ) : (
              <div className="divide-y">
                {tasks.slice(0, 5).map(task => (
                  <div key={task.id} className="py-3">
                    <div className="flex justify-between">
                      <p className="font-medium">{task.title}</p>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        task.priority === 'high' ? 'bg-red-100 text-red-800' : 
                        task.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 
                        'bg-green-100 text-green-800'
                      }`}>
                        {task.priority}
                      </span>
                    </div>
                    {task.dueDate && (
                      <p className="text-sm text-gray-500">
                        Due: {new Date(task.dueDate).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;