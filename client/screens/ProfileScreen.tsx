import React from "react";
import {
  View,
  StyleSheet,
  Alert,
  Pressable,
  ScrollView,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import {
  User,
  Phone,
  Mail,
  Shield,
  LogOut,
  ChevronRight,
} from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { LanguageSwitcher } from "@/components/LanguageSwitcher";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert("تسجيل الخروج", "هل أنت متأكد أنك تريد تسجيل الخروج؟", [
      { text: "إلغاء", style: "cancel" },
      {
        text: "تسجيل الخروج",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "مدير",
      dispatcher: "مُنسق",
      restaurant: "مطعم",
      driver: "سائق",
    };
    return labels[role] || role;
  };

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "#EF4444",
      dispatcher: "#3B82F6",
      restaurant: "#F97316",
      driver: "#10B981",
    };
    return colors[role] || theme.link;
  };

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.xl,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
      >
        <View style={styles.profileHeader}>
          <View
            style={[
              styles.avatar,
              { backgroundColor: getRoleColor(user?.role || "") },
            ]}
          >
            <ThemedText type="h1" style={{ color: "#FFFFFF" }}>
              {user?.full_name?.charAt(0) || "م"}
            </ThemedText>
          </View>
          <ThemedText type="h2" style={styles.userName}>
            {user?.full_name}
          </ThemedText>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: `${getRoleColor(user?.role || "")}20` },
            ]}
          >
            <ThemedText
              type="small"
              style={{
                color: getRoleColor(user?.role || ""),
                fontWeight: "600",
              }}
            >
              {getRoleLabel(user?.role || "")}
            </ThemedText>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="caption"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            معلومات الحساب
          </ThemedText>

          <View
            style={[
              styles.card,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
              },
              Shadows.sm,
            ]}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <User size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  الاسم الكامل
                </ThemedText>
                <ThemedText type="body">{user?.full_name}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Mail size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  البريد الإلكتروني
                </ThemedText>
                <ThemedText type="body">{user?.email}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Phone size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  رقم الهاتف
                </ThemedText>
                <ThemedText type="body">{user?.phone_number}</ThemedText>
              </View>
            </View>

            <View style={[styles.divider, { backgroundColor: theme.border }]} />

            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <Shield size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  الدور
                </ThemedText>
                <ThemedText type="body">
                  {getRoleLabel(user?.role || "")}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        {/* Language Section */}
        <View style={styles.section}>
          <ThemedText
            type="caption"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            اللغة
          </ThemedText>
          <LanguageSwitcher />
        </View>

        {/* Settings Section */}
        <View style={styles.section}>
          <ThemedText
            type="caption"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            الإعدادات
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              {
                backgroundColor: theme.backgroundDefault,
                borderColor: theme.border,
                opacity: pressed ? 0.8 : 1,
              },
              Shadows.sm,
            ]}
            onPress={handleLogout}
          >
            <View style={styles.actionButtonContent}>
              <LogOut size={20} color="#EF4444" />
              <ThemedText
                type="body"
                style={{ color: "#EF4444", marginRight: Spacing.md }}
              >
                تسجيل الخروج
              </ThemedText>
            </View>
            <ChevronRight size={20} color={theme.textSecondary} />
          </Pressable>
        </View>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    paddingHorizontal: Spacing.lg,
  },
  profileHeader: {
    alignItems: "center",
    marginBottom: Spacing["2xl"],
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
  userName: {
    marginBottom: Spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
  },
  section: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginRight: Spacing.xs,
    fontWeight: "600",
    textAlign: "right",
  },
  card: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    borderWidth: 1,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    padding: Spacing.lg,
  },
  cardIcon: {
    width: 40,
    alignItems: "center",
  },
  cardContent: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginRight: 56,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
