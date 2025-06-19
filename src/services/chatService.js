import { 
  collection, 
  addDoc, 
  doc, 
  updateDoc, 
  serverTimestamp as firestoreTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  push, 
  set, 
  serverTimestamp as rtdbTimestamp,
  onValue,
  off
} from 'firebase/database';
import { db, rtdb } from './firebase';
import { createDualDocument, updateDualDocument } from './dualDatabaseService';

// ===== CONVERSATION SERVICES =====

// Create a new conversation
export const createConversation = async (conversationData) => {
  return await createDualDocument('conversations', null, conversationData);
};

// Update conversation
export const updateConversation = async (conversationId, data) => {
  return await updateDualDocument('conversations', conversationId, data);
};

// ===== MESSAGE SERVICES =====

// Send a message (uses Realtime Database for real-time updates)
export const sendMessage = async (conversationId, messageData) => {
  try {
    // Add to Realtime Database for real-time updates
    const messagesRef = ref(rtdb, `messages/${conversationId}`);
    const newMessageRef = push(messagesRef, {
      ...messageData,
      timestamp: rtdbTimestamp()
    });
    
    // Also add to Firestore for querying and persistence
    await addDoc(collection(db, `conversations/${conversationId}/messages`), {
      ...messageData,
      rtdbId: newMessageRef.key,
      timestamp: firestoreTimestamp()
    });
    
    // Update conversation last message
    await updateConversation(conversationId, {
      lastMessage: messageData.text || 'Media',
      lastUpdated: firestoreTimestamp()
    });
    
    return { success: true, id: newMessageRef.key };
  } catch (error) {
    console.error('Error sending message:', error);
    return { success: false, error: error.message };
  }
};

// Listen to real-time messages
export const listenToMessages = (conversationId, callback) => {
  const messagesRef = ref(rtdb, `messages/${conversationId}`);
  
  const unsubscribe = onValue(messagesRef, (snapshot) => {
    const messages = [];
    snapshot.forEach((childSnapshot) => {
      messages.push({
        id: childSnapshot.key,
        ...childSnapshot.val()
      });
    });
    
    // Sort messages by timestamp
    messages.sort((a, b) => {
      const aTime = a.timestamp || 0;
      const bTime = b.timestamp || 0;
      return aTime - bTime;
    });
    
    callback(messages);
  });
  
  return () => off(messagesRef, 'value', unsubscribe);
};

// ===== TYPING INDICATORS =====

// Set typing status
export const setTypingStatus = async (conversationId, userId, isTyping) => {
  try {
    const typingRef = ref(rtdb, `typing/${conversationId}/${userId}`);
    
    if (isTyping) {
      await set(typingRef, {
        isTyping: true,
        timestamp: rtdbTimestamp()
      });
      
      // Auto-remove typing status after 3 seconds
      setTimeout(async () => {
        await set(typingRef, null);
      }, 3000);
    } else {
      await set(typingRef, null);
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting typing status:', error);
    return { success: false, error: error.message };
  }
};

// Listen to typing indicators
export const listenToTyping = (conversationId, callback) => {
  const typingRef = ref(rtdb, `typing/${conversationId}`);
  
  const unsubscribe = onValue(typingRef, (snapshot) => {
    const typingUsers = [];
    snapshot.forEach((childSnapshot) => {
      if (childSnapshot.val()?.isTyping) {
        typingUsers.push({
          userId: childSnapshot.key,
          ...childSnapshot.val()
        });
      }
    });
    
    callback(typingUsers);
  });
  
  return () => off(typingRef, 'value', unsubscribe);
};

// ===== PRESENCE SYSTEM =====

// Set user online status
export const setUserPresence = async (userId, isOnline) => {
  try {
    const presenceRef = ref(rtdb, `presence/${userId}`);
    
    if (isOnline) {
      await set(presenceRef, {
        isOnline: true,
        lastSeen: rtdbTimestamp()
      });
    } else {
      await set(presenceRef, {
        isOnline: false,
        lastSeen: rtdbTimestamp()
      });
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error setting user presence:', error);
    return { success: false, error: error.message };
  }
};

// Listen to user presence
export const listenToPresence = (callback) => {
  const presenceRef = ref(rtdb, 'presence');
  
  const unsubscribe = onValue(presenceRef, (snapshot) => {
    const presenceData = {};
    snapshot.forEach((childSnapshot) => {
      presenceData[childSnapshot.key] = childSnapshot.val();
    });
    
    callback(presenceData);
  });
  
  return () => off(presenceRef, 'value', unsubscribe);
};