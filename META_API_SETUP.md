# Meta API Setup Guide

This guide will help you set up Meta API integration for Facebook and Instagram in your Tari Connect application.

## Prerequisites

1. Facebook Developer Account
2. Facebook App with appropriate permissions
3. Facebook Page (for posting and insights)
4. Instagram Business Account (optional, for Instagram features)

## Step 1: Create Facebook App

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Click "Create App"
3. Choose "Business" as the app type
4. Fill in your app details:
   - App Name: Your application name
   - App Contact Email: Your email
   - Business Account: Select or create one

## Step 2: Configure App Permissions

Add the following products to your app:
- **Facebook Login**: For user authentication
- **Pages API**: For page management and posting
- **Instagram Basic Display**: For Instagram integration
- **Webhooks**: For real-time updates (optional)

### Required Permissions:
- `pages_show_list`: View list of pages
- `pages_read_engagement`: Read page insights
- `pages_manage_posts`: Create and manage posts
- `pages_manage_metadata`: Manage page settings
- `instagram_basic`: Access Instagram account
- `instagram_content_publish`: Publish to Instagram

## Step 3: Get Your Credentials

### App ID and App Secret
1. Go to App Settings > Basic
2. Copy your **App ID** and **App Secret**

### Access Token
1. Go to Tools > Graph API Explorer
2. Select your app
3. Add required permissions
4. Generate User Access Token
5. Use Access Token Debugger to extend token lifetime

### Page Access Token (Recommended)
1. Use Graph API Explorer
2. Make a GET request to `/me/accounts`
3. Find your page and copy its access token
4. This token doesn't expire and has page-level permissions

## Step 4: Configure Webhooks (Optional)

1. Go to Products > Webhooks
2. Create a new webhook subscription
3. Set callback URL: `https://yourdomain.com/api/webhooks/meta`
4. Generate a verify token (random string)
5. Subscribe to relevant fields:
   - `feed`: Page posts
   - `messages`: Page messages
   - `messaging_postbacks`: Button clicks

## Step 5: Environment Variables

Add these variables to your `.env` file:

```env
# Meta API Configuration
VITE_META_APP_ID=your_app_id_here
VITE_META_APP_SECRET=your_app_secret_here
VITE_META_ACCESS_TOKEN=your_access_token_here
VITE_META_WEBHOOK_TOKEN=your_webhook_verify_token
VITE_META_PAGE_ID=your_facebook_page_id
```

## Step 6: Configure in Tari Connect

1. Go to Settings > Integrations
2. Find the Meta API section
3. Click "Connect"
4. Fill in your credentials:
   - **App ID**: From Step 3
   - **App Secret**: From Step 3
   - **Access Token**: Page access token (recommended) or user token
   - **Webhook Token**: Your webhook verify token (optional)
   - **Page ID**: Your Facebook page ID (optional, for page-specific operations)

## Step 7: Test Your Integration

1. After connecting, the Meta API Test Suite will appear
2. Run the following tests:
   - **Verify Connection**: Confirms your token is valid
   - **Get Facebook Pages**: Lists your accessible pages
   - **Get Instagram Account**: Shows linked Instagram business account
   - **Post to Facebook**: Creates a test post on your page
   - **Post to Instagram**: Creates a test post on Instagram
   - **Facebook Insights**: Retrieves page analytics
   - **Instagram Insights**: Retrieves Instagram analytics

## Available Features

### Facebook Features
- ✅ Post text and images to Facebook pages
- ✅ Get page insights and analytics
- ✅ List and manage Facebook pages
- ✅ Real-time webhook notifications

### Instagram Features
- ✅ Post images to Instagram business accounts
- ✅ Get Instagram insights and analytics
- ✅ Link Instagram business accounts to Facebook pages

### Analytics & Insights
- ✅ Page views and engagement metrics
- ✅ Post performance analytics
- ✅ Audience demographics
- ✅ Real-time engagement tracking

## Troubleshooting

### Common Issues

**Invalid Access Token**
- Ensure your token has the required permissions
- Check if the token has expired
- Use a page access token instead of user token

**Permission Denied**
- Verify your app has the required permissions
- Check if your Facebook page is connected to a business account
- Ensure you're an admin of the page

**Instagram Not Found**
- Link your Instagram business account to your Facebook page
- Ensure the Instagram account is a business account, not personal
- Check Instagram account permissions

**Webhook Verification Failed**
- Ensure your webhook URL is accessible
- Verify the webhook token matches your configuration
- Check SSL certificate on your webhook endpoint

### API Limits

- **Rate Limits**: Facebook has rate limits per app and per user
- **Content Limits**: Posts have character and media limits
- **Time Limits**: Some operations have time-based restrictions

### Best Practices

1. **Use Page Access Tokens**: They don't expire and have better permissions
2. **Handle Errors Gracefully**: Always check API responses
3. **Respect Rate Limits**: Implement proper retry logic
4. **Secure Your Tokens**: Never expose tokens in client-side code
5. **Monitor Usage**: Keep track of your API usage and limits

## Support

For additional help:
- [Facebook Developer Documentation](https://developers.facebook.com/docs/)
- [Instagram API Documentation](https://developers.facebook.com/docs/instagram-api/)
- [Graph API Explorer](https://developers.facebook.com/tools/explorer/)
- [Access Token Debugger](https://developers.facebook.com/tools/debug/accesstoken/)

## Security Notes

⚠️ **Important Security Considerations:**

1. **Never commit credentials to version control**
2. **Use environment variables for all sensitive data**
3. **Regularly rotate your access tokens**
4. **Monitor your app for unusual activity**
5. **Use HTTPS for all webhook endpoints**
6. **Validate all webhook payloads**

Your Meta API integration is now ready to use! 🚀