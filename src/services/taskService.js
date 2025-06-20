import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  query, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Create a new task
export const createTask = async (taskData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'tasks'), {
      ...taskData,
      userId,
      status: taskData.status || 'pending',
      priority: taskData.priority || 'medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating task:', error);
    return { success: false, error: error.message };
  }
};

// Get all tasks for a user
export const getTasks = async (userId) => {
  try {
    const q = query(
      collection(db, 'tasks'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const tasks = [];
    querySnapshot.forEach((doc) => {
      tasks.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    return { success: true, tasks };
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return { success: false, error: error.message };
  }
};

// Update a task
export const updateTask = async (taskId, taskData) => {
  try {
    await updateDoc(doc(db, 'tasks', taskId), {
      ...taskData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating task:', error);
    return { success: false, error: error.message };
  }
};

// Delete a task
export const deleteTask = async (taskId) => {
  try {
    await deleteDoc(doc(db, 'tasks', taskId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting task:', error);
    return { success: false, error: error.message };
  }
};