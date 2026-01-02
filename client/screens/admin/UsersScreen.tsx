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
import {
  Phone,
  Mail,
  User,
  Shield,
  Briefcase,
  Truck,
  Utensils,
} from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/lib/api";
import { Profile, UserRole } from "@/lib/types";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

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
      const roleFilter = filter === "all" ? undefined : filter;
      const data = await api.users.list(roleFilter);
      // Safely map Supabase fields
      const mappedUsers = (data as any[]).map((u) => ({
        id: u.id,
        fullName: u.full_name || "مستخدم",
        role: u.role,
        email: u.email,
        phoneNumber: u.phone_number || "-",
      })) as Profile[];
      setUsers(mappedUsers);
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

  const getRoleInfo = (role: string) => {
    switch (role) {
      case "admin":
        return {
          color: "#EF4444",
          label: "مدير",
          icon: <Shield size={16} color="#EF4444" />,
        };
      case "dispatcher":
        return {
          color: theme.primary,
          label: "مُنسق",
          icon: <Briefcase size={16} color={theme.primary} />,
        };
      case "restaurant":
        return {
          color: "#F59E0B",
          label: "مطعم",
          icon: <Utensils size={16} color="#F59E0B" />,
        };
      case "driver":
        return {
          color: "#10B981",
          label: "سائق",
          icon: <Truck size={16} color="#10B981" />,
        };
      default:
        return {
          color: theme.textSecondary,
          label: role,
          icon: <User size={16} color={theme.textSecondary} />,
        };
    }
  };

  const renderUserCard = ({ item }: { item: Profile }) => {
    const roleInfo = getRoleInfo(item.role);
    return (
      <View
        style={[
          styles.userCard,
          { backgroundColor: theme.backgroundDefault, ...Shadows.sm },
        ]}
      >
        <View style={styles.cardHeader}>
          <View
            style={[styles.avatar, { backgroundColor: roleInfo.color + "15" }]}
          >
            <ThemedText type="h3" style={{ color: roleInfo.color }}>
              {(item.fullName || "U").charAt(0).toUpperCase()}
            </ThemedText>
          </View>
          <View style={{ flex: 1, marginRight: Spacing.md }}>
            <ThemedText type="h3">{item.fullName}</ThemedText>
            <View
              style={[
                styles.roleBadge,
                { backgroundColor: roleInfo.color + "10" },
              ]}
            >
              {roleInfo.icon}
              <ThemedText
                type="caption"
                style={{
                  color: roleInfo.color,
                  fontWeight: "700",
                  marginRight: 4,
                }}
              >
                {roleInfo.label}
              </ThemedText>
            </View>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.detailsContainer}>
          <View style={styles.detailRow}>
            <Mail size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={styles.detailText}>
              {item.email}
            </ThemedText>
          </View>
          <View style={styles.detailRow}>
            <Phone size={14} color={theme.textSecondary} />
            <ThemedText type="small" style={styles.detailText}>
              {item.phoneNumber}
            </ThemedText>
          </View>
        </View>
      </View>
    );
  };

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
        data={users}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderUserCard}
        ListHeaderComponent={
          <View style={styles.filterContainer}>
            {ROLE_FILTERS.map((option) => (
              <Pressable
                key={option.value}
                style={[
                  styles.filterChip,
                  {
                    backgroundColor:
                      filter === option.value
                        ? theme.primary
                        : theme.backgroundSecondary,
                  },
                ]}
                onPress={() => setFilter(option.value)}
              >
                <ThemedText
                  type="caption"
                  style={{
                    color: filter === option.value ? "#FFFFFF" : theme.text,
                    fontWeight: "700",
                  }}
                >
                  {option.label}
                </ThemedText>
              </Pressable>
            ))}
          </View>
        }
        ItemSeparatorComponent={() => <View style={styles.separator} />}
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
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
    borderRadius: BorderRadius.md,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    alignItems: "center",
    justifyContent: "center",
  },
  roleBadge: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    paddingHorizontal: Spacing.sm,
    paddingVertical: 4,
    borderRadius: BorderRadius.xs,
    marginTop: 6,
    gap: 4,
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginBottom: Spacing.md,
  },
  detailsContainer: {
    gap: Spacing.xs,
  },
  detailRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  detailText: {
    color: "#64748B",
    flex: 1,
  },
  separator: { height: Spacing.md },
});
