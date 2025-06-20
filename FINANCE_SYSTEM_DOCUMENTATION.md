# TariConnect Finance System Documentation

## Overview
The TariConnect Finance System is a comprehensive solution for managing leads, quotes, items, and invoices with seamless integration and data flow between components. All data is stored in Firebase Firestore for real-time synchronization and reliability.

## System Architecture

### Database Structure (Firestore Collections)

#### 1. Items Collection (`items`)
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  name: "Item Name",
  description: "Item Description",
  sku: "SKU-CODE",
  price: 1000.00,
  type: "product|service",
  category: "Category Name",
  unit: "piece|hour|day|month|kg|meter",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 2. Leads Collection (`leads`)
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  name: "Lead Name",
  email: "lead@email.com",
  phone: "+1234567890",
  company: "Company Name",
  source: "website|referral|social_media|email|phone|other",
  status: "new|contacted|qualified|quoted|won|lost",
  value: 5000.00,
  notes: "Lead notes",
  quoteId: "quote-id", // Set when converted to quote
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 3. Quotes Collection (`quotes`)
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  leadId: "lead-id", // Optional, if converted from lead
  quoteNumber: "Q-1234567890",
  customerName: "Customer Name",
  customerEmail: "customer@email.com",
  customerPhone: "+1234567890",
  customerCompany: "Company Name",
  customerAddress: "Full Address",
  items: [
    {
      id: "item-id",
      name: "Item Name",
      description: "Item Description",
      price: 1000.00,
      quantity: 2
    }
  ],
  subtotal: 2000.00,
  taxRate: 16,
  tax: 320.00,
  total: 2320.00,
  status: "draft|sent|accepted|rejected|converted|expired",
  validUntil: "2024-12-31",
  notes: "Quote notes",
  invoiceId: "invoice-id", // Set when converted to invoice
  createdAt: timestamp,
  updatedAt: timestamp
}
```

#### 4. Invoices Collection (`invoices`)
```javascript
{
  id: "auto-generated",
  userId: "user-id",
  quoteId: "quote-id", // Optional, if converted from quote
  invoiceNumber: "INV-1234567890",
  customerName: "Customer Name",
  customerEmail: "customer@email.com",
  customerPhone: "+1234567890",
  customerCompany: "Company Name",
  customerAddress: "Full Address",
  items: [
    {
      id: "item-id",
      name: "Item Name",
      description: "Item Description",
      price: 1000.00,
      quantity: 2
    }
  ],
  subtotal: 2000.00,
  taxRate: 16,
  tax: 320.00,
  total: 2320.00,
  status: "pending|sent|paid|overdue|cancelled",
  dueDate: timestamp,
  paidAt: timestamp, // Set when marked as paid
  paymentMethod: "cash|bank|card|other",
  paymentReference: "Payment Reference",
  notes: "Invoice notes",
  createdAt: timestamp,
  updatedAt: timestamp
}
```

## Service Layer

### 1. Item Service (`src/services/itemService.js`)
- **createItem(itemData, userId)**: Create a new item
- **getItems(userId)**: Fetch all items for a user
- **updateItem(itemId, itemData)**: Update an existing item
- **deleteItem(itemId)**: Delete an item

### 2. Lead Service (`src/services/leadService.js`)
- **createLead(leadData, userId)**: Create a new lead
- **getLeads(userId)**: Fetch all leads for a user
- **updateLead(leadId, leadData)**: Update an existing lead
- **convertLeadToQuote(leadId, quoteData, userId)**: Convert lead to quote
- **deleteLead(leadId)**: Delete a lead

### 3. Quote Service (`src/services/quoteService.js`)
- **createQuote(quoteData, userId)**: Create a new quote
- **getQuotes(userId)**: Fetch all quotes for a user
- **updateQuote(quoteId, quoteData)**: Update an existing quote
- **convertQuoteToInvoice(quoteId, invoiceData, userId)**: Convert quote to invoice
- **deleteQuote(quoteId)**: Delete a quote

### 4. Invoice Service (`src/services/invoiceService.js`)
- **createInvoice(invoiceData, userId)**: Create a new invoice
- **getInvoices(userId)**: Fetch all invoices for a user
- **updateInvoice(invoiceId, invoiceData)**: Update an existing invoice
- **markInvoiceAsPaid(invoiceId, paymentData)**: Mark invoice as paid
- **deleteInvoice(invoiceId)**: Delete an invoice

## Component Architecture

### 1. ItemSelector Component (`src/components/ItemSelector.jsx`)
A reusable modal component for selecting items in quotes and invoices:
- Displays available items with search functionality
- Allows quantity selection for each item
- Shows real-time total calculation
- Returns selected items with quantities

### 2. Items Page (`src/pages/finance/Items.jsx`)
- Full CRUD operations for items
- Search and filter functionality
- Modal form for creating/editing items
- Support for products and services
- Category and unit management

### 3. Leads Page (`src/pages/finance/Leads.jsx`)
- Lead management with status tracking
- Convert leads to quotes functionality
- Source tracking (website, referral, etc.)
- Value estimation and notes
- Status-based color coding

### 4. Quotes Page (`src/pages/finance/Quotes.jsx`)
- Quote creation with item selection
- Customer information management
- Tax calculation and totals
- Convert quotes to invoices
- Status tracking and validation

### 5. Invoices Page (`src/pages/finance/Invoices.jsx`)
- Invoice creation and management
- Payment tracking and status updates
- Overdue detection and highlighting
- Due date management
- Payment method recording

## Data Flow and Integration

### Lead to Quote Conversion
1. User clicks "Convert to Quote" on a lead
2. System creates a new quote with lead's customer information
3. Lead status is updated to "quoted"
4. Lead record stores the quote ID for reference

### Quote to Invoice Conversion
1. User clicks "Convert to Invoice" on a quote
2. System creates a new invoice with quote's data (items, totals, customer info)
3. Quote status is updated to "converted"
4. Quote record stores the invoice ID for reference

### Item Integration
1. Items are created and managed independently
2. ItemSelector component allows selection of items in quotes/invoices
3. Selected items include quantity and calculate line totals
4. Changes to item prices don't affect existing quotes/invoices (historical data preservation)

## Key Features

### 1. Real-time Data Synchronization
- All data stored in Firestore for real-time updates
- Automatic synchronization across multiple sessions
- Offline support with Firestore caching

### 2. Comprehensive Search
- Search across all relevant fields (name, email, company, etc.)
- Real-time filtering as user types
- Case-insensitive search functionality

### 3. Status Management
- Color-coded status indicators
- Automatic status updates during conversions
- Overdue detection for invoices

### 4. Financial Calculations
- Automatic subtotal, tax, and total calculations
- Configurable tax rates
- Real-time updates when items change

### 5. Data Relationships
- Maintains relationships between leads, quotes, and invoices
- Preserves historical data integrity
- Enables tracking of conversion funnel

## Usage Examples

### Creating a Complete Sales Flow

1. **Create Items**:
   ```javascript
   // Create a product item
   await createItem({
     name: "Website Development",
     description: "Custom website development service",
     price: 50000,
     type: "service",
     unit: "project"
   }, userId);
   ```

2. **Create Lead**:
   ```javascript
   // Create a new lead
   await createLead({
     name: "John Doe",
     email: "john@company.com",
     company: "ABC Corp",
     source: "website",
     value: 50000,
     status: "new"
   }, userId);
   ```

3. **Convert Lead to Quote**:
   ```javascript
   // Convert lead to quote with items
   await convertLeadToQuote(leadId, {
     customerName: "John Doe",
     customerEmail: "john@company.com",
     items: [selectedItems],
     taxRate: 16
   }, userId);
   ```

4. **Convert Quote to Invoice**:
   ```javascript
   // Convert accepted quote to invoice
   await convertQuoteToInvoice(quoteId, {
     dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)
   }, userId);
   ```

5. **Mark Invoice as Paid**:
   ```javascript
   // Mark invoice as paid
   await markInvoiceAsPaid(invoiceId, {
     paymentMethod: "bank",
     paymentReference: "TXN123456"
   });
   ```

## Security Considerations

1. **User Isolation**: All data is filtered by userId to ensure users only see their own data
2. **Input Validation**: All forms include client-side validation
3. **Firestore Rules**: Server-side security rules should be implemented
4. **Data Sanitization**: All user inputs are properly sanitized

## Performance Optimizations

1. **Pagination**: Consider implementing pagination for large datasets
2. **Indexing**: Firestore composite indexes for complex queries
3. **Caching**: Leverage Firestore's built-in caching
4. **Lazy Loading**: Load data only when needed

## Future Enhancements

1. **PDF Generation**: Generate PDF quotes and invoices
2. **Email Integration**: Send quotes/invoices via email
3. **Payment Gateway**: Integrate online payment processing
4. **Reporting**: Advanced analytics and reporting features
5. **Templates**: Customizable quote and invoice templates
6. **Recurring Invoices**: Support for subscription-based billing
7. **Multi-currency**: Support for multiple currencies
8. **Approval Workflows**: Multi-step approval processes

## Files Modified/Created

### Services
- `src/services/itemService.js` - Item CRUD operations
- `src/services/leadService.js` - Lead management and quote conversion
- `src/services/quoteService.js` - Quote management and invoice conversion
- `src/services/invoiceService.js` - Invoice management and payment tracking

### Components
- `src/components/ItemSelector.jsx` - Reusable item selection modal

### Pages
- `src/pages/finance/Items.jsx` - Enhanced items management
- `src/pages/finance/Leads.jsx` - Enhanced leads management
- `src/pages/finance/Quotes.jsx` - Enhanced quotes management
- `src/pages/finance/Invoices.jsx` - Enhanced invoices management

### Documentation
- `FINANCE_SYSTEM_DOCUMENTATION.md` - This comprehensive documentation

This system provides a complete, integrated finance management solution with proper data relationships, real-time synchronization, and a seamless user experience.