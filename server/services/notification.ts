import { Expo } from 'expo-server-sdk';

// Create a new Expo SDK client
// optionally providing an access token if you have enabled push security
const expo = new Expo();

export async function sendPushNotification(pushToken: string, title: string, body: string, data?: any) {
    // Check that all your push tokens appear to be valid Expo push tokens
    if (!Expo.isExpoPushToken(pushToken)) {
        console.error(`Push token ${pushToken} is not a valid Expo push token`);
        return;
    }

    const messages = [{
        to: pushToken,
        sound: 'default',
        title: title,
        body: body,
        data: data,
    }];

    try {
        const chunks = expo.chunkPushNotifications(messages as any);
        const tickets = [];
        for (const chunk of chunks) {
            try {
                const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
                tickets.push(...ticketChunk);
            } catch (error) {
                console.error("Error sending push notification chunk", error);
            }
        }
        console.log("Notification sent successfully", tickets);
        return tickets;
    } catch (error) {
        console.error("Error sending push notification", error);
    }
}
