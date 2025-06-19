import { 
  collection, 
  doc, 
  setDoc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  getDocs, 
  getDoc,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// ===== AGENT SERVICES =====

// Create a new agent
export const createAgent = async (agentData) => {
  try {
    const agentRef = doc(collection(db, 'agents'));
    await setDoc(agentRef, {
      ...agentData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    return { success: true, id: agentRef.id };
  } catch (error) {
    console.error('Error creating agent:', error);
    return { success: false, error };
  }
};

// Update an agent
export const updateAgent = async (agentId, agentData) => {
  try {
    const agentRef = doc(db, 'agents', agentId);
    await updateDoc(agentRef, {
      ...agentData,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating agent:', error);
    return { success: false, error };
  }
};

// Toggle agent status
export const toggleAgentStatus = async (agentId, currentStatus) => {
  try {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    const agentRef = doc(db, 'agents', agentId);
    await updateDoc(agentRef, {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return { success: true, newStatus };
  } catch (error) {
    console.error('Error toggling agent status:', error);
    return { success: false, error };
  }
};

// Delete an agent
export const deleteAgent = async (agentId) => {
  try {
    await deleteDoc(doc(db, 'agents', agentId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting agent:', error);
    return { success: false, error };
  }
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
    return { success: false, error };
  }
};

// ===== TASK SERVICES =====

// Create a new task
export const createTask = async (taskData) => {
  try {
    const taskRef = doc(collection(db, 'tasks'));
    await setDoc(taskRef, {
      ...taskData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // If task is assigned to an agent, update their current leads count
    if (taskData.assignedTo) {
      const agentRef = doc(db, 'agents', taskData.assignedTo);
      const agentDoc = await getDoc(agentRef);
      
      if (agentDoc.exists()) {
        const currentLeads = agentDoc.data().currentLeads || 0;
        await updateDoc(agentRef, {
          currentLeads: currentLeads + 1,
          updatedAt: serverTimestamp()
        });
      }
    }
    
    return { success: true, id: taskRef.id };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error };
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    // Get the current task data to check if assignment changed
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      const oldAssignedTo = taskDoc.data().assignedTo;
      const newAssignedTo = taskData.assignedTo;
      
      // Update the task
      await updateDoc(taskRef, {
        ...taskData,
        updatedAt: serverTimestamp()
      });
      
      // Handle agent assignment changes
      if (oldAssignedTo !== newAssignedTo) {
        // Decrement old agent's lead count if there was one
        if (oldAssignedTo) {
          const oldAgentRef = doc(db, 'agents', oldAssignedTo);
          const oldAgentDoc = await getDoc(oldAgentRef);
          
          if (oldAgentDoc.exists()) {
            const currentLeads = oldAgentDoc.data().currentLeads || 0;
            await updateDoc(oldAgentRef, {
              currentLeads: Math.max(0, currentLeads - 1),
              updatedAt: serverTimestamp()
            });
          }
        }
        
        // Increment new agent's lead count if there is one
        if (newAssignedTo) {
          const newAgentRef = doc(db, 'agents', newAssignedTo);
          const newAgentDoc = await getDoc(newAgentRef);
          
          if (newAgentDoc.exists()) {
            const currentLeads = newAgentDoc.data().currentLeads || 0;
            await updateDoc(newAgentRef, {
              currentLeads: currentLeads + 1,
              updatedAt: serverTimestamp()
            });
          }
        }
      }
      
      return { success: true };
    } else {
      return { success: false, error: 'Task not found' };
    }
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error };
  }
};

// Update task status
export const updateTaskStatus = async (taskId, newStatus) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      status: newStatus,
      updatedAt: serverTimestamp()
    });
    return { success: true };
  } catch (error) {
    console.error('Error updating task status:', error);
    return { success: false, error };
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    // Get the task to check if it's assigned
    const taskRef = doc(db, 'tasks', taskId);
    const taskDoc = await getDoc(taskRef);
    
    if (taskDoc.exists()) {
      const assignedTo = taskDoc.data().assignedTo;
      
      // Delete the task
      await deleteDoc(taskRef);
      
      // Update agent's lead count if task was assigned
      if (assignedTo) {
        const agentRef = doc(db, 'agents', assignedTo);
        const agentDoc = await getDoc(agentRef);
        
        if (agentDoc.exists()) {
          const currentLeads = agentDoc.data().currentLeads || 0;
          await updateDoc(agentRef, {
            currentLeads: Math.max(0, currentLeads - 1),
            updatedAt: serverTimestamp()
          });
        }
      }
      
      return { success: true };
    } else {
      return { success: false, error: 'Task not found' };
    }
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error };
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
    return { success: false, error };
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
    return { success: false, error };
  }
};