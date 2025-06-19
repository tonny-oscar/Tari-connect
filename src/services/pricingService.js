import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  serverTimestamp,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';

// Default pricing plans
const defaultPlans = [
  {
    id: 'starter',
    name: 'Starter',
    price: 2900,
    currency: 'KSh',
    billingPeriod: 'month',
    description: 'Perfect for small businesses just getting started',
    features: [
      '2 social channels',
      '1 team member',
      'Basic analytics',
      'Email support'
    ],
    isPopular: false,
    order: 1
  },
  {
    id: 'professional',
    name: 'Professional',
    price: 7900,
    currency: 'KSh',
    billingPeriod: 'month',
    description: 'Most popular for growing businesses',
    features: [
      'Unlimited social channels',
      '5 team members',
      'Advanced analytics',
      'Priority support',
      'AI-powered responses'
    ],
    isPopular: true,
    order: 2
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 19900,
    currency: 'KSh',
    billingPeriod: 'month',
    description: 'For large teams with advanced needs',
    features: [
      'Unlimited everything',
      'Unlimited team members',
      'Custom analytics',
      '24/7 dedicated support',
      'Custom integrations'
    ],
    isPopular: false,
    order: 3
  }
];

// Initialize pricing plans if they don't exist
export const initializePricingPlans = async () => {
  try {
    const plansRef = collection(db, 'pricing');
    const snapshot = await getDocs(plansRef);
    
    if (snapshot.empty) {
      // Create default plans
      for (const plan of defaultPlans) {
        await setDoc(doc(db, 'pricing', plan.id), {
          ...plan,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp()
        });
      }
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing pricing plans:', error);
    return { success: false, error };
  }
};

// Get all pricing plans
export const getPricingPlans = async () => {
  try {
    const q = query(collection(db, 'pricing'), orderBy('order'));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      await initializePricingPlans();
      return { success: true, plans: defaultPlans };
    }
    
    const plans = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return { success: true, plans };
  } catch (error) {
    console.error('Error getting pricing plans:', error);
    return { success: false, error };
  }
};

// Get a specific pricing plan
export const getPricingPlan = async (planId) => {
  try {
    const planDoc = await getDoc(doc(db, 'pricing', planId));
    
    if (planDoc.exists()) {
      return { success: true, plan: { id: planDoc.id, ...planDoc.data() } };
    } else {
      return { success: false, error: 'Plan not found' };
    }
  } catch (error) {
    console.error('Error getting pricing plan:', error);
    return { success: false, error };
  }
};

// Update a pricing plan
export const updatePricingPlan = async (planId, planData) => {
  try {
    await updateDoc(doc(db, 'pricing', planId), {
      ...planData,
      updatedAt: serverTimestamp()
    });
    
    return { success: true };
  } catch (error) {
    console.error('Error updating pricing plan:', error);
    return { success: false, error };
  }
};

// Format price with currency
export const formatPrice = (price, currency = 'KSh') => {
  return `${currency} ${price.toLocaleString()}`;
};