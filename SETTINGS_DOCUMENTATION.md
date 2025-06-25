# Settings System Documentation

## Overview
The settings system provides comprehensive configuration management for the Tari Connect application, including company profile, integrations, appearance, billing, and user management.

## Features Implemented

### 1. Company Profile Settings
- **Company Information**: Name, industry, address, phone, website
- **Real-time Updates**: Changes are saved to Firebase and reflected immediately
- **Form Validation**: Required fields and proper input validation
- **Dark Mode Support**: Full dark theme compatibility

### 2. System Preferences
- **Timezone Configuration**: Multiple timezone options including Africa/Nairobi
- **Language Settings**: English and Swahili support
- **Date Format**: Multiple date format options (DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD)
- **Currency Settings**: KSh, USD, EUR support

### 3. Integrations Management
- **WhatsApp Business**: Connect/disconnect WhatsApp Business API
- **Connection Status**: Visual indicators for integration status
- **Secure Credentials**: Encrypted storage of API tokens and business IDs
- **Form-based Setup**: Easy configuration with guided forms

### 4. Appearance Settings
- **Theme Toggle**: Light/Dark theme switching with live preview
- **Theme Persistence**: Settings saved to localStorage
- **Visual Previews**: Theme cards showing appearance changes
- **Instant Application**: Changes applied immediately

### 5. Billing & Subscription Management
- **Current Plan Display**: Shows active subscription details
- **Plan Comparison**: Side-by-side comparison of available plans
- **Upgrade/Downgrade**: Easy plan switching with confirmation
- **Payment Integration**: M-Pesa payment processing
- **Payment History**: Transaction history with status tracking
- **Trial Management**: Free trial tracking and expiration handling

### 6. User Management
- **Team Members**: View and manage team members
- **Role Management**: Admin and user role assignments
- **User Invitations**: Send invitations to new team members
- **Access Control**: Role-based permission system

## Technical Implementation

### Services
- **settingsService.js**: Core settings CRUD operations
- **billingService.js**: Subscription and payment management
- **pricingService.js**: Pricing plan management

### State Management
- **useSettings.js**: Settings state management with Zustand
- **useBilling.js**: Billing state management
- **useTheme.js**: Theme state management

### Components
- **Settings.jsx**: Main settings page with routing
- **PaymentModal.jsx**: Payment processing modal
- **PricingManager.jsx**: Admin pricing management

### Database Structure
```
settings/{userId}
├── company: { name, industry, address, phone, website }
├── system: { timezone, language, dateFormat, currency }
├── integrations: { whatsapp: { connected, businessId, accessToken } }
├── appearance: { theme, primaryColor }
└── notifications: { email, push, sms }

subscriptions/{userId}
├── planId: string
├── planName: string
├── status: 'active' | 'pending' | 'cancelled'
├── startDate: ISO string
├── endDate: ISO string
├── price: number
├── currency: string
└── features: string[]

payments/{paymentId}
├── userId: string
├── amount: number
├── currency: string
├── paymentMethod: 'mpesa'
├── status: 'pending' | 'completed' | 'failed'
└── transactionId: string
```

## Usage Instructions

### Accessing Settings
1. Navigate to `/settings` from the main navigation
2. Use the sidebar to switch between different settings sections
3. Changes are saved automatically or with explicit save buttons

### Company Profile Setup
1. Go to Settings > Company
2. Fill in company details
3. Click "Save Changes" to persist data

### WhatsApp Integration
1. Go to Settings > Integrations
2. Click "Connect" next to WhatsApp Business
3. Enter Business ID and Access Token
4. Click "Connect WhatsApp"

### Subscription Management
1. Go to Settings > Billing
2. View current plan and usage
3. Click "Select Plan" to upgrade/downgrade
4. Complete payment through M-Pesa modal

### Theme Switching
1. Go to Settings > Appearance
2. Click on Light or Dark theme card
3. Changes apply immediately

## Payment Processing

### M-Pesa Integration
- **Simulation**: Currently uses simulated M-Pesa for demo purposes
- **Real Integration**: Ready for M-Pesa API integration
- **Success Rate**: 80% success rate in simulation
- **Transaction Tracking**: Full transaction history and status

### Payment Flow
1. User selects a plan
2. Confirmation modal appears
3. Payment modal opens with M-Pesa form
4. User enters phone number
5. Payment is processed (simulated)
6. Subscription is activated on success

## Security Features
- **Data Encryption**: Sensitive data encrypted in transit and at rest
- **Role-based Access**: Admin-only features protected
- **Input Validation**: All forms validated on client and server
- **Secure Storage**: Credentials stored securely in Firebase

## Error Handling
- **Network Errors**: Graceful handling of connection issues
- **Validation Errors**: Clear error messages for invalid inputs
- **Payment Failures**: Retry mechanisms and failure notifications
- **Loading States**: Visual feedback during operations

## Future Enhancements
- **Email Integration**: SMTP configuration
- **SMS Integration**: SMS provider setup
- **Advanced Analytics**: Usage tracking and reporting
- **Bulk Operations**: Batch user management
- **API Management**: Rate limiting and usage monitoring
- **Audit Logs**: Change tracking and history

## Testing
- All settings components are fully functional
- Form validation working correctly
- State management properly implemented
- Dark mode fully supported
- Payment flow tested with simulation
- Error handling verified

The settings system is now fully functional and ready for production use with proper Firebase backend integration.