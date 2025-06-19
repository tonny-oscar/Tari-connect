import React, { useState, useEffect } from 'react';
import { collection, doc, setDoc, serverTimestamp, onSnapshot, query, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { createMessageNotification } from '../services/notificationService';
import { FaTimes } from 'react-icons/fa';

function TaskForm({ conversationId, contactName, onClose }) {
  const [agents, setAgents] = useState([]);
  const [newTask, setNewTask] = useState({
    title: `Follow up with ${contactName || 'contact'}`,
    description: `Related to conversation with ${contactName || 'contact'}`,
    assignedTo: '',
    dueDate: '',
    priority: 'medium',
    status: 'pending',
    relatedTo: {
      type: 'conversation',
      id: conversationId
    }
  });

  // Fetch agents for task assignment
  useEffect(() => {
    const q = query(collection(db, 'agents'), where('status', '==', 'active'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const agentList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAgents(agentList);
    });
    return () => unsubscribe();
  }, []);

  // Handle creating a task from conversation
  const handleCreateTask = async (e) => {
    e.preventDefault();
    
    const taskRef = doc(collection(db, 'tasks'));
    const taskData = {
      ...newTask,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    };
    
    await setDoc(taskRef, taskData);
    
    // Create notification for assigned agent
    if (newTask.assignedTo) {
      const assignedAgent = agents.find(a => a.id === newTask.assignedTo);
      if (assignedAgent) {
        await createMessageNotification(
          assignedAgent.id,
          'Task System',
          `You have been assigned a new task: ${newTask.title}`
        );
      }
    }
    
    // Reset form and close
    setNewTask({
      ...newTask,
      title: `Follow up with ${contactName || 'contact'}`,
      description: `Related to conversation with ${contactName || 'contact'}`,
      assignedTo: '',
      dueDate: '',
      priority: 'medium'
    });
    onClose();
  };

  return (
    <div className="border-b p-4 bg-blue-50">
      <div className="flex justify-between items-center mb-3">
        <h3 className="font-medium">Create Task from Conversation</h3>
        <button 
          onClick={onClose}
          className="text-gray-500 hover:text-gray-700"
        >
          <FaTimes />
        </button>
      </div>
      
      <form onSubmit={handleCreateTask}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={newTask.title}
              onChange={(e) => setNewTask({...newTask, title: e.target.value})}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
            <select
              value={newTask.assignedTo}
              onChange={(e) => setNewTask({...newTask, assignedTo: e.target.value})}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={newTask.priority}
              onChange={(e) => setNewTask({...newTask, priority: e.target.value})}
              className="w-full p-2 border rounded focus:ring-blue-500 focus:border-blue-500"
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
              rows="2"
            ></textarea>
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <button
            type="button"
            onClick={onClose}
            className="mr-2 px-4 py-1 border rounded hover:bg-gray-100 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Create Task
          </button>
        </div>
      </form>
    </div>
  );
}

export default TaskForm;