import { collection, addDoc, query, where, orderBy, onSnapshot, updateDoc, doc } from 'firebase/firestore';
import { db } from './firebase';

// Create a new conversation
export const createConversation = async (contactData, platform = 'web') => {
  try {
    const conversationData = {
      contactName: contactData.name || contactData.email,
      contactEmail: contactData.email,
      contactPhone: contactData.phone || '',
      platform,
      status: 'active',
      lastMessage: '',
      lastUpdated: new Date(),
      unreadCount: 0,
      createdAt: new Date(),
      userId: contactData.userId
    };

    const docRef = await addDoc(collection(db, 'conversations'), conversationData);
    return { success: true, conversationId: docRef.id };
  } catch (error) {
    console.error('Error creating conversation:', error);
    return { success: false, error: error.message };
  }
};

// Send a message
export const sendMessage = async (conversationId, messageData) => {
  try {
    const message = {
      conversationId,
      content: messageData.content,
      sender: messageData.sender || 'user',
      timestamp: new Date(),
      type: messageData.type || 'text',
      platform: messageData.platform || 'web'
    };

    // Add message to messages collection
    await addDoc(collection(db, 'messages'), message);

    // Update conversation with last message
    await updateDoc(doc(db, 'conversations', conversationId), {
      lastMessage: messageData.content,
      lastUpdated: new Date()
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

// Get conversations for a user
export const getUserConversations = (userId, callback) => {
  const q = query(
    collection(db, 'conversations'),
    where('userId', '==', userId)
  );

  return onSnapshot(q, (snapshot) => {
    const conversations = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    })).sort((a, b) => {
      const aTime = a.lastUpdated?.toDate?.() || new Date(0);
      const bTime = b.lastUpdated?.toDate?.() || new Date(0);
      return bTime - aTime;
    });
    callback(conversations);
  });
};

// Get messages for a conversation
export const getConversationMessages = (conversationId, callback) => {
  const q = query(
    collection(db, 'messages'),
    where('conversationId', '==', conversationId),
    orderBy('timestamp', 'asc')
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    callback(messages);
  });
};

// Mark conversation as read
export const markAsRead = async (conversationId) => {
  try {
    await updateDoc(doc(db, 'conversations', conversationId), {
      unreadCount: 0
    });
    return { success: true };
  } catch (error) {
    console.error('Error marking as read:', error);
    return { success: false, error: error.message };
  }
};