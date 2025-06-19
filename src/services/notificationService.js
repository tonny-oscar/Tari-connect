import { 
  collection, 
  addDoc, 
  serverTimestamp, 
  query, 
  where, 
  getDocs, 
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from './firebase';

// Create a new notification
export const createNotification = async (userId, title, message, type = 'system') => {
  try {
    await addDoc(collection(db, 'notifications'), {
      userId,
      title,
      message,
      type, // 'message', 'task', 'system'
      read: false,
      browserNotified: false,
      createdAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error creating notification:', error);
    return false;
  }
};

// Mark notification as read
export const markNotificationAsRead = async (notificationId) => {
  try {
    await updateDoc(doc(db, 'notifications', notificationId), {
      read: true,
      readAt: serverTimestamp()
    });
    return true;
  } catch (error) {
    console.error('Error marking notification as read:', error);
    return false;
  }
};

// Mark all notifications as read for a user
export const markAllNotificationsAsRead = async (userId) => {
  try {
    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', userId),
      where('read', '==', false)
    );
    
    const snapshot = await getDocs(q);
    
    const updatePromises = snapshot.docs.map(doc => 
      updateDoc(doc.ref, {
        read: true,
        readAt: serverTimestamp()
      })
    );
    
    await Promise.all(updatePromises);
    return true;
  } catch (error) {
    console.error('Error marking all notifications as read:', error);
    return false;
  }
};

// Create a message notification
export const createMessageNotification = async (userId, senderName, messagePreview) => {
  return createNotification(
    userId,
    `New message from ${senderName}`,
    messagePreview,
    'message'
  );
};

// Create a task notification
export const createTaskNotification = async (userId, taskTitle, isDue = false) => {
  const title = isDue ? `Task Due Soon: ${taskTitle}` : `New Task: ${taskTitle}`;
  const message = isDue 
    ? `The task "${taskTitle}" is due soon. Please complete it.`
    : `You have been assigned a new task: "${taskTitle}"`;
  
  return createNotification(
    userId,
    title,
    message,
    'task'
  );
};

// Check for overdue tasks and send notifications
export const checkOverdueTasks = async () => {
  try {
    const now = new Date();
    const q = query(
      collection(db, 'tasks'),
      where('status', '!=', 'completed')
    );
    
    const snapshot = await getDocs(q);
    
    for (const taskDoc of snapshot.docs) {
      const task = taskDoc.data();
      
      if (!task.dueDate || !task.assignedTo) continue;
      
      const dueDate = new Date(task.dueDate);
      const timeDiff = dueDate.getTime() - now.getTime();
      const hoursDiff = timeDiff / (1000 * 3600);
      
      // Task is due within 24 hours and hasn't been notified yet
      if (hoursDiff > 0 && hoursDiff <= 24 && !task.reminderSent) {
        await createTaskNotification(task.assignedTo, task.title, true);
        
        // Mark as reminder sent
        await updateDoc(doc(db, 'tasks', taskDoc.id), {
          reminderSent: true
        });
      }
    }
    
    return true;
  } catch (error) {
    console.error('Error checking overdue tasks:', error);
    return false;
  }
};