import { create } from 'zustand';
import { getUserSubscription, subscribeToUserSubscription } from '../services/subscriptionService';

export const useSubscription = create((set, get) => ({
  subscription: null,
  isLoading: true,
  unsubscribe: null,

  // Load subscription
  loadSubscription: async (userId) => {
    set({ isLoading: true });
    const { success, subscription } = await getUserSubscription(userId);
    
    if (success) {
      set({ subscription, isLoading: false });
    } else {
      set({ subscription: { isActive: false, hasAccess: false }, isLoading: false });
    }
  },

  // Subscribe to real-time updates
  subscribeToUpdates: (userId) => {
    const unsubscribe = subscribeToUserSubscription(userId, (subscription) => {
      set({ subscription, isLoading: false });
    });
    
    set({ unsubscribe });
    return unsubscribe;
  },

  // Cleanup subscription
  cleanup: () => {
    const { unsubscribe } = get();
    if (unsubscribe) {
      unsubscribe();
      set({ unsubscribe: null });
    }
  },

  // Check if user has access
  hasAccess: () => {
    const { subscription } = get();
    return subscription?.hasAccess || false;
  },

  // Check if subscription is active
  isActive: () => {
    const { subscription } = get();
    return subscription?.isActive || false;
  }
}));