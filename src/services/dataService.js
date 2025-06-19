import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy,
  onSnapshot
} from 'firebase/firestore';
import { 
  ref, 
  onValue, 
  off 
} from 'firebase/database';
import { db, rtdb } from './firebase';
import { createDualDocument, updateDualDocument, deleteDualDocument } from './dualDatabaseService';

// ===== AGENT SERVICES =====

// Create a new agent
export const createAgent = async (agentData) => {
  return await createDualDocument('agents', null, agentData);
};

// Update an agent
export const updateAgent = async (agentId, agentData) => {
  return await updateDualDocument('agents', agentId, agentData);
};

// Toggle agent status
export const toggleAgentStatus = async (agentId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    return await updateDualDocument('agents', agentId, { status: newStatus });
  } catch (error) {
    console.error('Error toggling agent status:', error);
    return { success: false, error: error.message };
  }
};

// Delete an agent
export const deleteAgent = async (agentId) => {
  return await deleteDualDocument('agents', agentId);
};

// Get agent by ID
export const getAgentById = async (agentId) => {
  try {
    const agentDoc = await getDoc(doc(db, 'agents', agentId));
    if (agentDoc.exists()) {
      return { success: true, data: { id: agentDoc.id, ...agentDoc.data() } };
    } else {
      return { success: false, error: 'Agent not found' };
    }
  } catch (error) {
    console.error('Error getting agent:', error);
    return { success: false, error: error.message };
  }
};

// ===== TASK SERVICES =====

// Create a new task
export const createTask = async (taskData) => {
  try {
    const result = await createDualDocument('tasks', null, taskData);
    
    if (result.success && taskData.assignedTo) {
      // Update agent's current leads count
      const agentDoc = await getDoc(doc(db, 'agents', taskData.assignedTo));
      
      if (agentDoc.exists()) {
        const currentLeads = agentDoc.data().currentLeads || 0;
        await updateDualDocument('agents', taskData.assignedTo, {
          currentLeads: currentLeads + 1
        });
      }
    }
    
    return result;
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message };
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    // Get the current task data to check if assignment changed
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    
    if (taskDoc.exists()) {
      const oldAssignedTo = taskDoc.data().assignedTo;
      const newAssignedTo = taskData.assignedTo;
      
      // Update the task
      const result = await updateDualDocument('tasks', taskId, taskData);
      
      if (result.success && oldAssignedTo !== newAssignedTo) {
        // Handle agent assignment changes
        if (oldAssignedTo) {
          const oldAgentDoc = await getDoc(doc(db, 'agents', oldAssignedTo));
          if (oldAgentDoc.exists()) {
            const currentLeads = oldAgentDoc.data().currentLeads || 0;
            await updateDualDocument('agents', oldAssignedTo, {
              currentLeads: Math.max(0, currentLeads - 1)
            });
          }
        }
        
        if (newAssignedTo) {
          const newAgentDoc = await getDoc(doc(db, 'agents', newAssignedTo));
          if (newAgentDoc.exists()) {
            const currentLeads = newAgentDoc.data().currentLeads || 0;
            await updateDualDocument('agents', newAssignedTo, {
              currentLeads: currentLeads + 1
            });
          }
        }
      }
      
      return result;
    } else {
      return { success: false, error: 'Task not found' };
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message };
  }
};

// Update task status
export const updateTaskStatus = async (taskId, newStatus) => {
  return await updateDualDocument('tasks', taskId, { status: newStatus });
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    // Get the task to check if it's assigned
    const taskDoc = await getDoc(doc(db, 'tasks', taskId));
    
    if (taskDoc.exists()) {
      const assignedTo = taskDoc.data().assignedTo;
      
      // Delete the task
      const result = await deleteDualDocument('tasks', taskId);
      
      if (result.success && assignedTo) {
        // Update agent's lead count
        const agentDoc = await getDoc(doc(db, 'agents', assignedTo));
        
        if (agentDoc.exists()) {
          const currentLeads = agentDoc.data().currentLeads || 0;
          await updateDualDocument('agents', assignedTo, {
            currentLeads: Math.max(0, currentLeads - 1)
          });
        }
      }
      
      return result;
    } else {
      return { success: false, error: 'Task not found' };
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
};

// Get tasks by assignee
export const getTasksByAssignee = async (agentId) => {
  try {
    const q = query(collection(db, 'tasks'), where('assignedTo', '==', agentId));
    const snapshot = await getDocs(q);
    const tasks = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    return { success: true, data: tasks };
  } catch (error) {
    console.error('Error getting tasks by assignee:', error);
    return { success: false, error: error.message };
  }
};

// Get overdue tasks
export const getOverdueTasks = async () => {
  try {
    const now = new Date();
    const q = query(collection(db, 'tasks'), where('status', '!=', 'completed'));
    const snapshot = await getDocs(q);
    
    const overdueTasks = snapshot.docs
      .map(doc => ({ id: doc.id, ...doc.data() }))
      .filter(task => {
        if (!task.dueDate) return false;
        const dueDate = new Date(task.dueDate);
        return dueDate < now;
      });
    
    return { success: true, data: overdueTasks };
  } catch (error) {
    console.error('Error getting overdue tasks:', error);
    return { success: false, error: error.message };
  }
};

// ===== REAL-TIME LISTENERS =====

// Listen to real-time changes in Realtime Database
export const listenToRealtimeData = (path, callback) => {
  const dataRef = ref(rtdb, path);
  onValue(dataRef, callback);
  return () => off(dataRef, 'value', callback);
};

// Listen to Firestore changes
export const listenToFirestoreCollection = (collectionName, callback, queryConstraints = []) => {
  const q = queryConstraints.length > 0 
    ? query(collection(db, collectionName), ...queryConstraints)
    : collection(db, collectionName);
    
  return onSnapshot(q, callback);
};