import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  query, 
  orderBy
} from 'firebase/firestore';
import { db } from './firebase';
import { createDualDocument, updateDualDocument } from './dualDatabaseService';
import { PAYSTACK_CONFIG } from '../config/paystack';

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
    order: 1,
    paystackPlanId: PAYSTACK_CONFIG.plans.starter
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
    order: 2,
    paystackPlanId: PAYSTACK_CONFIG.plans.professional
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
    order: 3,
    paystackPlanId: PAYSTACK_CONFIG.plans.enterprise
  }
];

// Initialize pricing plans if they don't exist
export const initializePricingPlans = async () => {
  try {
    const plansRef = collection(db, 'pricing');
    const snapshot = await getDocs(plansRef);
    
    if (snapshot.empty) {
      // Create default plans in both databases
      for (const plan of defaultPlans) {
        await createDualDocument('pricing', plan.id, plan);
      }
      return { success: true };
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error initializing pricing plans:', error);
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
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
    return { success: false, error: error.message };
  }
};

// Update a pricing plan
export const updatePricingPlan = async (planId, planData) => {
  return await updateDualDocument('pricing', planId, planData);
};

// Format price with currency
export const formatPrice = (price, currency = 'KSh') => {
  if (currency === 'USD' || currency === '$') {
    return `$${price.toLocaleString()}`;
  }
  return `KSh ${price.toLocaleString()}`;
};

// Get Paystack public key
export const getPaystackPublicKey = () => {
  return PAYSTACK_CONFIG.publicKey;
};

// Convert between currencies (approximate rates)
export const convertCurrency = (amount, fromCurrency, toCurrency) => {
  const rates = {
    'KSh': 1,
    'USD': 0.0067, // 1 KSh = 0.0067 USD (approximate)
    '$': 0.0067
  };
  
  if (fromCurrency === toCurrency) return amount;
  
  // Convert to base (KSh) then to target currency
  const baseAmount = amount / rates[fromCurrency];
  return Math.round(baseAmount * rates[toCurrency]);
};

// Get pricing plans with currency conversion
export const getPricingPlansWithCurrency = async (targetCurrency = 'KSh') => {
  try {
    const { success, plans, error } = await getPricingPlans();
    
    if (!success) return { success, error };
    
    const convertedPlans = plans.map(plan => ({
      ...plan,
      price: convertCurrency(plan.price, plan.currency || 'KSh', targetCurrency),
      currency: targetCurrency,
      originalPrice: plan.price,
      originalCurrency: plan.currency || 'KSh'
    }));
    
    return { success: true, plans: convertedPlans };
  } catch (error) {
    console.error('Error getting pricing plans with currency:', error);
    return { success: false, error: error.message };
  }
};