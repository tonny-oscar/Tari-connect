import { create } from 'zustand';
import { 
  onAuthStateChanged, 
  signOut as firebaseSignOut 
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../services/firebase';
import { 
  loginUser, 
  registerUser, 
  resetPassword as resetPasswordService,
  getCurrentUserData
} from '../services/authService';
import { getTrialStatus } from '../services/freeTrialService';
import { getSubscriptionWithPlan } from '../services/subscriptionService';

// Initialize auth state
export const initAuth = () => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user data from Firestore
      const { success, userData } = await getCurrentUserData(user.uid);
      
      // Check subscription status first
      const subscriptionResult = await getSubscriptionWithPlan(user.uid);
      let userSubscription = null;
      
      if (subscriptionResult.success) {
        userSubscription = subscriptionResult.subscription;
      } else {
        // Check trial status if no subscription
        const trialResult = await getTrialStatus(user.uid);
        const trialStatus = trialResult.success && trialResult.trial ? trialResult.trial : { isExpired: false, daysRemaining: 14 };
        userSubscription = {
          planId: 'trial',
          plan: { userLimit: 1, name: 'Free Trial' },
          status: trialStatus.isExpired ? 'expired' : 'trial'
        };
      }
      
      // Don't apply restrictions to admin users
      const isAdmin = userData?.role === 'admin';
      
      // Update auth store
      useAuth.setState({ 
        user, 
        userData: success ? userData : null,
        subscription: userSubscription,
        isLoading: false,
        trialActive: true, // Always active during trial period
        trialDaysRemaining: isAdmin ? 999 : (userSubscription?.plan?.userLimit || 0),
        trialExpired: false
      });
    } else {
      useAuth.setState({ 
        user: null, 
        userData: null, 
        isLoading: false,
        trialActive: false,
        trialDaysRemaining: 0,
        trialExpired: false
      });
    }
  });
};

// Auth store
export const useAuth = create((set, get) => ({
  user: null,
  userData: null,
  subscription: null,
  isLoading: true,
  trialActive: false,
  trialDaysRemaining: 0,
  trialExpired: false,
  
  // Check if user is authenticated
  isAuthenticated: () => {
    return !!get().user;
  },
  
  // Check if user is admin
  isAdmin: () => {
    const { userData } = get();
    return userData?.role === 'admin';
  },
  
  // Login
  login: async (email, password) => {
    const result = await loginUser(email, password);
    return result;
  },
  
  // Register
  register: async (email, password, name) => {
    const result = await registerUser(email, password, name);
    return result;
  },
  
  // Logout
  logout: async () => {
    try {
      await firebaseSignOut(auth);
      set({ user: null, userData: null });
      window.location.href = '/';
      return { success: true };
    } catch (error) {
      console.error('Error logging out:', error);
      return { success: false, error: error.message };
    }
  },
  
  // Reset password
  resetPassword: async (email) => {
    const result = await resetPasswordService(email);
    return result;
  },
  
  // Check if user has active trial
  hasActiveTrial: () => {
    return get().trialActive;
  },
  
  // Get trial days remaining
  getTrialDaysRemaining: () => {
    return get().trialDaysRemaining;
  },
  
  // Check if trial has expired
  hasTrialExpired: () => {
    return get().trialExpired;
  },
  
  // Reset trial expired flag
  resetTrialExpiredFlag: () => {
    set({ trialExpired: false });
  },
  
  // Get user subscription
  getUserSubscription: () => {
    return get().subscription;
  },
  
  // Check if user can add more team members
  canAddTeamMember: () => {
    const { subscription, userData } = get();
    
    // Admin can always add users
    if (userData?.role === 'admin') {
      return { canAdd: true, remaining: -1 };
    }
    
    if (!subscription || !subscription.plan) {
      return { canAdd: false, remaining: 0, error: 'No active subscription' };
    }
    
    const userLimit = subscription.plan.userLimit;
    
    // Unlimited users
    if (userLimit === -1) {
      return { canAdd: true, remaining: -1 };
    }
    
    // For now, assume current user count is 1 (will be updated with real team data)
    const currentUsers = 1;
    const canAdd = currentUsers < userLimit;
    const remaining = Math.max(0, userLimit - currentUsers);
    
    return { canAdd, remaining, current: currentUsers, limit: userLimit };
  }
}));