import React, { useEffect, useState } from 'react';
import { collection, onSnapshot, query, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { FaPlus, FaTrash, FaCheck, FaClock, FaExclamationCircle } from 'react-icons/fa';
import { 
  createTask, 
  updateTaskStatus, 
  deleteTask 
} from '../services/dataService';
import { createMessageNotification } from '../services/notificationService';

function Tasks() {
  const [tasks, setTasks] = useState([]);
  const [agents, setAgents] = useState([]);
  const [showAddTask, setShowAddTask] = useState(false);
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending'
  });
  const [filter, setFilter] = useState('all');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fetch tasks
  useEffect(() => {
    const q = query(collection(db, 'tasks'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const taskList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setTasks(taskList);
    });
    return () => unsubscribe();
  }, []);

  // Fetch agents for assignment
  useEffect(() => {
    const q = query(collection(db, 'agents'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentList);
    });
    return () => unsubscribe();
  }, []);

  // Handle adding a new task
  const handleAddTask = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const result = await createTask(newTask);
      
      if (result.success) {
        // Create notification for assigned agent
        if (newTask.assignedTo) {
          const assignedAgent = agents.find(a => a.id === newTask.assignedTo);
          if (assignedAgent) {
            await createMessageNotification(
              assignedAgent.id,
              'New Task Assigned',
              `You have been assigned a new task: ${newTask.title}`,
              'task'
            );
          }
        }
        
        // Reset form
        setNewTask({
          title: '',
          description: '',
          assignedTo: '',
          dueDate: '',
          priority: 'medium',
          status: 'pending'
        });
        setShowAddTask(false);
      } else {
        alert('Error creating task: ' + result.error);
      }
    } catch (error) {
      console.error('Error in task creation:', error);
      alert('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Update task status
  const handleUpdateTaskStatus = async (taskId, newStatus) => {
    try {
      await updateTaskStatus(taskId, newStatus);
    } catch (error) {
      console.error('Error updating task status:', error);
      alert('Failed to update task status');
    }
  };

  // Delete task
  const handleDeleteTask = async (taskId) => {
    if (confirm('Are you sure you want to delete this task?')) {
      try {
        await deleteTask(taskId);
      } catch (error) {
        console.error('Error deleting task:', error);
        alert('Failed to delete task');
      }
    }
  };

  // Filter tasks based on selected filter
  const filteredTasks = tasks.filter(task => {
    if (filter === 'all') return true;
    if (filter === 'pending') return task.status === 'pending';
    if (filter === 'completed') return task.status === 'completed';
    if (filter === 'overdue') {
      if (task.status === 'completed') return false;
      if (!task.dueDate) return false;
      const dueDate = new Date(task.dueDate);
      return dueDate < new Date();
    }
    return true;
  });

  // Get priority badge color
  const getPriorityBadge = (priority) => {
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

  // Check if task is overdue
  const isTaskOverdue = (dueDate) => {
    if (!dueDate) return false;
    return new Date(dueDate) < new Date();
  };

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Task Management</h1>
        <button 
          onClick={() => setShowAddTask(!showAddTask)}
          className="bg-blue-600 text-white px-3 py-2 rounded flex items-center gap-1 hover:bg-blue-700 transition-colors"
          disabled={isSubmitting}
        >
          <FaPlus /> Add Task
        </button>
      </div>

      {/* Add Task Form */}
      {showAddTask && (
        <div className="bg-white p-4 rounded shadow mb-6">
          <h2 className="text-xl font-semibold mb-4">Add New Task</h2>
          <form onSubmit={handleAddTask}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                <input
                  type="text"
                  value={newTask.title}
                  onChange={(e) => setNewTask({...newTask, title: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  required
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
                <select
                  value={newTask.assignedTo}
                  onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="">Select Agent</option>
                  {agents.map(agent => (
                    <option key={agent.id} value={agent.id}>{agent.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <input
                  type="datetime-local"
                  value={newTask.dueDate}
                  onChange={(e) => setNewTask({...newTask, dueDate: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                <select
                  value={newTask.priority}
                  onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  disabled={isSubmitting}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                <textarea
                  value={newTask.description}
                  onChange={(e) => setNewTask({...newTask, description: e.target.value})}
                  className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
                  rows="3"
                  disabled={isSubmitting}
                ></textarea>
              </div>
            </div>
            <div className="mt-4 flex justify-end">
              <button
                type="button"
                onClick={() => setShowAddTask(false)}
                className="mr-2 px-4 py-2 border rounded hover:bg-gray-100 transition-colors"
                disabled={isSubmitting}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Saving...' : 'Save Task'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Task Filters */}
      <div className="mb-4 flex flex-wrap gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-3 py-1 rounded transition-colors ${filter === 'all' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('pending')}
          className={`px-3 py-1 rounded transition-colors ${filter === 'pending' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Pending
        </button>
        <button
          onClick={() => setFilter('completed')}
          className={`px-3 py-1 rounded transition-colors ${filter === 'completed' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Completed
        </button>
        <button
          onClick={() => setFilter('overdue')}
          className={`px-3 py-1 rounded transition-colors ${filter === 'overdue' ? 'bg-blue-600 text-white' : 'bg-gray-200 hover:bg-gray-300'}`}
        >
          Overdue
        </button>
      </div>

      {/* Tasks List */}
      <div className="bg-white rounded shadow">
        <div className="p-4 border-b">
          <h2 className="text-xl font-semibold">Tasks</h2>
        </div>
        <div className="p-4">
          {filteredTasks.length === 0 ? (
            <p className="text-center text-gray-500 py-4">No tasks found</p>
          ) : (
            <div className="divide-y">
              {filteredTasks.map(task => (
                <div key={task.id} className="py-4">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className="font-medium">{task.title}</h3>
                        <span className={`text-xs px-2 py-1 rounded ${getPriorityBadge(task.priority)}`}>
                          {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                        </span>
                        {isTaskOverdue(task.dueDate) && task.status !== 'completed' && (
                          <span className="text-xs px-2 py-1 rounded bg-red-100 text-red-800 flex items-center gap-1">
                            <FaExclamationCircle /> Overdue
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 mt-1">{task.description}</p>
                      <div className="mt-2 flex flex-wrap gap-4 text-sm text-gray-500">
                        {task.assignedTo && (
                          <div>
                            <span className="font-medium">Assigned to:</span> {
                              agents.find(a => a.id === task.assignedTo)?.name || 'Unknown'
                            }
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="flex items-center gap-1">
                            <FaClock /> {new Date(task.dueDate).toLocaleString()}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {task.status !== 'completed' ? (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'completed')}
                          className="p-1 text-green-600 hover:bg-green-50 rounded transition-colors"
                          title="Mark as completed"
                        >
                          <FaCheck />
                        </button>
                      ) : (
                        <button
                          onClick={() => handleUpdateTaskStatus(task.id, 'pending')}
                          className="p-1 text-yellow-600 hover:bg-yellow-50 rounded transition-colors"
                          title="Mark as pending"
                        >
                          <FaClock />
                        </button>
                      )}
                      <button
                        onClick={() => handleDeleteTask(task.id)}
                        className="p-1 text-red-600 hover:bg-red-50 rounded transition-colors"
                        title="Delete task"
                      >
                        <FaTrash />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default Tasks;