import { initializePricingPlans } from '../services/pricingService';
import { initializeAdminUsers } from '../services/authService';

// Initialize application data
export const initializeApp = async () => {
  try {
    console.log('Initializing application...');
    
    // Initialize admin users
    const adminResult = await initializeAdminUsers();
    if (adminResult.success) {
      console.log('Admin users initialized successfully');
    } else {
      console.error('Failed to initialize admin users:', adminResult.error);
    }
    
    // Initialize pricing plans
    const pricingResult = await initializePricingPlans();
    if (pricingResult.success) {
      console.log('Pricing plans initialized successfully');
    } else {
      console.error('Failed to initialize pricing plans:', pricingResult.error);
    }
    
    console.log('Application initialization complete');
    return { success: true };
  } catch (error) {
    console.error('Error during application initialization:', error);
    return { success: false, error: error.message };
  }
};