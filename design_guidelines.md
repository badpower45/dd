# Delivery Management System - Design Guidelines

## Architecture Decisions

### Authentication
**Auth Required** - This is a multi-user system with distinct roles.

**Implementation:**
- Email/Password authentication (as specified)
- Login screen with email and password fields
- Role-based routing after successful authentication
- Persistent session management
- Include "Forgot Password" link on login screen
- Privacy policy & terms of service links (placeholder URLs)
- Account screen accessible from each role's interface with:
  - Log out (with confirmation alert)
  - Profile information (name, phone, role - read-only)
  - Change password option

### Navigation Structure

Each role has a distinct navigation architecture:

#### Restaurant Role (`/restaurant`)
**Tab Navigation** (2 tabs + floating action):
- Tab 1: My Orders (list view)
- Tab 2: Profile/Settings
- Floating Action Button: Create Order (primary action)

#### Dispatcher Role (`/dispatcher`)
**Tab Navigation** (3 tabs):
- Tab 1: Map (full-screen interactive map)
- Tab 2: Orders (pending orders list)
- Tab 3: Profile/Settings

#### Driver Role (`/driver`)
**Tab Navigation** (3 tabs):
- Tab 1: My Tasks (assigned orders list)
- Tab 2: Wallet (earnings dashboard)
- Tab 3: Profile/Settings

#### Admin Role (`/admin`)
**Tab Navigation** (4 tabs):
- Tab 1: Dashboard (overview metrics)
- Tab 2: Orders (all orders)
- Tab 3: Users (manage roles)
- Tab 4: Profile/Settings

## Screen Specifications

### Login Screen
- **Layout:** Stack-only (no tabs)
- **Header:** None
- **Content:**
  - App logo/branding at top (1/3 of screen)
  - Email input field
  - Password input field (with show/hide toggle)
  - Login button (full-width, primary color)
  - "Forgot Password?" link below button
  - Privacy policy and Terms links at bottom
- **Root View:** Scrollable form
- **Safe Area:** Top: insets.top + Spacing.xl, Bottom: insets.bottom + Spacing.xl

### Restaurant: Create Order Screen
- **Layout:** Modal presentation
- **Header:** Custom with "Cancel" (left) and "Create" (right) buttons, transparent background
- **Content:**
  - Scrollable form with sections:
    - Customer Information (Name, Phone 1, Phone 2)
    - Delivery Address (text input + map picker for geocoding)
    - Payment Details (Collection Amount input, auto-calculated Delivery Fee display)
  - All inputs with clear labels and validation feedback
- **Root View:** Scrollable form
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl

### Restaurant: My Orders List
- **Header:** Default navigation header with "My Orders" title, transparent
- **Content:**
  - Searchable list of order cards
  - Each card shows: Customer name, address, status badge, collection amount
  - Tap card to see order details (modal)
  - Pull-to-refresh enabled
- **Root View:** List view
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Dispatcher: Map Tab
- **Header:** None (full-screen map)
- **Content:**
  - Full-screen map with markers:
    - Green markers: Available drivers (with driver name)
    - Yellow markers: Pending orders (with customer address)
  - Floating legend card in top-right corner
  - Tap marker to show info card at bottom with "Assign Order" button
- **Root View:** Map container
- **Floating Elements:**
  - Legend card: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2
  - Info card: same shadow specs
- **Safe Area:** Top: insets.top + Spacing.xl

### Dispatcher: Orders List Tab
- **Header:** Default with "Pending Orders" title, search bar enabled
- **Content:**
  - List of pending order cards
  - Each card: Customer info, address, priority indicator
  - Tap to open assignment modal
- **Root View:** List view
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Dispatcher: Assignment Modal
- **Layout:** Bottom sheet modal (slides up from bottom)
- **Header:** Custom with "Cancel" (left) and "Assign" (right) buttons
- **Content:**
  - Order summary section
  - Driver selection dropdown (showing available drivers with distance)
  - Delivery window input (text or time picker)
- **Root View:** Scrollable form
- **Safe Area:** Bottom: insets.bottom + Spacing.xl

