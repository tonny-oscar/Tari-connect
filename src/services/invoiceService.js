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

// Create a new invoice
export const createInvoice = async (invoiceData, userId) => {
  try {
    const docRef = await addDoc(collection(db, 'invoices'), {
      ...invoiceData,
      userId,
      status: invoiceData.status || 'pending',
      invoiceNumber: invoiceData.invoiceNumber || `INV-${Date.now()}`,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp()
    });
    
    return { success: true, id: docRef.id };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return { success: false, error: error.message };
  }
};

// Get all invoices for a user
export const getInvoices = async (userId) => {
  try {
    const q = query(
      collection(db, 'invoices'), 
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    const querySnapshot = await getDocs(q);
    
    const invoices = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, invoices };
  } catch (error) {
    console.error('Error fetching invoices:', error);
    return { success: false, error: error.message };
  }
};

// Update an invoice
export const updateInvoice = async (invoiceId, invoiceData) => {
  try {
    await updateDoc(doc(db, 'invoices', invoiceId), {
      ...invoiceData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating invoice:', error);
    return { success: false, error: error.message };
  }
};

// Mark invoice as paid
export const markInvoiceAsPaid = async (invoiceId, paymentData = {}) => {
  try {
    await updateDoc(doc(db, 'invoices', invoiceId), {
      status: 'paid',
      paidAt: serverTimestamp(),
      paymentMethod: paymentData.paymentMethod || '',
      paymentReference: paymentData.paymentReference || '',
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error marking invoice as paid:', error);
    return { success: false, error: error.message };
  }
};

// Delete an invoice
export const deleteInvoice = async (invoiceId) => {
  try {
    await deleteDoc(doc(db, 'invoices', invoiceId));
    return { success: true };
  } catch (error) {
    console.error('Error deleting invoice:', error);
    return { success: false, error: error.message };
  }
};