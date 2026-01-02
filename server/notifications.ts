import Expo from "expo-server-sdk";

// Create Expo SDK client
const expo = new Expo();

interface PushMessage {
  to: string;
  title: string;
  body: string;
  data?: Record<string, unknown>;
  sound?: "default" | null;
  badge?: number;
  priority?: "default" | "normal" | "high";
}

/**
 * Send push notification to a single recipient
 */
export async function sendPushNotification(
  pushToken: string,
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<boolean> {
  // Validate Expo push token
  if (!Expo.isExpoPushToken(pushToken)) {
    console.error(`Invalid Expo push token: ${pushToken}`);
    return false;
  }

  const message: PushMessage = {
    to: pushToken,
    title,
    body,
    data,
    sound: "default",
    priority: "high",
  };

  try {
    const chunks = expo.chunkPushNotifications([message]);

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      console.log("Push notification sent:", ticketChunk);
    }

    return true;
  } catch (error) {
    console.error("Failed to send push notification:", error);
    return false;
  }
}

/**
 * Send push notification to multiple recipients
 */
export async function sendBulkPushNotifications(
  pushTokens: string[],
  title: string,
  body: string,
  data?: Record<string, unknown>,
): Promise<number> {
  const validTokens = pushTokens.filter((token) => Expo.isExpoPushToken(token));

  if (validTokens.length === 0) {
    console.log("No valid push tokens to send to");
    return 0;
  }

  const messages: PushMessage[] = validTokens.map((token) => ({
    to: token,
    title,
    body,
    data,
    sound: "default",
    priority: "high",
  }));

  try {
    const chunks = expo.chunkPushNotifications(messages);
    let sentCount = 0;

    for (const chunk of chunks) {
      const ticketChunk = await expo.sendPushNotificationsAsync(chunk);
      sentCount += ticketChunk.length;
    }

    console.log(`Sent ${sentCount} push notifications`);
    return sentCount;
  } catch (error) {
    console.error("Failed to send bulk push notifications:", error);
    return 0;
  }
}

// Notification templates for common events
export const NotificationTemplates = {
  orderAssigned: (orderId: number) => ({
    title: "📦 طلب جديد!",
    body: `تم تعيينك لتوصيل الطلب #${orderId}`,
    data: { type: "order_assigned", orderId },
  }),

  orderPickedUp: (orderId: number) => ({
    title: "🚗 تم استلام الطلب",
    body: `الطلب #${orderId} في الطريق للعميل`,
    data: { type: "order_picked_up", orderId },
  }),

  orderDelivered: (orderId: number) => ({
    title: "✅ تم التوصيل",
    body: `الطلب #${orderId} تم توصيله بنجاح`,
    data: { type: "order_delivered", orderId },
  }),

  orderCancelled: (orderId: number) => ({
    title: "❌ طلب ملغي",
    body: `الطلب #${orderId} تم إلغاؤه`,
    data: { type: "order_cancelled", orderId },
  }),
};
