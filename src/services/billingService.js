import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  where, 
  orderBy 
} from 'firebase/firestore';
import { db } from './firebase';

// Get user subscription
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
      const subscriptionData = subscriptionDoc.data();
      
      // Get plan details
      const planDoc = await getDoc(doc(db, 'pricing', subscriptionData.planId));
      const planData = planDoc.exists() ? planDoc.data() : null;
      
      return {
        success: true,
        subscription: {
          id: subscriptionDoc.id,
          ...subscriptionData,
          planName: planData?.name || 'Unknown Plan',
          price: planData?.price || 0,
          currency: planData?.currency || 'KSh',
          billingPeriod: planData?.billingPeriod || 'month',
          features: planData?.features || []
        }
      };
    }
    
    // Return trial subscription if no paid subscription found
    return {
      success: true,
      subscription: {
        id: 'trial',
        userId,
        planId: 'trial',
        planName: 'Free Trial',
        status: 'trial',
        price: 0,
        currency: 'KSh',
        billingPeriod: 'trial',
        startDate: new Date(),
        endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
        features: ['Basic features', 'Limited access']
      }
    };
  } catch (error) {
    console.error('Error getting user subscription:', error);
    return { success: false, error: error.message };
  }
};

// Get payment history
export const getPaymentHistory = async (userId) => {
  try {
    const q = query(
      collection(db, 'payments'),
      where('userId', '==', userId),
      orderBy('createdAt', 'desc')
    );
    
    const snapshot = await getDocs(q);
    const payments = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, payments };
  } catch (error) {
    console.error('Error getting payment history:', error);
    return { success: true, payments: [] }; // Return empty array instead of error
  }
};