import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  loginUser, 
  logoutUser, 
  registerUser, 
  resetPassword, 
  getCurrentUserData,
  observeAuthState
} from '../services/authService';

export const useAuth = create(
  persist(
    (set, get) => ({
      user: null,
      userData: null,
      isLoading: true,
      error: null,
      
      // Initialize auth state
      init: () => {
        const unsubscribe = observeAuthState(async (user) => {
          set({ isLoading: true });
          
          if (user) {
            // Get additional user data from Firestore
            const { success, userData, error } = await getCurrentUserData(user.uid);
            
            if (success) {
              set({ 
                user, 
                userData,
                isLoading: false,
                error: null
              });
            } else {
              set({ 
                user, 
                userData: null,
                isLoading: false,
                error
              });
            }
          } else {
            set({ 
              user: null, 
              userData: null,
              isLoading: false,
              error: null
            });
          }
        });
        
        // Return unsubscribe function
        return unsubscribe;
      },
      
      // Register a new user
      register: async (email, password, name) => {
        set({ isLoading: true, error: null });
        
        const { success, user, error } = await registerUser(email, password, name);
        
        if (success) {
          // User data will be set by the auth state observer
          set({ isLoading: false });
          return { success: true };
        } else {
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },
      
      // Login user
      login: async (email, password) => {
        set({ isLoading: true, error: null });
        
        const { success, user, error } = await loginUser(email, password);
        
        if (success) {
          // User data will be set by the auth state observer
          set({ isLoading: false });
          return { success: true };
        } else {
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },
      
      // Logout user
      logout: async () => {
        set({ isLoading: true, error: null });
        
        const { success, error } = await logoutUser();
        
        if (success) {
          set({ 
            user: null, 
            userData: null,
            isLoading: false,
            error: null
          });
          return { success: true };
        } else {
          set({ isLoading: false, error });
          return { success: false, error };
        }
      },
      
      // Reset password
      resetPassword: async (email) => {
        set({ isLoading: true, error: null });
        
        const { success, error } = await resetPassword(email);
        
        set({ isLoading: false });
        
        if (success) {
          return { success: true };
        } else {
          set({ error });
          return { success: false, error };
        }
      },
      
      // Check if user is authenticated
      isAuthenticated: () => {
        return !!get().user;
      },
      
      // Check if user is admin
      isAdmin: () => {
        const { userData } = get();
        return userData?.role === 'admin';
      }
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user ? {
          uid: state.user.uid,
          email: state.user.email,
          displayName: state.user.displayName,
        } : null,
        userData: state.userData
      }),
    }
  )
);

// Initialize auth state when the app loads
export const initAuth = () => {
  const unsubscribe = useAuth.getState().init();
  return unsubscribe;
};