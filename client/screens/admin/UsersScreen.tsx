import React, { useState } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  Pressable,
  I18nManager,
  RefreshControl,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { Phone, Mail } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/lib/api";
import { Profile, UserRole } from "@/lib/types";
import { Spacing, BorderRadius } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const ROLE_FILTERS: { label: string; value: UserRole | "all" }[] = [
  { label: "الكل", value: "all" },
  { label: "مدير", value: "admin" },
  { label: "مُنسق", value: "dispatcher" },
  { label: "مطعم", value: "restaurant" },
  { label: "سائق", value: "driver" },
];

export default function UsersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [users, setUsers] = useState<Profile[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<UserRole | "all">("all");

  const loadUsers = async () => {
    try {
      // If API supports filtering by role:
      const roleFilter = filter === "all" ? undefined : filter;
      const data = await api.users.list(roleFilter);
      setUsers(data as any);
    } catch (error) {
      console.error("Failed to load users", error);
    }
  };

  React.useEffect(() => {
    loadUsers();
  }, [filter]);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadUsers();
    setRefreshing(false);
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

  const getRoleLabel = (role: string) => {
    const labels: Record<string, string> = {
      admin: "مدير",
      dispatcher: "مُنسق",
      restaurant: "مطعم",
      driver: "سائق",
    };
    return labels[role] || role;
  };

  const renderUserCard = ({ item }: { item: Profile }) => (
    <View
      style={[styles.userCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <View
          style={[styles.avatar, { backgroundColor: getRoleColor(item.role) }]}
        >
          <ThemedText type="h4" style={{ color: "#FFFFFF" }}>
            {item.fullName.charAt(0).toUpperCase()}
          </ThemedText>
        </View>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3">{item.fullName}</ThemedText>
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
          style={{ color: theme.textSecondary, marginRight: Spacing.sm }}
        >
          {item.email}
        </ThemedText>
      </View>

      <View style={styles.detailRow}>
        <Phone size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={{ color: theme.textSecondary, marginRight: Spacing.sm }}
        >
          {item.phoneNumber}
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
                filter === option.value ? theme.link : theme.backgroundDefault,
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
        data={users}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        keyExtractor={(item) => item.id.toString()}
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
    marginLeft: Spacing.md,
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
