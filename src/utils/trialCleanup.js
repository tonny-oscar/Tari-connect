import { cleanupExpiredTrials } from '../services/freeTrialService';

// Run trial cleanup every 24 hours
let cleanupInterval = null;

export const startTrialCleanup = () => {
  // Clear existing interval if any
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
  }

  // Run cleanup immediately
  cleanupExpiredTrials();

  // Set up interval to run every 24 hours
  cleanupInterval = setInterval(() => {
    cleanupExpiredTrials();
  }, 24 * 60 * 60 * 1000); // 24 hours in milliseconds

  console.log('Trial cleanup service started');
};

export const stopTrialCleanup = () => {
  if (cleanupInterval) {
    clearInterval(cleanupInterval);
    cleanupInterval = null;
    console.log('Trial cleanup service stopped');
  }
};