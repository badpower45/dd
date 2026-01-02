import React, { useState, useEffect } from "react";
import { View, StyleSheet, ScrollView, Pressable, Alert } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Smartphone, Clock, MapPin, Trash2 } from "lucide-react-native";
import { ThemedView } from "@/components/ThemedView";
import { ThemedText } from "@/components/ThemedText";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import {
  getUserSessions,
  endSession,
  endOtherSessions,
} from "@/lib/sessionManagement";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Session {
  id: string;
  device_name: string;
  device_type: string;
  ip_address: string;
  last_activity: string;
  created_at: string;
}

export default function SessionsScreen() {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const { user } = useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadSessions();
  }, []);

  const loadSessions = async () => {
    if (!user) return;
    setLoading(true);
    const data = await getUserSessions(user.id);
    setSessions(data);
    setLoading(false);
  };

  const handleEndSession = async (sessionId: string) => {
    Alert.alert("إنهاء الجلسة", "هل أنت متأكد أنك تريد إنهاء هذه الجلسة؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "إنهاء",
        style: "destructive",
        onPress: async () => {
          await endSession(sessionId);
          loadSessions();
        },
      },
    ]);
  };

  const handleEndOtherSessions = async () => {
    if (!user) return;

    Alert.alert(
      "إنهاء الجلسات الأخرى",
      "سيتم إنهاء جميع الجلسات الأخرى وسيتم تسجيل خروجك من جميع الأجهزة الأخرى",
      [
        { text: "إلغاء", style: "cancel" },
        {
          text: "إنهاء الجميع",
          style: "destructive",
          onPress: async () => {
            const currentSessionId = sessions[0]?.id; // Assume first is current
            await endOtherSessions(user.id, currentSessionId);
            loadSessions();
          },
        },
      ],
    );
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "الآن";
    if (minutes < 60) return `منذ ${minutes} دقيقة`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `منذ ${hours} ساعة`;
    const days = Math.floor(hours / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[
          styles.content,
          { paddingTop: insets.top + Spacing.lg },
        ]}
      >
        <ThemedText type="h1" style={styles.title}>
          الجلسات النشطة
        </ThemedText>

        <ThemedText
          type="body"
          style={[styles.subtitle, { color: theme.textSecondary }]}
        >
          إدارة الأجهزة المتصلة بحسابك
        </ThemedText>

        {sessions.length > 1 && (
          <Pressable
            onPress={handleEndOtherSessions}
            style={({ pressed }) => [
              styles.endAllButton,
              {
                backgroundColor: theme.danger + "20",
                borderColor: theme.danger,
                opacity: pressed ? 0.7 : 1,
              },
            ]}
          >
            <Trash2 size={18} color={theme.danger} />
            <ThemedText
              type="small"
              style={{ color: theme.danger, marginLeft: Spacing.xs }}
            >
              إنهاء جميع الجلسات الأخرى
            </ThemedText>
          </Pressable>
        )}

        <View style={styles.sessions}>
          {sessions.map((session, index) => (
            <View
              key={session.id}
              style={[
                styles.sessionCard,
                {
                  backgroundColor: theme.backgroundSecondary,
                  borderColor: theme.border,
                },
              ]}
            >
              <View style={styles.sessionHeader}>
                <View style={styles.sessionIcon}>
                  <Smartphone size={24} color={theme.primary} />
                </View>
                <View style={styles.sessionInfo}>
                  <ThemedText type="h4">
                    {session.device_name}
                    {index === 0 && (
                      <ThemedText
                        type="caption"
                        style={{
                          color: theme.success,
                          marginLeft: Spacing.sm,
                        }}
                      >
                        {" "}
                        (الحالي)
                      </ThemedText>
                    )}
                  </ThemedText>
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary, marginTop: 4 }}
                  >
                    {session.device_type.toUpperCase()}
                  </ThemedText>
                </View>
                {index !== 0 && (
                  <Pressable
                    onPress={() => handleEndSession(session.id)}
                    style={({ pressed }) => [
                      styles.endButton,
                      {
                        backgroundColor: theme.danger + "20",
                        opacity: pressed ? 0.7 : 1,
                      },
                    ]}
                  >
                    <Trash2 size={16} color={theme.danger} />
                  </Pressable>
                )}
              </View>

              <View style={styles.sessionDetails}>
                <View style={styles.detailRow}>
                  <Clock size={14} color={theme.textSecondary} />
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary, marginLeft: 4 }}
                  >
                    {formatDate(session.last_activity)}
                  </ThemedText>
                </View>
                <View style={styles.detailRow}>
                  <MapPin size={14} color={theme.textSecondary} />
                  <ThemedText
                    type="caption"
                    style={{ color: theme.textSecondary, marginLeft: 4 }}
                  >
                    {session.ip_address || "غير معروف"}
                  </ThemedText>
                </View>
              </View>
            </View>
          ))}
        </View>

        {sessions.length === 0 && !loading && (
          <View style={styles.emptyState}>
            <Smartphone size={48} color={theme.textSecondary} />
            <ThemedText
              type="body"
              style={{ color: theme.textSecondary, marginTop: Spacing.md }}
            >
              لا توجد جلسات نشطة
            </ThemedText>
          </View>
        )}
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  title: {
    marginBottom: Spacing.sm,
  },
  subtitle: {
    marginBottom: Spacing.xl,
  },
  endAllButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    marginBottom: Spacing.lg,
  },
  sessions: {
    gap: Spacing.md,
  },
  sessionCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  sessionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  sessionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionInfo: {
    flex: 1,
    marginLeft: Spacing.md,
  },
  endButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  sessionDetails: {
    flexDirection: "row",
    gap: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
