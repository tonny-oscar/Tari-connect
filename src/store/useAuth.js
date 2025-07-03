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

// Initialize auth state
export const initAuth = () => {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      // Get user data from Firestore
      const { success, userData } = await getCurrentUserData(user.uid);
      
      // Check trial status
      const trialResult = await getTrialStatus(user.uid);
      const trialStatus = trialResult.success && trialResult.trial ? trialResult.trial : { isExpired: false, daysRemaining: 14 };
      
      // Don't apply trial restrictions to admin users
      const isAdmin = userData?.role === 'admin';
      
      // Don't block access during trial - just track status for cleanup
      
      // Update auth store
      useAuth.setState({ 
        user, 
        userData: success ? userData : null,
        isLoading: false,
        trialActive: true, // Always active during trial period
        trialDaysRemaining: isAdmin ? 999 : (trialStatus?.daysRemaining || 0),
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
  }
}));