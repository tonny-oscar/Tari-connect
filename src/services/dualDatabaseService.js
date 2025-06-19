import { 
  collection, 
  doc, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  serverTimestamp as firestoreTimestamp 
} from 'firebase/firestore';
import { 
  ref, 
  set, 
  update, 
  remove, 
  serverTimestamp as rtdbTimestamp,
  push
} from 'firebase/database';
import { db, rtdb } from './firebase';

// Dual database operations - writes to both Firestore and Realtime Database

// Create document in both databases
export const createDualDocument = async (collectionName, docId, data) => {
  try {
    const timestamp = Date.now();
    
    // Prepare data for Firestore
    const firestoreData = {
      ...data,
      createdAt: firestoreTimestamp(),
      updatedAt: firestoreTimestamp()
    };
    
    // Prepare data for Realtime Database
    const rtdbData = {
      ...data,
      createdAt: rtdbTimestamp(),
      updatedAt: rtdbTimestamp()
    };
    
    // Write to Firestore
    if (docId) {
      await setDoc(doc(db, collectionName, docId), firestoreData);
    } else {
      const docRef = doc(collection(db, collectionName));
      await setDoc(docRef, firestoreData);
      docId = docRef.id;
    }
    
    // Write to Realtime Database
    await set(ref(rtdb, `${collectionName}/${docId}`), rtdbData);
    
    return { success: true, id: docId };
  } catch (error) {
    console.error('Error creating dual document:', error);
    return { success: false, error: error.message };
  }
};

// Update document in both databases
export const updateDualDocument = async (collectionName, docId, data) => {
  try {
    // Prepare data for Firestore
    const firestoreData = {
      ...data,
      updatedAt: firestoreTimestamp()
    };
    
    // Prepare data for Realtime Database
    const rtdbData = {
      ...data,
      updatedAt: rtdbTimestamp()
    };
    
    // Update in Firestore
    await updateDoc(doc(db, collectionName, docId), firestoreData);
    
    // Update in Realtime Database
    await update(ref(rtdb, `${collectionName}/${docId}`), rtdbData);
    
    return { success: true };
  } catch (error) {
    console.error('Error updating dual document:', error);
    return { success: false, error: error.message };
  }
};

// Delete document from both databases
export const deleteDualDocument = async (collectionName, docId) => {
  try {
    // Delete from Firestore
    await deleteDoc(doc(db, collectionName, docId));
    
    // Delete from Realtime Database
    await remove(ref(rtdb, `${collectionName}/${docId}`));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting dual document:', error);
    return { success: false, error: error.message };
  }
};

// Push to Realtime Database (for real-time features like chat)
export const pushToRealtime = async (path, data) => {
  try {
    const rtdbData = {
      ...data,
      timestamp: rtdbTimestamp()
    };
    
    const newRef = push(ref(rtdb, path), rtdbData);
    return { success: true, id: newRef.key };
  } catch (error) {
    console.error('Error pushing to realtime database:', error);
    return { success: false, error: error.message };
  }
};

// Set data in Realtime Database
export const setRealtimeData = async (path, data) => {
  try {
    const rtdbData = {
      ...data,
      timestamp: rtdbTimestamp()
    };
    
    await set(ref(rtdb, path), rtdbData);
    return { success: true };
  } catch (error) {
    console.error('Error setting realtime data:', error);
    return { success: false, error: error.message };
  }
};