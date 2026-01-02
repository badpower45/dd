/**
 * Custom hook for real-time notifications
 */

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import supabaseApi, { Notification } from "@/lib/supabaseApi";
import { RealtimeChannel } from "@supabase/supabase-js";
import * as Notifications from "expo-notifications";

export function useRealtimeNotifications(
  userId: number | null,
  enabled: boolean = true,
) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const [latestNotification, setLatestNotification] =
    useState<Notification | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !userId) return;

    const subscription = supabaseApi.notifications.subscribeToNotifications(
      userId,
      async (notification: Notification) => {
        setLatestNotification(notification);

        // Show local notification
        await Notifications.scheduleNotificationAsync({
          content: {
            title: notification.title,
            body: notification.message,
            data: notification.data,
          },
          trigger: null, // Show immediately
        });

        // Invalidate notifications queries
        queryClient.invalidateQueries({ queryKey: ["notifications"] });
        queryClient.invalidateQueries({ queryKey: ["unread-count"] });
      },
    );

    setChannel(subscription);

    return () => {
      if (subscription) {
        supabaseApi.orders.unsubscribe(subscription);
      }
    };
  }, [enabled, userId, queryClient]);

  return { channel, latestNotification };
}
