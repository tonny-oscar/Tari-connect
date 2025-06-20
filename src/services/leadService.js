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

// Create a new lead
export const createLead = async (leadData, userId) => {
  try {
    console.log('Creating lead:', leadData, 'for user:', userId);
    const docRef = await addDoc(collection(db, 'leads'), {
      ...leadData,
      userId,
      status: leadData.status || 'new',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    console.log('Lead created with ID:', docRef.id);
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating lead:', error);
    return { success: false, error: error.message };
  }
};

// Get all leads for a user
export const getLeads = async (userId) => {
  try {
    console.log('Fetching leads for user:', userId);
    const q = query(
      collection(db, 'leads'), 
      where('userId', '==', userId)
    );
    const querySnapshot = await getDocs(q);
    
    const leads = [];
    querySnapshot.forEach((doc) => {
      leads.push({
        id: doc.id,
        ...doc.data()
      });
    });
    
    console.log('Fetched leads:', leads);
    return { success: true, leads };
  } catch (error) {
    console.error('Error fetching leads:', error);
    return { success: false, error: error.message, leads: [] };
  }
};

// Update a lead
export const updateLead = async (leadId, leadData) => {
  try {
    console.log('Updating lead:', leadId, 'with data:', leadData);
    await updateDoc(doc(db, 'leads', leadId), {
      ...leadData,
      updatedAt: serverTimestamp()
    });
    
    console.log('Lead updated successfully');
    return { success: true };
  } catch (error) {
    console.error('Error updating lead:', error);
    return { success: false, error: error.message };
  }
};

// Convert lead to quote
export const convertLeadToQuote = async (leadId, quoteData, userId) => {
  try {
    console.log('Converting lead to quote:', leadId);
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
    
    console.log('Lead converted to quote successfully');
    return { success: true, quoteId: quoteDocRef.id };
  } catch (error) {
    console.error('Error converting lead to quote:', error);
    return { success: false, error: error.message };
  }
};

// Delete a lead
export const deleteLead = async (leadId) => {
  try {
    console.log('Deleting lead:', leadId);
    await deleteDoc(doc(db, 'leads', leadId));
    console.log('Lead deleted successfully');
    return { success: true };
  } catch (error) {
    console.error('Error deleting lead:', error);
    return { success: false, error: error.message };
  }
};