### Driver: My Tasks List
- **Header:** Default with "My Tasks" title, filter button (right)
- **Content:**
  - Segmented control: Active | Completed
  - List of task cards with:
    - Status badge (Assigned/Picked Up/Delivered)
    - Customer name, address snippet
    - Delivery window
    - Collection amount
  - Swipe actions: "Mark Picked Up" or "Mark Delivered"
- **Root View:** List view
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

### Driver: Task Detail Screen
- **Header:** Custom with back button (left) and "Open in Maps" (right)
- **Content:**
  - Customer info card
  - Map preview showing customer location
  - Collection amount display (large, emphasized)
  - Action buttons at bottom:
    - "Mark as Picked Up" (if status is 'assigned')
    - "Mark as Delivered" (if status is 'picked_up')
- **Root View:** Scrollable
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: insets.bottom + Spacing.xl

### Driver: Wallet Tab
- **Header:** Default with "My Wallet" title
- **Content:**
  - Large card showing today's total collections
  - Breakdown list: Order ID, customer name, amount
  - Date range selector at top
- **Root View:** Scrollable
- **Safe Area:** Top: headerHeight + Spacing.xl, Bottom: tabBarHeight + Spacing.xl

## Design System

### Color Palette
- **Primary:** #2563EB (Blue) - for primary actions, active states
- **Background:** #FFFFFF (Light mode), #1F2937 (Dark mode support)
- **Surface:** #F9FAFB (Light gray for cards)
- **Text Primary:** #111827
- **Text Secondary:** #6B7280

**Status Colors:**
- Pending: #EAB308 (Yellow/Amber)
- Assigned: #3B82F6 (Blue)
- Picked Up: #F97316 (Orange)
- Delivered: #10B981 (Green)
- Cancelled: #EF4444 (Red)

### Typography
- **Headings:** System font, Semi-Bold (600)
  - H1: 28px (page titles)
  - H2: 20px (section headers)
  - H3: 16px (card titles)
- **Body:** System font, Regular (400)
  - Large: 16px (primary content)
  - Regular: 14px (secondary content)
  - Small: 12px (captions, metadata)
- **Labels:** System font, Medium (500), 14px

### Spacing Scale
- xs: 4px
- sm: 8px
- md: 12px
- lg: 16px
- xl: 24px
- 2xl: 32px

### Component Specifications

**Order Cards:**
- White background with 1px gray border
- 16px padding
- 12px border radius
- Status badge in top-right corner
- Customer name (H3), address (body regular), amount (body large, bold)

**Status Badges:**
- Pill-shaped (fully rounded corners)
- 6px vertical, 12px horizontal padding
- Background: Status color at 10% opacity
- Text: Status color at 100% opacity, 12px, medium weight

**Action Buttons:**
- Primary: Solid fill with primary color, white text, 48px height, 12px border radius
- Secondary: 1px border with primary color, primary text, 48px height, 12px border radius
- Full-width on mobile
- Visual feedback: 80% opacity on press

**Floating Action Button:**
- 56x56px circle
- Primary color background
- White icon (Lucide plus icon)
- Position: bottom-right, 16px from edges
- Shadow: shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.10, shadowRadius: 2

**Form Inputs:**
- 48px height
- 12px border radius
- 1px border (#E5E7EB)
- 12px horizontal padding
- Active state: 2px border with primary color
- Error state: 2px border with red (#EF4444)

**Map Markers:**
- Custom markers using Lucide icons
- Driver markers: user icon in green circle
- Order markers: map-pin icon in yellow circle
- 40x40px size

### Interaction Design
- All touchable elements: opacity 0.8 on press
- Pull-to-refresh on all list views
- Swipe-to-delete/action on order cards (where applicable)
- Loading states: System activity indicator with primary color
- Empty states: Lucide icon + message + optional CTA button
- Confirmation alerts for destructive actions (cancel order, logout)

### Accessibility
- All interactive elements minimum 44x44px touch target
- Form inputs with proper labels and error messages
- Status conveyed through both color and text/icons
- Map elements with accessibility labels
- VoiceOver/TalkBack support for all navigation elements
- High contrast mode support for status colors