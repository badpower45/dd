import React, { useState } from "react";
import { View, FlatList, StyleSheet, Pressable } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { User, Phone, Mail, Shield } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { Profile, UserRole } from "@/lib/types";
import { Spacing, BorderRadius } from "@/constants/theme";

const DEMO_USERS: Profile[] = [
  {
    id: "admin-001",
    role: "admin",
    full_name: "Admin User",
    phone_number: "+1234567890",
    email: "admin@demo.com",
  },
  {
    id: "dispatcher-001",
    role: "dispatcher",
    full_name: "Sarah Dispatcher",
    phone_number: "+1234567891",
    email: "dispatcher@demo.com",
  },
  {
    id: "restaurant-001",
    role: "restaurant",
    full_name: "Pizza Palace",
    phone_number: "+1234567892",
    email: "restaurant@demo.com",
  },
  {
    id: "driver-001",
    role: "driver",
    full_name: "John Driver",
    phone_number: "+1234567893",
    email: "driver@demo.com",
  },
  {
    id: "driver-002",
    role: "driver",
    full_name: "Sarah Smith",
    phone_number: "+1234567894",
    email: "sarah@demo.com",
  },
  {
    id: "driver-003",
    role: "driver",
    full_name: "Mike Johnson",
    phone_number: "+1234567895",
    email: "mike@demo.com",
  },
];

const ROLE_FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "All", value: "all" },
  { label: "Admin", value: "admin" },
  { label: "Dispatcher", value: "dispatcher" },
  { label: "Restaurant", value: "restaurant" },
  { label: "Driver", value: "driver" },
];

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [filter, setFilter] = useState<UserRole | "all">("all");

  const filteredUsers =
    filter === "all" ? DEMO_USERS : DEMO_USERS.filter((u) => u.role === filter);

  const getRoleColor = (role: string) => {
    const colors: Record<string, string> = {
      admin: "#EF4444",
      dispatcher: "#3B82F6",
      restaurant: "#F97316",
      driver: "#10B981",
    };
    return colors[role] || theme.link;
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

  const renderUserCard = ({ item }: { item: Profile }) => (
    <View
      style={[styles.userCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[
            styles.avatar,
            { backgroundColor: getRoleColor(item.role) },
          ]}
        >
          <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
            {item.full_name.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3">{item.full_name}</ThemedText>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: `${getRoleColor(item.role)}20` },
            ]}
          >
            <ThemedText
              type="caption"
              style={{ color: getRoleColor(item.role), fontWeight: "600" }}
            >
              {getRoleLabel(item.role)}
            </ThemedText>
          </View>
        </View>
      </View>

      <View style={styles.detailRow}>
        <Mail size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
        >
          {item.email}
        </ThemedText>
      </View>

      <View style={styles.detailRow}>
        <Phone size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginLeft: Spacing.sm }}
        >
          {item.phone_number}
        </ThemedText>
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      {ROLE_FILTERS.map((option) => (
        <Pressable
          key={option.value}
          style={[
            styles.filterChip,
            {
              backgroundColor:
                filter === option.value
                  ? theme.link
                  : theme.backgroundDefault,
            },
          ]}
          onPress={() => setFilter(option.value)}
        >
          <ThemedText
            type="caption"
            style={{
              color: filter === option.value ? "#FFFFFF" : theme.text,
              fontWeight: "600",
            }}
          >
            {option.label}
          </ThemedText>
        </Pressable>
      ))}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredUsers}
        keyExtractor={(item) => item.id}
        renderItem={renderUserCard}
        ListHeaderComponent={renderHeader}
        ItemSeparatorComponent={() => <View style={styles.separator} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
  },
  filterContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  userCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
    marginRight: Spacing.md,
  },
  roleBadge: {
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  separator: {
    height: Spacing.md,
  },
});
