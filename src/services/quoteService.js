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

// Create a new quote
export const createQuote = async (quoteData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'quotes'), {
      ...quoteData,
      userId,
      status: quoteData.status || 'draft',
      quoteNumber: quoteData.quoteNumber || `Q-${Date.now()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating quote:', error);
    return { success: false, error: error.message };
  }
};

// Get all quotes for a user
export const getQuotes = async (userId) => {
  try {
    const q = query(
      collection(db, 'quotes'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const quotes = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, quotes };
  } catch (error) {
    console.error('Error fetching quotes:', error);
    return { success: false, error: error.message };
  }
};

// Update a quote
export const updateQuote = async (quoteId, quoteData) => {
  try {
    await updateDoc(doc(db, 'quotes', quoteId), {
      ...quoteData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating quote:', error);
    return { success: false, error: error.message };
  }
};

// Convert quote to invoice
export const convertQuoteToInvoice = async (quoteId, invoiceData, userId) => {
  try {
    // Get quote data
    const quoteDoc = await getDoc(doc(db, 'quotes', quoteId));
    if (!quoteDoc.exists()) {
      throw new Error('Quote not found');
    }
    
    const quoteData = quoteDoc.data();
    
    // Create invoice
    const invoiceDocRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      quoteId,
      userId,
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      items: quoteData.items || [],
      subtotal: quoteData.subtotal || 0,
      tax: quoteData.tax || 0,
      total: quoteData.total || 0,
      status: 'pending',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    // Update quote status
    await updateDoc(doc(db, 'quotes', quoteId), {
      status: 'converted',
      invoiceId: invoiceDocRef.id,
      updatedAt: serverTimestamp()
    });
    
    return { success: true, invoiceId: invoiceDocRef.id };
  } catch (error) {
    console.error('Error converting quote to invoice:', error);
    return { success: false, error: error.message };
  }
};

// Delete a quote
export const deleteQuote = async (quoteId) => {
  try {
    await deleteDoc(doc(db, 'quotes', quoteId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting quote:', error);
    return { success: false, error: error.message };
  }
};