import React, { useState, useEffect } from 'react';
import { collection, query, orderBy, onSnapshot, where } from 'firebase/firestore';
import { db } from '../../services/firebase';
import { FaTasks, FaPlus, FaCalendarAlt, FaFilter } from 'react-icons/fa';
import { useAuth } from '../../store/useAuth';

const Tasks = () => {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const { user } = useAuth();

  useEffect(() => {
    let q;
    
    if (filter === 'my-tasks') {
      q = query(
        collection(db, 'tasks'), 
        where('assignedTo', '==', user?.uid),
        orderBy('dueDate')
      );
    } else if (filter === 'completed') {
      q = query(
        collection(db, 'tasks'), 
        where('status', '==', 'completed'),
        orderBy('completedAt', 'desc')
      );
    } else if (filter === 'overdue') {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      q = query(
        collection(db, 'tasks'), 
        where('status', '!=', 'completed'),
        where('dueDate', '<', today),
        orderBy('dueDate')
      );
    } else {
      q = query(collection(db, 'tasks'), orderBy('dueDate'));
    }
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const tasksList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setTasks(tasksList);
      setLoading(false);
    });
    
    return () => unsubscribe();
  }, [filter, user?.uid]);

  const filterOptions = [
    { id: 'all', name: 'All Tasks' },
    { id: 'my-tasks', name: 'My Tasks' },
    { id: 'overdue', name: 'Overdue' },
    { id: 'completed', name: 'Completed' }
  ];

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'in-progress':
        return 'bg-blue-100 text-blue-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDueDate = (dueDate) => {
    if (!dueDate) return 'No due date';
    
    const date = dueDate.toDate ? dueDate.toDate() : new Date(dueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date < today) {
      return `Overdue: ${date.toLocaleDateString()}`;
    } else if (date.getTime() === today.getTime()) {
      return 'Today';
    } else if (date.getTime() === tomorrow.getTime()) {
      return 'Tomorrow';
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div className="h-full">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold mb-2">Tasks & Reminders</h1>
          <p className="text-gray-600">Stay organized with your to-do list</p>
        </div>
        <button className="bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 hover:bg-blue-700 transition-colors">
          <FaPlus /> Add Task
        </button>
      </div>
      
      {/* Filter tabs */}
      <div className="mb-6 flex items-center">
        <FaFilter className="text-gray-500 mr-2" />
        <div className="flex space-x-1 overflow-x-auto pb-2">
          {filterOptions.map(option => (
            <button
              key={option.id}
              className={`px-4 py-2 rounded-md whitespace-nowrap ${
                filter === option.id 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
              onClick={() => setFilter(option.id)}
            >
              {option.name}
            </button>
          ))}
        </div>
      </div>
      
      {/* Tasks list */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-4 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
            <p className="mt-2 text-gray-600">Loading tasks...</p>
          </div>
        ) : tasks.length > 0 ? (
          <div className="divide-y">
            {tasks.map(task => (
              <div key={task.id} className="p-4 hover:bg-gray-50 cursor-pointer">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{task.title}</h3>
                    <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                    
                    <div className="flex flex-wrap gap-2 mt-3">
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getPriorityColor(task.priority)}`}>
                        {task.priority || 'normal'}
                      </span>
                      
                      <span className={`px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(task.status)}`}>
                        {task.status || 'pending'}
                      </span>
                      
                      {task.assignedTo && (
                        <span className="px-2 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-purple-100 text-purple-800">
                          {task.assignedToName || 'Assigned'}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500">
                    <FaCalendarAlt className="mr-1" />
                    {formatDueDate(task.dueDate)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center">
            <FaTasks className="mx-auto text-4xl text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900">No tasks found</h3>
            <p className="mt-1 text-gray-500">
              {filter !== 'all' ? 'Try changing your filter' : 'Add your first task to get started'}
            </p>
            <button className="mt-4 bg-blue-600 text-white px-4 py-2 rounded-md flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
              <FaPlus /> Add Task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;