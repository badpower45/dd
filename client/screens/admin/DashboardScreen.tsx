import React, { useState, useCallback } from "react";
import { View, ScrollView, StyleSheet, RefreshControl } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  TrendingUp,
  Users,
} from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { getOrders, seedDemoOrders } from "@/lib/storage";
import { Order } from "@/lib/types";
import { Spacing, BorderRadius, Shadows, StatusColors } from "@/constants/theme";

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      await seedDemoOrders("restaurant-001");
      const data = await getOrders();
      setOrders(data);
    } catch (error) {
      console.error("Error loading dashboard data:", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const stats = {
    total: orders.length,
    pending: orders.filter((o) => o.status === "pending").length,
    assigned: orders.filter((o) => o.status === "assigned").length,
    pickedUp: orders.filter((o) => o.status === "picked_up").length,
    delivered: orders.filter((o) => o.status === "delivered").length,
    totalRevenue: orders
      .filter((o) => o.status === "delivered")
      .reduce((sum, o) => sum + o.collection_amount, 0),
  };

  const StatCard = ({
    icon: Icon,
    iconColor,
    iconBg,
    label,
    value,
  }: {
    icon: any;
    iconColor: string;
    iconBg: string;
    label: string;
    value: string | number;
  }) => (
    <View style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}>
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Icon size={20} color={iconColor} />
      </View>
      <ThemedText type="caption" style={{ color: theme.textSecondary }}>
        {label}
      </ThemedText>
      <ThemedText type="h3">{value}</ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={[
          styles.content,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        <View
          style={[styles.revenueCard, { backgroundColor: theme.link, ...Shadows.lg }]}
        >
          <View style={styles.revenueHeader}>
            <TrendingUp size={20} color="#FFFFFF" />
            <ThemedText
              type="small"
              style={{ color: "#FFFFFF", marginLeft: Spacing.sm }}
            >
              Total Revenue (Delivered)
            </ThemedText>
          </View>
          <ThemedText
            type="h1"
            style={{ color: "#FFFFFF", marginTop: Spacing.md }}
          >
            ${stats.totalRevenue.toFixed(2)}
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}
          >
            From {stats.delivered} completed deliveries
          </ThemedText>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Order Status Overview
        </ThemedText>

        <View style={styles.statsGrid}>
          <StatCard
            icon={Package}
            iconColor={theme.text}
            iconBg={theme.backgroundSecondary}
            label="Total Orders"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            iconColor={StatusColors.pending.text}
            iconBg={StatusColors.pending.bg}
            label="Pending"
            value={stats.pending}
          />
          <StatCard
            icon={Truck}
            iconColor={StatusColors.assigned.text}
            iconBg={StatusColors.assigned.bg}
            label="Assigned"
            value={stats.assigned}
          />
          <StatCard
            icon={CheckCircle}
            iconColor={StatusColors.delivered.text}
            iconBg={StatusColors.delivered.bg}
            label="Delivered"
            value={stats.delivered}
          />
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          Quick Stats
        </ThemedText>

        <View
          style={[styles.quickStats, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Users size={20} color={theme.textSecondary} />
              <View style={{ marginLeft: Spacing.md }}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Active Drivers
                </ThemedText>
                <ThemedText type="h4">3</ThemedText>
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Package size={20} color={theme.textSecondary} />
              <View style={{ marginLeft: Spacing.md }}>
                <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                  Avg. Delivery Fee
                </ThemedText>
                <ThemedText type="h4">$5.00</ThemedText>
              </View>
            </View>
          </View>
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
  revenueCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.xl,
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
    alignItems: "center",
  },
  statIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.sm,
  },
  quickStats: {
    borderRadius: BorderRadius.sm,
    overflow: "hidden",
  },
  quickStatRow: {
    padding: Spacing.lg,
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  divider: {
    height: 1,
  },
});
