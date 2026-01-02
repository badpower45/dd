import React, { useState, useEffect } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  Pressable,
  I18nManager,
} from "react-native";
import { Bell, BellOff, Settings } from "lucide-react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Spacing, BorderRadius } from "@/constants/theme";
import { api } from "@/lib/api";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Notification {
  id: number;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  is_read: boolean;
  read_at: Date | null;
  created_at: Date;
}

export default function NotificationsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadNotifications();
  }, []);

  const loadNotifications = async () => {
    try {
      // This will be implemented with actual API
      setLoading(false);
    } catch (error) {
      console.error("Failed to load notifications:", error);
      setLoading(false);
    }
  };

  const markAsRead = async (id: number) => {
    // Mark notification as read
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)),
    );
  };

  const markAllAsRead = async () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return theme.danger;
      case "medium":
        return theme.warning;
      default:
        return theme.textSecondary;
    }
  };

  return (
    <ThemedView style={styles.container}>
      <View style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}>
        <ThemedText type="h2">الإشعارات</ThemedText>
        <View style={styles.headerActions}>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
            onPress={markAllAsRead}
          >
            <BellOff size={22} color={theme.text} />
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.iconButton,
              { opacity: pressed ? 0.7 : 1 },
            ]}
          >
            <Settings size={22} color={theme.text} />
          </Pressable>
        </View>
      </View>

      <ScrollView
        style={styles.list}
        contentContainerStyle={styles.listContent}
      >
        {notifications.length === 0 ? (
          <View style={styles.empty}>
            <Bell size={48} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.md }}
            >
              لا توجد إشعارات
            </ThemedText>
          </View>
        ) : (
          notifications.map((notification) => (
            <Pressable
              key={notification.id}
              onPress={() => markAsRead(notification.id)}
              style={({ pressed }) => [
                styles.notificationItem,
                {
                  backgroundColor: notification.is_read
                    ? theme.backgroundDefault
                    : theme.backgroundSecondary,
                  borderColor: theme.border,
                  opacity: pressed ? 0.8 : 1,
                },
              ]}
            >
              <View
                style={[
                  styles.priorityIndicator,
                  { backgroundColor: getPriorityColor(notification.priority) },
                ]}
              />
              <View style={styles.notificationContent}>
                <ThemedText type="h4">{notification.title}</ThemedText>
                <ThemedText
                  type="small"
                  style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
                >
                  {notification.message}
                </ThemedText>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
                >
                  {new Date(notification.created_at).toLocaleString("ar-EG")}
                </ThemedText>
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  headerActions: {
    flexDirection: "row",
    gap: Spacing.sm,
  },
  iconButton: {
    padding: Spacing.sm,
  },
  list: {
    flex: 1,
  },
  listContent: {
    padding: Spacing.lg,
    gap: Spacing.md,
  },
  empty: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing["4xl"],
  },
  notificationItem: {
    flexDirection: "row",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    overflow: "hidden",
  },
  priorityIndicator: {
    width: 4,
    marginRight: Spacing.md,
    borderRadius: 2,
  },
  notificationContent: {
    flex: 1,
  },
});
