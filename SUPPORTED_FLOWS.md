# Supported User Flows

This document outlines the concrete steps users can perform in the SIM application, organized by feature area. Each flow indicates what functionality is currently supported and where dead ends occur.

## Authentication & Account Management

### ✅ User Registration
1. Navigate to `/register`
2. Fill in registration form (email, password, name, company)
3. Submit form
4. User is created and redirected to login

### ✅ User Login
1. Navigate to `/login`
2. Enter email and password
3. Submit form
4. User is authenticated and redirected to dashboard

### ✅ User Logout
1. Click user menu in header
2. Select "Sign Out"
3. User is logged out and redirected to home page

### ✅ View Profile
1. Click user menu in header
2. Select "Profile" or navigate to `/account`
3. View user profile information

### ✅ Edit Profile
1. Navigate to profile page
2. Click "Edit Profile" button
3. Update name, email, company, or department
4. Click "Save Changes"
5. Profile is updated

### ⚠️ Upload Avatar
1. Navigate to profile page
2. Click on avatar placeholder
3. **Dead End**: Avatar upload UI exists but backend implementation is incomplete

### ✅ View Settings
1. Click user menu in header
2. Select "Settings" or navigate to `/settings`
3. View settings tabs

### ⚠️ Update Settings
1. Navigate to settings page
2. Modify preferences
3. **Dead End**: Settings form exists but saving preferences may not persist correctly

### ⚠️ Change Password
1. Navigate to settings > Security tab
2. Enter current and new password
3. **Dead End**: Password change form exists but backend validation may fail

## Dashboard

### ✅ View Dashboard
1. Navigate to `/dashboard` (default after login)
2. View welcome message and stats grid
3. View service cards

### ✅ Navigate to Services
1. From dashboard, click any service card
2. User is redirected to the appropriate service page

## Product Browsing & Purchase

### ✅ View Product Catalog
1. Navigate to home page or click "View All Products"
2. Browse available SIM products
3. Filter by category or search

### ✅ View Product Details
1. Click on any product card
2. Navigate to `/products/sim/:productId`
3. View detailed product information

### ✅ Add to Cart
1. From product detail page, click "Add to Cart"
2. Product is added to cart
3. Cart count updates in header

### ✅ View Cart
1. Click cart icon in header or navigate to `/cart`
2. View cart items with quantities and prices
3. Update quantities or remove items

### ✅ Checkout Process
1. From cart, click "Proceed to Checkout"
2. Navigate to `/checkout`
3. Enter billing information
4. Select payment method
5. Review order summary
6. **Dead End**: Submit order button exists but payment processing is mocked

### ⚠️ Payment Confirmation
1. After checkout submission
2. Navigate to `/payment-confirmation`
3. **Dead End**: Page loads but order details may not display correctly

## Vessel Tracking

### ✅ Search Vessels
1. Navigate to `/vessels`
2. Use search bar to find vessels by name, IMO, or MMSI
3. View search results

### ✅ Start Vessel Tracking
1. From vessel search results, click "Track Vessel"
2. Navigate to tracking wizard
3. Select tracking criteria
4. Configure duration
5. Review and confirm
6. **Dead End**: Tracking submission exists but real-time updates are mocked

### ✅ View Active Trackings
1. Navigate to `/vessels/track`
2. View list of active vessel trackings
3. See tracking status and remaining duration

### ⚠️ Stop Tracking
1. From active trackings, click "Stop Tracking"
2. **Dead End**: Button exists but functionality may not work correctly

## Area Monitoring

### ✅ View Areas
1. Navigate to `/areas`
2. View list of monitored areas
3. See area statistics

### ✅ Create New Area
1. Click "Create New Area"
2. Define area boundaries on map
3. Configure monitoring criteria
4. Review costs
5. Submit area creation
6. **Dead End**: Area is created but real-time monitoring is mocked

### ⚠️ Edit Area
1. Click edit icon on area card
2. **Dead End**: Edit functionality is not fully implemented

### ⚠️ Delete Area
1. Click delete icon on area card
2. **Dead End**: Delete confirmation exists but may not work correctly

## Fleet Management

### ✅ View Fleets
1. Navigate to `/fleets`
2. View list of fleets
3. See fleet statistics

### ✅ Create Fleet
1. Click "Create Fleet"
2. Enter fleet name and description
3. Add vessels to fleet
4. Submit fleet creation

### ✅ View Fleet Details
1. Click on fleet card
2. Navigate to `/fleets/:fleetId`
3. View fleet vessels and details

### ⚠️ Edit Fleet
1. From fleet details, click "Edit Fleet"
2. **Dead End**: Edit modal opens but saving may not work correctly

### ⚠️ Delete Fleet
1. Click delete icon
2. **Dead End**: Delete functionality is not fully implemented

## Reports

### ✅ View Reports
1. Navigate to `/reports`
2. View list of generated reports
3. Filter by type or date range

### ✅ Generate New Report
1. Click "Generate Report"
2. Select report type
3. Select vessels or areas
4. Configure report parameters
5. Submit report generation
6. **Dead End**: Report generation is mocked, no actual PDF is created

### ⚠️ Download Report
1. Click download icon on report
2. **Dead End**: Download button exists but no file is downloaded

### ⚠️ View Report Details
1. Click on report card
2. Navigate to `/reports/:id`
3. **Dead End**: Report detail page may not load correctly

## Investigations

### ✅ View Investigations
1. Navigate to `/investigations`
2. View list of investigations
3. Filter by status

### ✅ Create Investigation
1. Click "New Investigation"
2. Navigate to investigation wizard
3. Select investigation scope
4. Configure details and objectives
5. Select intelligence sources
6. Review and submit
7. Investigation is created and user is redirected

### ⚠️ View Investigation Details
1. Click on investigation card
2. Navigate to `/investigations/:id`
3. **Dead End**: Investigation detail page exists but data may not load

## Credits & Billing

### ✅ View Credits
1. Navigate to `/credits`
2. View current credit balance
3. View credit usage history

### ⚠️ Purchase Credits
1. Click "Buy Credits"
2. Select credit package
3. **Dead End**: Purchase flow is not implemented

## Real-time Features

### ⚠️ WebSocket Connections
- WebSocket provider is initialized
- **Dead End**: No actual real-time data is transmitted

### ⚠️ Live Notifications
- Toast notifications are configured
- **Dead End**: No real-time alerts are triggered

## Not Implemented

The following features have UI elements but no functionality:

1. **Maritime Alerts**: Menu item exists but page is not implemented
2. **API Keys**: Settings tab exists but no API key management
3. **Billing Settings**: Tab exists but no billing management
4. **Help Center**: Link exists but shows "coming soon" message
5. **Two-Factor Authentication**: No 2FA setup available
6. **Email Notifications**: Preference exists but emails are not sent
7. **SMS Notifications**: Toggle exists but SMS is not configured
8. **Export Data**: No data export functionality
9. **Audit Logs**: No activity logging
10. **Team Management**: No multi-user support

## Technical Limitations

1. **Data Persistence**: All data is stored in memory and resets on server restart
2. **Authentication**: Uses mock JWT tokens with no real validation
3. **Payment Processing**: No actual payment gateway integration
4. **File Generation**: Reports and exports do not generate actual files
5. **Real-time Updates**: WebSocket connections exist but send no real data
6. **Search Functionality**: Limited to exact matches on mock data
7. **Pagination**: Not implemented for any list views
8. **Data Validation**: Minimal validation on forms
9. **Error Recovery**: Limited error handling and recovery flows
10. **Responsive Design**: Some pages may not work well on mobile devices