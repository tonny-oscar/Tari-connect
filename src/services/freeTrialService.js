import { doc, setDoc, getDoc, deleteDoc, collection, query, where, getDocs, writeBatch } from 'firebase/firestore';
import { deleteUser } from 'firebase/auth';
import { db } from './firebase';

// Start 14-day free trial
export const startFreeTrial = async (userId) => {
  try {
    const trialData = {
      userId,
      startDate: new Date().toISOString(),
      endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(), // 14 days
      status: 'active',
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'trials', userId), trialData);
    return { success: true, trial: trialData };
  } catch (error) {
    console.error('Error starting free trial:', error);
    return { success: false, error: error.message };
  }
};

// Check trial status
export const getTrialStatus = async (userId) => {
  try {
    const trialDoc = await getDoc(doc(db, 'trials', userId));
    
    if (!trialDoc.exists()) {
      return { success: true, hasActiveTrial: false };
    }

    const trial = trialDoc.data();
    const now = new Date();
    const endDate = new Date(trial.endDate);
    
    const isExpired = now > endDate;
    const daysRemaining = Math.max(0, Math.ceil((endDate - now) / (1000 * 60 * 60 * 24)));

    return {
      success: true,
      hasActiveTrial: !isExpired,
      trial: {
        ...trial,
        isExpired,
        daysRemaining
      }
    };
  } catch (error) {
    console.error('Error getting trial status:', error);
    return { success: false, error: error.message };
  }
};

// Delete user data after trial expires (exclude admin users)
export const deleteExpiredUserData = async (userId) => {
  try {
    // Check if user is admin before deletion
    const userDoc = await getDoc(doc(db, 'users', userId));
    if (userDoc.exists() && userDoc.data().role === 'admin') {
      console.log(`Skipping deletion for admin user: ${userId}`);
      return { success: true, skipped: true };
    }

    const batch = writeBatch(db);
    
    // Collections to delete user data from
    const collections = [
      'users', 'settings', 'trials', 'leads', 'quotes', 'invoices', 
      'items', 'tasks', 'conversations', 'messages', 'contacts',
      'notifications', 'invitations'
    ];

    // Delete from each collection
    for (const collectionName of collections) {
      if (collectionName === 'users' || collectionName === 'settings' || collectionName === 'trials') {
        // Direct document deletion
        batch.delete(doc(db, collectionName, userId));
      } else {
        // Query and delete documents where userId matches
        const q = query(collection(db, collectionName), where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        
        querySnapshot.forEach((document) => {
          batch.delete(document.ref);
        });
      }
    }

    await batch.commit();
    return { success: true };
  } catch (error) {
    console.error('Error deleting user data:', error);
    return { success: false, error: error.message };
  }
};

// Check and cleanup expired trials (run periodically)
export const cleanupExpiredTrials = async () => {
  try {
    const trialsRef = collection(db, 'trials');
    const q = query(trialsRef, where('status', '==', 'active'));
    const querySnapshot = await getDocs(q);
    
    const now = new Date();
    const expiredUsers = [];

    querySnapshot.forEach((doc) => {
      const trial = doc.data();
      const endDate = new Date(trial.endDate);
      
      if (now > endDate) {
        expiredUsers.push(trial.userId);
      }
    });

    // Delete expired users' data
    for (const userId of expiredUsers) {
      const result = await deleteExpiredUserData(userId);
      if (result.skipped) {
        console.log(`Skipped deletion for admin user: ${userId}`);
      } else {
        console.log(`Deleted expired trial data for user: ${userId}`);
      }
    }

    return { success: true, deletedUsers: expiredUsers.length };
  } catch (error) {
    console.error('Error cleaning up expired trials:', error);
    return { success: false, error: error.message };
  }
};

// Extend trial (admin function)
export const extendTrial = async (userId, additionalDays = 7) => {
  try {
    const trialDoc = await getDoc(doc(db, 'trials', userId));
    
    if (!trialDoc.exists()) {
      return { success: false, error: 'Trial not found' };
    }

    const trial = trialDoc.data();
    const currentEndDate = new Date(trial.endDate);
    const newEndDate = new Date(currentEndDate.getTime() + additionalDays * 24 * 60 * 60 * 1000);

    await setDoc(doc(db, 'trials', userId), {
      ...trial,
      endDate: newEndDate.toISOString(),
      extendedAt: new Date().toISOString(),
      extendedDays: (trial.extendedDays || 0) + additionalDays
    });

    return { success: true, newEndDate: newEndDate.toISOString() };
  } catch (error) {
    console.error('Error extending trial:', error);
    return { success: false, error: error.message };
  }
};