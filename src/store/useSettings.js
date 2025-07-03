import { create } from 'zustand';
import { 
  getUserSettings, 
  updateUserSettings,
  updateCompanyProfile,
  updateSystemPreferences,
  updateIntegrationSettings,
  connectWhatsApp,
  disconnectWhatsApp,
  connectMeta,
  disconnectMeta
} from '../services/settingsService';

export const useSettings = create((set, get) => ({
  settings: null,
  isLoading: false,
  error: null,
  success: null,

  // Load user settings
  loadSettings: async (userId) => {
    set({ isLoading: true, error: null });
    
    try {
      const { success, settings, error } = await getUserSettings(userId);
      
      if (success) {
        set({ settings, isLoading: false });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Update company profile
  updateCompany: async (userId, companyData) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await updateCompanyProfile(userId, companyData);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { ...currentSettings, company: companyData },
          success: 'Company profile updated successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Update system preferences
  updateSystem: async (userId, systemData) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await updateSystemPreferences(userId, systemData);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { ...currentSettings, system: systemData },
          success: 'System preferences updated successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Connect WhatsApp
  connectWhatsApp: async (userId, businessId, accessToken) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await connectWhatsApp(userId, businessId, accessToken);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { 
            ...currentSettings, 
            integrations: {
              ...currentSettings.integrations,
              whatsapp: {
                connected: true,
                businessId,
                accessToken,
                connectedAt: new Date().toISOString()
              }
            }
          },
          success: 'WhatsApp connected successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Disconnect WhatsApp
  disconnectWhatsApp: async (userId) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await disconnectWhatsApp(userId);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { 
            ...currentSettings, 
            integrations: {
              ...currentSettings.integrations,
              whatsapp: {
                connected: false,
                businessId: '',
                accessToken: ''
              }
            }
          },
          success: 'WhatsApp disconnected successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Connect Meta API
  connectMeta: async (userId, appId, appSecret, accessToken, webhookToken, pageId) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await connectMeta(userId, appId, appSecret, accessToken, webhookToken, pageId);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { 
            ...currentSettings, 
            integrations: {
              ...currentSettings.integrations,
              meta: {
                connected: true,
                appId,
                appSecret,
                accessToken,
                webhookToken,
                pageId,
                connectedAt: new Date().toISOString()
              }
            }
          },
          success: 'Meta API connected successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Disconnect Meta API
  disconnectMeta: async (userId) => {
    set({ isLoading: true, error: null, success: null });
    
    try {
      const { success, error } = await disconnectMeta(userId);
      
      if (success) {
        const currentSettings = get().settings;
        set({ 
          settings: { 
            ...currentSettings, 
            integrations: {
              ...currentSettings.integrations,
              meta: {
                connected: false,
                appId: '',
                appSecret: '',
                accessToken: '',
                webhookToken: '',
                pageId: ''
              }
            }
          },
          success: 'Meta API disconnected successfully',
          isLoading: false 
        });
        return { success: true };
      } else {
        set({ error, isLoading: false });
        return { success: false, error };
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
      return { success: false, error: err.message };
    }
  },

  // Clear messages
  clearMessages: () => {
    set({ error: null, success: null });
  },

  // Get specific setting
  getSetting: (path) => {
    const settings = get().settings;
    if (!settings) return null;
    
    return path.split('.').reduce((obj, key) => obj?.[key], settings);
  }
}));