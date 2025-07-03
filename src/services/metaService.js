// Meta API Service for Facebook and Instagram integration
const META_API_BASE_URL = 'https://graph.facebook.com/v18.0';

// Get Meta API configuration from environment or settings
const getMetaConfig = (settings) => {
  return {
    appId: settings?.integrations?.meta?.appId || import.meta.env.VITE_META_APP_ID,
    appSecret: settings?.integrations?.meta?.appSecret || import.meta.env.VITE_META_APP_SECRET,
    accessToken: settings?.integrations?.meta?.accessToken || import.meta.env.VITE_META_ACCESS_TOKEN,
    webhookToken: settings?.integrations?.meta?.webhookToken || import.meta.env.VITE_META_WEBHOOK_TOKEN,
    pageId: settings?.integrations?.meta?.pageId || import.meta.env.VITE_META_PAGE_ID
  };
};

// Verify Meta API connection
export const verifyMetaConnection = async (settings) => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken) {
      return { success: false, error: 'Access token is required' };
    }

    const response = await fetch(`${META_API_BASE_URL}/me?access_token=${config.accessToken}`);
    const data = await response.json();

    if (response.ok) {
      return { 
        success: true, 
        data: {
          id: data.id,
          name: data.name,
          type: data.type || 'user'
        }
      };
    } else {
      return { success: false, error: data.error?.message || 'Failed to verify connection' };
    }
  } catch (error) {
    console.error('Error verifying Meta connection:', error);
    return { success: false, error: error.message };
  }
};

// Get Facebook Pages
export const getFacebookPages = async (settings) => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken) {
      return { success: false, error: 'Access token is required' };
    }

    const response = await fetch(`${META_API_BASE_URL}/me/accounts?access_token=${config.accessToken}`);
    const data = await response.json();

    if (response.ok) {
      return { success: true, pages: data.data || [] };
    } else {
      return { success: false, error: data.error?.message || 'Failed to get pages' };
    }
  } catch (error) {
    console.error('Error getting Facebook pages:', error);
    return { success: false, error: error.message };
  }
};

// Get Instagram Business Accounts
export const getInstagramAccounts = async (settings) => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken || !config.pageId) {
      return { success: false, error: 'Access token and page ID are required' };
    }

    const response = await fetch(`${META_API_BASE_URL}/${config.pageId}?fields=instagram_business_account&access_token=${config.accessToken}`);
    const data = await response.json();

    if (response.ok && data.instagram_business_account) {
      return { success: true, account: data.instagram_business_account };
    } else {
      return { success: false, error: 'No Instagram business account found' };
    }
  } catch (error) {
    console.error('Error getting Instagram accounts:', error);
    return { success: false, error: error.message };
  }
};

// Post to Facebook Page
export const postToFacebook = async (settings, message, imageUrl = null) => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken || !config.pageId) {
      return { success: false, error: 'Access token and page ID are required' };
    }

    const postData = {
      message,
      access_token: config.accessToken
    };

    if (imageUrl) {
      postData.url = imageUrl;
    }

    const response = await fetch(`${META_API_BASE_URL}/${config.pageId}/feed`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(postData)
    });

    const data = await response.json();

    if (response.ok) {
      return { success: true, postId: data.id };
    } else {
      return { success: false, error: data.error?.message || 'Failed to post to Facebook' };
    }
  } catch (error) {
    console.error('Error posting to Facebook:', error);
    return { success: false, error: error.message };
  }
};

// Post to Instagram
export const postToInstagram = async (settings, imageUrl, caption = '') => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken || !config.pageId) {
      return { success: false, error: 'Access token and page ID are required' };
    }

    // First get Instagram business account
    const igAccountResult = await getInstagramAccounts(settings);
    if (!igAccountResult.success) {
      return igAccountResult;
    }

    const igAccountId = igAccountResult.account.id;

    // Create media container
    const containerResponse = await fetch(`${META_API_BASE_URL}/${igAccountId}/media`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        image_url: imageUrl,
        caption,
        access_token: config.accessToken
      })
    });

    const containerData = await containerResponse.json();

    if (!containerResponse.ok) {
      return { success: false, error: containerData.error?.message || 'Failed to create media container' };
    }

    // Publish media
    const publishResponse = await fetch(`${META_API_BASE_URL}/${igAccountId}/media_publish`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        creation_id: containerData.id,
        access_token: config.accessToken
      })
    });

    const publishData = await publishResponse.json();

    if (publishResponse.ok) {
      return { success: true, postId: publishData.id };
    } else {
      return { success: false, error: publishData.error?.message || 'Failed to publish to Instagram' };
    }
  } catch (error) {
    console.error('Error posting to Instagram:', error);
    return { success: false, error: error.message };
  }
};

// Get Facebook Page Insights
export const getFacebookInsights = async (settings, metric = 'page_views', period = 'day') => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken || !config.pageId) {
      return { success: false, error: 'Access token and page ID are required' };
    }

    const response = await fetch(`${META_API_BASE_URL}/${config.pageId}/insights?metric=${metric}&period=${period}&access_token=${config.accessToken}`);
    const data = await response.json();

    if (response.ok) {
      return { success: true, insights: data.data || [] };
    } else {
      return { success: false, error: data.error?.message || 'Failed to get insights' };
    }
  } catch (error) {
    console.error('Error getting Facebook insights:', error);
    return { success: false, error: error.message };
  }
};

// Get Instagram Insights
export const getInstagramInsights = async (settings, metric = 'impressions', period = 'day') => {
  try {
    const config = getMetaConfig(settings);
    
    if (!config.accessToken || !config.pageId) {
      return { success: false, error: 'Access token and page ID are required' };
    }

    // Get Instagram business account
    const igAccountResult = await getInstagramAccounts(settings);
    if (!igAccountResult.success) {
      return igAccountResult;
    }

    const igAccountId = igAccountResult.account.id;

    const response = await fetch(`${META_API_BASE_URL}/${igAccountId}/insights?metric=${metric}&period=${period}&access_token=${config.accessToken}`);
    const data = await response.json();

    if (response.ok) {
      return { success: true, insights: data.data || [] };
    } else {
      return { success: false, error: data.error?.message || 'Failed to get Instagram insights' };
    }
  } catch (error) {
    console.error('Error getting Instagram insights:', error);
    return { success: false, error: error.message };
  }
};

// Webhook verification for Meta API
export const verifyWebhook = (mode, token, challenge, settings) => {
  const config = getMetaConfig(settings);
  
  if (mode === 'subscribe' && token === config.webhookToken) {
    return challenge;
  }
  
  return null;
};

// Handle webhook events
export const handleWebhookEvent = async (body, settings) => {
  try {
    if (body.object === 'page') {
      for (const entry of body.entry) {
        // Handle messaging events
        if (entry.messaging) {
          for (const event of entry.messaging) {
            if (event.message) {
              // Handle incoming message
              console.log('Received message:', event.message);
              // Add your message handling logic here
            }
          }
        }
        
        // Handle feed events
        if (entry.changes) {
          for (const change of entry.changes) {
            if (change.field === 'feed') {
              // Handle feed changes
              console.log('Feed change:', change);
              // Add your feed handling logic here
            }
          }
        }
      }
    }
    
    return { success: true };
  } catch (error) {
    console.error('Error handling webhook event:', error);
    return { success: false, error: error.message };
  }
};