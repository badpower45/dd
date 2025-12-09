import React from "react";
import { View, StyleSheet, Alert, Pressable, ScrollView } from "react-native";
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
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user, signOut } = useAuth();

  const handleLogout = () => {
    Alert.alert("Sign Out", "Are you sure you want to sign out?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Sign Out",
        style: "destructive",
        onPress: signOut,
      },
    ]);
  };

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "Administrator",
      dispatcher: "Dispatcher",
      restaurant: "Restaurant",
      driver: "Driver",
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
              {user?.full_name?.charAt(0).toUpperCase() || "U"}
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
              style={{ color: getRoleColor(user?.role || ""), fontWeight: "600" }}
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
            ACCOUNT INFORMATION
          </ThemedText>

          <View
            style={[styles.card, { backgroundColor: theme.backgroundDefault }]}
          >
            <View style={styles.cardRow}>
              <View style={styles.cardIcon}>
                <User size={20} color={theme.textSecondary} />
              </View>
              <View style={styles.cardContent}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Full Name
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
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Email
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
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Phone
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
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Role
                </ThemedText>
                <ThemedText type="body">
                  {getRoleLabel(user?.role || "")}
                </ThemedText>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <ThemedText
            type="caption"
            style={[styles.sectionTitle, { color: theme.textSecondary }]}
          >
            ACTIONS
          </ThemedText>

          <Pressable
            style={({ pressed }) => [
              styles.actionButton,
              { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
            ]}
            onPress={handleLogout}
          >
            <View style={styles.actionButtonContent}>
              <LogOut size={20} color="#EF4444" />
              <ThemedText type="body" style={{ color: "#EF4444", marginLeft: Spacing.md }}>
                Sign Out
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
    marginLeft: Spacing.xs,
    fontWeight: "600",
  },
  card: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
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
    marginLeft: 56,
  },
  actionButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  actionButtonContent: {
    flexDirection: "row",
    alignItems: "center",
  },
});
