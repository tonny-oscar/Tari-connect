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

// Create a new lead
export const createLead = async (leadData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      userId,
      status: leadData.status || 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }
};

// Get all leads for a user
export const getLeads = async (userId) => {
  try {
    const q = query(
      collection(db, 'leads'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, leads };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message };
  }
};

// Update a lead
export const updateLead = async (leadId, leadData) => {
  try {
    await updateDoc(doc(db, 'leads', leadId), {
      ...leadData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message };
  }
};

// Convert lead to quote
export const convertLeadToQuote = async (leadId, quoteData, userId) => {
  try {
    // Create quote
    const quoteDocRef = await addDoc(collection(db, 'quotes'), {
      ...quoteData,
      leadId,
      userId,
      status: 'draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update lead status
    await updateDoc(doc(db, 'leads', leadId), {
      status: 'quoted',
      quoteId: quoteDocRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, quoteId: quoteDocRef.id };
  } catch (error) {
    console.error('Error converting lead to quote:', error);
    return { success: false, error: error.message };
  }
};

// Delete a lead
export const deleteLead = async (leadId) => {
  try {
    await deleteDoc(doc(db, 'leads', leadId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, error: error.message };
  }
};