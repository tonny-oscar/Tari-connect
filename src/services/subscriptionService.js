import { doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from './firebase';

// Get user subscription status
export const getUserSubscription = async (userId) => {
  try {
    const subscriptionDoc = await getDoc(doc(db, 'subscriptions', userId));
    
    if (subscriptionDoc.exists()) {
      const data = subscriptionDoc.data();
      return {
        success: true,
        subscription: {
          ...data,
          isActive: data.status === 'active',
          hasAccess: data.status === 'active'
        }
      };
    }
    
    return {
      success: true,
      subscription: {
        isActive: false,
        hasAccess: false,
        status: 'inactive'
      }
    };
  } catch (error) {
    return { success: false, error: error.message };
  }
};

// Listen to subscription changes
export const subscribeToUserSubscription = (userId, callback) => {
  return onSnapshot(doc(db, 'subscriptions', userId), (doc) => {
    if (doc.exists()) {
      const data = doc.data();
      callback({
        ...data,
        isActive: data.status === 'active',
        hasAccess: data.status === 'active'
      });
    } else {
      callback({
        isActive: false,
        hasAccess: false,
        status: 'inactive'
      });
    }
  });
};