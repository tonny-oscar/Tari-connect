import { 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  getDocs, 
  getDoc,
  query, 
  orderBy, 
  where,
  serverTimestamp 
} from 'firebase/firestore';
import { db } from './firebase';

// Create a new item
export const createItem = async (itemData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error: error.message };
  }
};

// Get all items for a user
export const getItems = async (userId) => {
  try {
    const q = query(
      collection(db, 'items'), 
      where('userId', '==', userId),
      orderBy('name')
    );
    const querySnapshot = await getDocs(q);
    
    const items = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, items };
  } catch (error) {
    console.error('Error fetching items:', error);
    return { success: false, error: error.message };
  }
};

// Update an item
export const updateItem = async (itemId, itemData) => {
  try {
    await updateDoc(doc(db, 'items', itemId), {
      ...itemData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error: error.message };
  }
};

// Delete an item
export const deleteItem = async (itemId) => {
  try {
    await deleteDoc(doc(db, 'items', itemId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: error.message };
  }
};