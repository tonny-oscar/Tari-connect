import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  addDoc, 
  updateDoc, 
  onSnapshot 
} from 'firebase/firestore';
import { db } from './firebase';

// Create or update subscription
export const createSubscription = async (userId, subscriptionData) => {
  try {
    const subscription = {
      userId,
      planId: subscriptionData.planId,
      status: subscriptionData.status || 'active',
      startDate: new Date(),
      endDate: subscriptionData.endDate || null,
      paystackCustomerCode: subscriptionData.paystackCustomerCode || null,
      paystackSubscriptionCode: subscriptionData.paystackSubscriptionCode || null,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'subscriptions'), subscription);
    return { success: true, subscriptionId: docRef.id };
  } catch (error) {
    console.error('Error creating subscription:', error);
    return { success: false, error: error.message };
  }
};

// Get user's active subscription
export const getUserSubscription = async (userId) => {
  try {
    const q = query(
      collection(db, 'subscriptions'),
      where('userId', '==', userId),
      where('status', '==', 'active')
    );
    
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      const subscriptionDoc = snapshot.docs[0];
      return {
        success: true,
        subscription: {
          id: subscriptionDoc.id,
          ...subscriptionDoc.data()
        }
      };
    }
    
    return { success: false, error: 'No active subscription found' };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { success: false, error: error.message };
  }
};

// Get subscription with plan details
export const getSubscriptionWithPlan = async (userId) => {
  try {
    const subscriptionResult = await getUserSubscription(userId);
    
    if (!subscriptionResult.success) {
      return subscriptionResult;
    }
    
    const subscription = subscriptionResult.subscription;
    
    // Get plan details
    const planDoc = await getDoc(doc(db, 'pricing', subscription.planId));
    
    if (planDoc.exists()) {
      return {
        success: true,
        subscription: {
          ...subscription,
          plan: {
            id: planDoc.id,
            ...planDoc.data()
          }
        }
      };
    }
    
    return { success: false, error: 'Plan not found' };
  } catch (error) {
    console.error('Error getting subscription with plan:', error);
    return { success: false, error: error.message };
  }
};

// Check if user can add more team members
export const canAddUser = async (userId) => {
  try {
    const result = await getSubscriptionWithPlan(userId);
    
    if (!result.success) {
      return { success: false, error: 'No active subscription' };
    }
    
    const { subscription } = result;
    const userLimit = subscription.plan.userLimit;
    
    // If unlimited users (-1)
    if (userLimit === -1) {
      return { success: true, canAdd: true, remaining: -1 };
    }
    
    // Count current team members
    const teamQuery = query(
      collection(db, 'teamMembers'),
      where('organizationId', '==', userId)
    );
    
    const teamSnapshot = await getDocs(teamQuery);
    const currentUserCount = teamSnapshot.size + 1; // +1 for the owner
    
    const canAdd = currentUserCount < userLimit;
    const remaining = userLimit - currentUserCount;
    
    return {
      success: true,
      canAdd,
      remaining: Math.max(0, remaining),
      current: currentUserCount,
      limit: userLimit
    };
  } catch (error) {
    console.error('Error checking user limit:', error);
    return { success: false, error: error.message };
  }
};

// Update subscription status
export const updateSubscriptionStatus = async (subscriptionId, status) => {
  try {
    await updateDoc(doc(db, 'subscriptions', subscriptionId), {
      status,
      updatedAt: new Date()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating subscription status:', error);
    return { success: false, error: error.message };
  }
};

// Listen to subscription changes
export const subscribeToUserSubscription = (userId, callback) => {
  const q = query(
    collection(db, 'subscriptions'),
    where('userId', '==', userId),
    where('status', '==', 'active')
  );
  
  return onSnapshot(q, (snapshot) => {
    if (!snapshot.empty) {
      const subscriptionDoc = snapshot.docs[0];
      callback({
        success: true,
        subscription: {
          id: subscriptionDoc.id,
          ...subscriptionDoc.data()
        }
      });
    } else {
      callback({ success: false, error: 'No active subscription' });
    }
  });
};