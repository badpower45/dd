# API Reference

## Authentication

### Login
```typescript
const user = await supabaseApi.auth.login(email, password);
```

### Register
```typescript
const user = await supabaseApi.auth.register({
  email: 'user@example.com',
  password: 'password123',
  role: 'restaurant',
  full_name: 'John Doe',
  phone_number: '0501234567'
});
```

## Orders

### Create Order
```typescript
const order = await supabaseApi.orders.create({
  customer_name: 'Ahmed',
  customer_phone: '0501234567',
  delivery_address: 'Riyadh, King Fahd Road',
  delivery_lat: '24.7136',
  delivery_lng: '46.6753',
  restaurant_id: 1,
  collection_amount: 150,
  delivery_fee: 20,
  notes: 'Please call before arriving'
});
```

### Get Orders
```typescript
// All orders
const orders = await supabaseApi.orders.list();

// Restaurant orders
const orders = await supabaseApi.orders.list({ restaurantId: 1 });

// Driver orders
const orders = await supabaseApi.orders.list({ driverId: 2 });

// Pending orders
const orders = await supabaseApi.orders.getPending();
```

### Update Order
```typescript
const order = await supabaseApi.orders.update(orderId, {
  status: 'delivered',
  proof_image_url: 'https://...'
});
```

### Assign Driver
```typescript
const order = await supabaseApi.orders.assignDriver(orderId, driverId);
```

## Users

### Get Users
```typescript
// All users
const users = await supabaseApi.users.list();

// Drivers only
const drivers = await supabaseApi.users.list('driver');

// Active users only
const users = await supabaseApi.users.list(undefined, true);
```

### Update User
```typescript
const user = await supabaseApi.users.update(userId, {
  full_name: 'New Name',
  phone_number: '0501234567'
});
```

### Update Location
```typescript
const user = await supabaseApi.users.updateLocation(userId, '24.7136', '46.6753');
```

## Drivers

### Get Active Drivers
```typescript
const drivers = await supabaseApi.drivers.getActive();
```

### Get Driver Stats
```typescript
const stats = await supabaseApi.drivers.getStats(driverId);
```

## Analytics

### Restaurant Stats
```typescript
const stats = await supabaseApi.analytics.getRestaurantStats(restaurantId);
// Returns: { todayOrders, totalCollection, activeDeliveries, thisWeek, thisMonth }
```

### Daily Stats
```typescript
const stats = await supabaseApi.analytics.getDailyStats();
// Returns: { collections, commissions, pendingOrders, activeDrivers, todayRevenue }
```

### Driver Performance
```typescript
const performance = await supabaseApi.analytics.getDriverPerformance(driverId, 30);
// Returns: { totalDeliveries, totalEarnings, avgRating, ratingCount }
```

## Transactions

### List Transactions
```typescript
// All transactions
const transactions = await supabaseApi.transactions.list();

// User transactions
const transactions = await supabaseApi.transactions.list(userId);

// Limited results
const transactions = await supabaseApi.transactions.list(userId, 10);
```

### Create Transaction
```typescript
const transaction = await supabaseApi.transactions.create({
  user_id: userId,
  order_id: orderId,
  amount: 150,
  type: 'payment',
  description: 'Order payment'
});
```

## Ratings

### Create Rating
```typescript
const rating = await supabaseApi.ratings.create({
  order_id: orderId,
  driver_id: driverId,
  restaurant_id: restaurantId,
  rating: 5,
  comment: 'Excellent service!'
});
```

### Get Driver Ratings
```typescript
const { ratings, average, count } = await supabaseApi.ratings.getByDriver(driverId);
```

## Notifications

### List Notifications
```typescript
const notifications = await supabaseApi.notifications.list(userId);
```

### Mark as Read
```typescript
await supabaseApi.notifications.markAsRead(notificationId);
```

### Mark All as Read
```typescript
await supabaseApi.notifications.markAllAsRead(userId);
```

### Get Unread Count
```typescript
const count = await supabaseApi.notifications.getUnreadCount(userId);
```

## Customers

### Lookup Customer
```typescript
const customer = await supabaseApi.customers.lookup('0501234567');
// Returns: { name, address, lat, lng } or null
```

### Get Customer History
```typescript
const orders = await supabaseApi.customers.getHistory('0501234567', 10);
```

## React Query Hooks

### Orders
```typescript
// List orders
const { data: orders, isLoading, refetch } = useOrders({ 
  restaurantId: userId 
});

// Get single order
const { data: order } = useOrder(orderId);

// Pending orders
const { data: pendingOrders } = usePendingOrders();

// Create order
const createOrder = useCreateOrder();
await createOrder.mutateAsync(orderData);

// Update order
const updateOrder = useUpdateOrder();
await updateOrder.mutateAsync({ id: orderId, updates: { status: 'delivered' } });

// Assign driver
const assignDriver = useAssignDriver();
await assignDriver.mutateAsync({ orderId, driverId });
```

### Users
```typescript
// List users
const { data: users } = useUsers('driver');

// Get user
const { data: user } = useUser(userId);

// Update user
const updateUser = useUpdateUser();
await updateUser.mutateAsync({ id: userId, updates: { full_name: 'New Name' } });

// Update location
const updateLocation = useUpdateLocation();
await updateLocation.mutateAsync({ id: userId, lat: '24.7136', lng: '46.6753' });
```

### Analytics
```typescript
// Restaurant stats
const { data: stats } = useRestaurantStats(restaurantId);

// Daily stats
const { data: dailyStats } = useDailyStats();

// Driver performance
const { data: performance } = useDriverPerformance(driverId, 30);
```

### Realtime
```typescript
// Enable realtime order updates
useRealtimeOrders(true);

// Enable realtime notifications
const { latestNotification } = useRealtimeNotifications(userId, true);
```

## Realtime Subscriptions

### Subscribe to Orders
```typescript
const channel = supabaseApi.orders.subscribeToOrders((order) => {
  console.log('Order updated:', order);
});

// Cleanup
supabaseApi.orders.unsubscribe(channel);
```

### Subscribe to Notifications
```typescript
const channel = supabaseApi.notifications.subscribeToNotifications(userId, (notification) => {
  console.log('New notification:', notification);
});

// Cleanup
supabaseApi.orders.unsubscribe(channel);
```

## Error Handling

All API functions throw errors that can be caught:

```typescript
try {
  const order = await supabaseApi.orders.create(orderData);
} catch (error) {
  console.error('Failed to create order:', error.message);
  // Handle error
}
```

With React Query:

```typescript
const createOrder = useCreateOrder();

const handleSubmit = async () => {
  try {
    await createOrder.mutateAsync(orderData);
    // Success
  } catch (error) {
    // Error handled
  }
};

// Or use mutation states
if (createOrder.isError) {
  console.error(createOrder.error);
}
```
