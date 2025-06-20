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

// Create a new item
export const createItem = async (itemData, userId) => {
  try {
    console.log('Creating item:', itemData, 'for user:', userId);
    const docRef = await addDoc(collection(db, 'items'), {
      ...itemData,
      userId,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Item created with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating item:', error);
    return { success: false, error: error.message };
  }
};

// Get all items for a user
export const getItems = async (userId) => {
  try {
    console.log('Fetching items for user:', userId);
    const q = query(
      collection(db, 'items'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const items = [];
    querySnapshot.forEach((doc) => {
      items.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Fetched items:', items);
    return { success: true, items };
  } catch (error) {
    console.error('Error fetching items:', error);
    return { success: false, error: error.message, items: [] };
  }
};

// Update an item
export const updateItem = async (itemId, itemData) => {
  try {
    console.log('Updating item:', itemId, 'with data:', itemData);
    await updateDoc(doc(db, 'items', itemId), {
      ...itemData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Item updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating item:', error);
    return { success: false, error: error.message };
  }
};

// Delete an item
export const deleteItem = async (itemId) => {
  try {
    console.log('Deleting item:', itemId);
    await deleteDoc(doc(db, 'items', itemId));
    console.log('Item deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting item:', error);
    return { success: false, error: error.message };
  }
};