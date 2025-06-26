import { doc, setDoc, getDoc, updateDoc, serverTimestamp, deleteDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from './firebase';

// Create a new trial for a user
export const startFreeTrial = async (userId) => {
  try {
    // Set trial period to 14 days
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14);
    
    // Create trial document in Firestore
    await setDoc(doc(db, 'trials', userId), {
      userId,
      startDate: serverTimestamp(),
      endDate: trialEndDate,
      isActive: true,
      createdAt: serverTimestamp()
    });
    
    // Update user document with trial status
    await updateDoc(doc(db, 'users', userId), {
      hasTrial: true,
      trialEndDate
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error starting free trial:', error);
    return { success: false, error: error.message };
  }
};

// Check if user has an active trial
export const checkTrialStatus = async (userId) => {
  try {
    const trialDoc = await getDoc(doc(db, 'trials', userId));
    
    if (trialDoc.exists()) {
      const trialData = trialDoc.data();
      const now = new Date();
      const endDate = trialData.endDate?.toDate ? trialData.endDate.toDate() : new Date(trialData.endDate);
      
      // Check if trial is still active
      const isActive = endDate && now < endDate && trialData.isActive;
      
      // Calculate days remaining
      const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));
      
      // If trial has expired, delete user data
      if (!isActive && daysRemaining === 0) {
        await deleteUserData(userId);
      }
      
      return { 
        success: true, 
        isActive,
        daysRemaining,
        trialData
      };
    }
    
    return { success: true, isActive: false };
  } catch (error) {
    console.error('Error checking trial status:', error);
    return { success: false, error: error.message };
  }
};

// End a user's trial
export const endTrial = async (userId) => {
  try {
    await updateDoc(doc(db, 'trials', userId), {
      isActive: false,
      endedAt: serverTimestamp()
    });
    
    await updateDoc(doc(db, 'users', userId), {
      hasTrial: false
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error ending trial:', error);
    return { success: false, error: error.message };
  }
};

// Delete all user data when trial expires
export const deleteUserData = async (userId) => {
  try {
    // Delete user's conversations
    const conversationsQuery = query(collection(db, 'conversations'), where('userId', '==', userId));
    const conversationsSnapshot = await getDocs(conversationsQuery);
    for (const doc of conversationsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete user's messages
    const messagesQuery = query(collection(db, 'messages'), where('userId', '==', userId));
    const messagesSnapshot = await getDocs(messagesQuery);
    for (const doc of messagesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete user's tasks
    const tasksQuery = query(collection(db, 'tasks'), where('userId', '==', userId));
    const tasksSnapshot = await getDocs(tasksQuery);
    for (const doc of tasksSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete user's leads
    const leadsQuery = query(collection(db, 'leads'), where('userId', '==', userId));
    const leadsSnapshot = await getDocs(leadsQuery);
    for (const doc of leadsSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete user's quotes
    const quotesQuery = query(collection(db, 'quotes'), where('userId', '==', userId));
    const quotesSnapshot = await getDocs(quotesQuery);
    for (const doc of quotesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete user's invoices
    const invoicesQuery = query(collection(db, 'invoices'), where('userId', '==', userId));
    const invoicesSnapshot = await getDocs(invoicesQuery);
    for (const doc of invoicesSnapshot.docs) {
      await deleteDoc(doc.ref);
    }
    
    // Delete trial record
    await deleteDoc(doc(db, 'trials', userId));
    
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return { success: false, error: error.message };
  }
};