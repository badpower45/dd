import * as Device from 'expo-device';
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';


// Configure notification handler
Notifications.setNotificationHandler({
    handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: true,
        shouldShowBanner: true,
        shouldShowList: true,
    }),
});

export interface NotificationData {
    type: 'order_assigned' | 'order_picked_up' | 'order_delivered' | 'order_cancelled';
    orderId?: number;
    message: string;
}

export async function registerForPushNotifications(): Promise<string | null> {
    if (!Device.isDevice) {
        console.log('Push notifications require a physical device');
        return null;
    }

    // Check existing permissions
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    // Request permissions if not granted
    if (existingStatus !== 'granted') {
        const { status } = await Notifications.requestPermissionsAsync();
        finalStatus = status;
    }

    if (finalStatus !== 'granted') {
        console.log('Push notification permissions not granted');
        return null;
    }

    // Get Expo push token
    try {
        const tokenData = await Notifications.getExpoPushTokenAsync({
            projectId: 'your-project-id', // Will be auto-filled by EAS
        });

        console.log('Push token:', tokenData.data);
        return tokenData.data;
    } catch (error) {
        console.error('Failed to get push token:', error);
        return null;
    }
}

export async function savePushToken(userId: number, token: string): Promise<void> {
    try {
        const response = await fetch(`${getBaseUrl()}/api/users/${userId}`, {
            method: 'PATCH',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ pushToken: token }),
        });
        if (!response.ok) {
            throw new Error('Failed to save push token');
        }
        console.log('Push token saved successfully');
    } catch (error) {
        console.error('Failed to save push token:', error);
    }
}

function getBaseUrl(): string {
    // This should match the API base URL
    if (typeof window !== 'undefined') {
        return 'http://localhost:5001';
    }
    return 'http://localhost:5001';
}

export function addNotificationListener(
    callback: (notification: Notifications.Notification) => void
): Notifications.Subscription {
    return Notifications.addNotificationReceivedListener(callback);
}

export function addNotificationResponseListener(
    callback: (response: Notifications.NotificationResponse) => void
): Notifications.Subscription {
    return Notifications.addNotificationResponseReceivedListener(callback);
}

// Configure Android channel
if (Platform.OS === 'android') {
    Notifications.setNotificationChannelAsync('default', {
        name: 'DeliverEase',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#FF6B00',
    });
}
