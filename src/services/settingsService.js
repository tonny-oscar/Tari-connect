import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';
import { updateDualDocument, createDualDocument } from './dualDatabaseService';

// Default settings structure
const defaultSettings = {
  company: {
    name: '',
    industry: '',
    address: '',
    phone: '',
    website: '',
    logo: ''
  },
  system: {
    timezone: 'Africa/Nairobi',
    language: 'en',
    dateFormat: 'DD/MM/YYYY',
    currency: 'KSh'
  },
  integrations: {
    whatsapp: {
      connected: false,
      businessId: '',
      accessToken: ''
    },
    meta: {
      connected: false,
      appId: '',
      appSecret: '',
      accessToken: '',
      webhookToken: '',
      pageId: ''
    },
    email: {
      connected: false,
      provider: '',
      settings: {}
    }
  },
  appearance: {
    theme: 'light',
    primaryColor: '#3B82F6'
  },
  notifications: {
    email: true,
    push: true,
    sms: false
  }
};

// Get user settings
export const getUserSettings = async (userId) => {
  try {
    const settingsDoc = await getDoc(doc(db, 'settings', userId));
    
    if (settingsDoc.exists()) {
      return { success: true, settings: settingsDoc.data() };
    } else {
      // Create default settings for new user
      await createDualDocument('settings', userId, defaultSettings);
      return { success: true, settings: defaultSettings };
    }
  } catch (error) {
    console.error('Error getting user settings:', error);
    return { success: false, error: error.message };
  }
};

// Update user settings
export const updateUserSettings = async (userId, settingsData) => {
  try {
    const result = await updateDualDocument('settings', userId, settingsData);
    return result;
  } catch (error) {
    console.error('Error updating user settings:', error);
    return { success: false, error: error.message };
  }
};

// Update company profile
export const updateCompanyProfile = async (userId, companyData) => {
  try {
    const result = await updateDualDocument('settings', userId, {
      company: companyData,
      updatedAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error updating company profile:', error);
    return { success: false, error: error.message };
  }
};

// Update system preferences
export const updateSystemPreferences = async (userId, systemData) => {
  try {
    const result = await updateDualDocument('settings', userId, {
      system: systemData,
      updatedAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error updating system preferences:', error);
    return { success: false, error: error.message };
  }
};

// Update integration settings
export const updateIntegrationSettings = async (userId, integrationData) => {
  try {
    const result = await updateDualDocument('settings', userId, {
      integrations: integrationData,
      updatedAt: new Date().toISOString()
    });
    return result;
  } catch (error) {
    console.error('Error updating integration settings:', error);
    return { success: false, error: error.message };
  }
};

// Connect WhatsApp integration
export const connectWhatsApp = async (userId, businessId, accessToken) => {
  try {
    const { success, settings } = await getUserSettings(userId);
    if (!success) return { success: false, error: 'Failed to get current settings' };
    
    const updatedIntegrations = {
      ...settings.integrations,
      whatsapp: {
        connected: true,
        businessId,
        accessToken,
        connectedAt: new Date().toISOString()
      }
    };
    
    const result = await updateIntegrationSettings(userId, updatedIntegrations);
    return result;
  } catch (error) {
    console.error('Error connecting WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

// Disconnect WhatsApp integration
export const disconnectWhatsApp = async (userId) => {
  try {
    const { success, settings } = await getUserSettings(userId);
    if (!success) return { success: false, error: 'Failed to get current settings' };
    
    const updatedIntegrations = {
      ...settings.integrations,
      whatsapp: {
        connected: false,
        businessId: '',
        accessToken: '',
        disconnectedAt: new Date().toISOString()
      }
    };
    
    const result = await updateIntegrationSettings(userId, updatedIntegrations);
    return result;
  } catch (error) {
    console.error('Error disconnecting WhatsApp:', error);
    return { success: false, error: error.message };
  }
};

// Get available timezones
export const getTimezones = () => {
  return [
    { value: 'Africa/Nairobi', label: 'Africa/Nairobi (GMT+3)' },
    { value: 'UTC', label: 'UTC (GMT+0)' },
    { value: 'America/New_York', label: 'America/New_York (GMT-5)' },
    { value: 'Europe/London', label: 'Europe/London (GMT+0)' },
    { value: 'Asia/Tokyo', label: 'Asia/Tokyo (GMT+9)' },
    { value: 'Australia/Sydney', label: 'Australia/Sydney (GMT+10)' }
  ];
};

// Connect Meta API integration
export const connectMeta = async (userId, appId, appSecret, accessToken, webhookToken, pageId) => {
  try {
    const { success, settings } = await getUserSettings(userId);
    if (!success) return { success: false, error: 'Failed to get current settings' };
    
    const updatedIntegrations = {
      ...settings.integrations,
      meta: {
        connected: true,
        appId,
        appSecret,
        accessToken,
        webhookToken,
        pageId,
        connectedAt: new Date().toISOString()
      }
    };
    
    const result = await updateIntegrationSettings(userId, updatedIntegrations);
    return result;
  } catch (error) {
    console.error('Error connecting Meta API:', error);
    return { success: false, error: error.message };
  }
};

// Disconnect Meta API integration
export const disconnectMeta = async (userId) => {
  try {
    const { success, settings } = await getUserSettings(userId);
    if (!success) return { success: false, error: 'Failed to get current settings' };
    
    const updatedIntegrations = {
      ...settings.integrations,
      meta: {
        connected: false,
        appId: '',
        appSecret: '',
        accessToken: '',
        webhookToken: '',
        pageId: '',
        disconnectedAt: new Date().toISOString()
      }
    };
    
    const result = await updateIntegrationSettings(userId, updatedIntegrations);
    return result;
  } catch (error) {
    console.error('Error disconnecting Meta API:', error);
    return { success: false, error: error.message };
  }
};

// Get available industries
export const getIndustries = () => {
  return [
    'Technology',
    'Retail',
    'Healthcare',
    'Finance',
    'Education',
    'Manufacturing',
    'Real Estate',
    'Hospitality',
    'Transportation',
    'Agriculture',
    'Other'
  ];
};