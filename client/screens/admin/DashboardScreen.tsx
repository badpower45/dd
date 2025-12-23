import React, { useState, useCallback } from "react";
import {
  View,
  ScrollView,
  StyleSheet,
  RefreshControl,
  I18nManager,
} from "react-native";
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

import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import {
  Spacing,
  BorderRadius,
  Shadows,
  StatusColors,
} from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const loadData = async () => {
    try {
      const data = await api.orders.list();
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
      .reduce((sum, o) => sum + o.collectionAmount, 0),
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
    <View
      style={[
        styles.statCard,
        {
          backgroundColor: theme.backgroundDefault,
          borderColor: theme.border,
          ...Shadows.sm,
        },
      ]}
    >
      <View style={[styles.statIcon, { backgroundColor: iconBg }]}>
        <Icon size={24} color={iconColor} />
      </View>
      <ThemedText
        type="caption"
        style={{ color: theme.textSecondary, marginBottom: 4 }}
      >
        {label}
      </ThemedText>
      <ThemedText type="h2" style={{ fontWeight: "bold" }}>
        {value}
      </ThemedText>
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
          style={[
            styles.revenueCard,
            { backgroundColor: theme.link, ...Shadows.lg },
          ]}
        >
          <View style={styles.revenueHeader}>
            <TrendingUp size={20} color="#FFFFFF" />
            <ThemedText
              type="small"
              style={{ color: "#FFFFFF", marginRight: Spacing.sm }}
            >
              إجمالي الإيرادات (المُسلّم)
            </ThemedText>
          </View>
          <ThemedText
            type="h1"
            style={{ color: "#FFFFFF", marginTop: Spacing.md }}
          >
            {stats.totalRevenue.toFixed(2)} ر.س
          </ThemedText>
          <ThemedText
            type="caption"
            style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}
          >
            من {stats.delivered} توصيلة مكتملة
          </ThemedText>
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          نظرة عامة على حالة الطلبات
        </ThemedText>

        <View style={styles.statsGrid}>
          <StatCard
            icon={Package}
            iconColor={theme.text}
            iconBg={theme.backgroundSecondary}
            label="إجمالي الطلبات"
            value={stats.total}
          />
          <StatCard
            icon={Clock}
            iconColor={StatusColors.pending.text}
            iconBg={StatusColors.pending.bg}
            label="قيد الانتظار"
            value={stats.pending}
          />
          <StatCard
            icon={Truck}
            iconColor={StatusColors.assigned.text}
            iconBg={StatusColors.assigned.bg}
            label="تم التعيين"
            value={stats.assigned}
          />
          <StatCard
            icon={CheckCircle}
            iconColor={StatusColors.delivered.text}
            iconBg={StatusColors.delivered.bg}
            label="تم التوصيل"
            value={stats.delivered}
          />
        </View>

        <ThemedText type="h4" style={styles.sectionTitle}>
          إحصائيات سريعة
        </ThemedText>

        <View
          style={[
            styles.quickStats,
            { backgroundColor: theme.backgroundDefault },
          ]}
        >
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Users size={20} color={theme.textSecondary} />
              <View style={{ marginRight: Spacing.md }}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  السائقون النشطون
                </ThemedText>
                <ThemedText type="h4">٣</ThemedText>
              </View>
            </View>
          </View>
          <View style={[styles.divider, { backgroundColor: theme.border }]} />
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <Package size={20} color={theme.textSecondary} />
              <View style={{ marginRight: Spacing.md }}>
                <ThemedText
                  type="caption"
                  style={{ color: theme.textSecondary }}
                >
                  متوسط رسوم التوصيل
                </ThemedText>
                <ThemedText type="h4">٥.٠٠ ر.س</ThemedText>
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
    borderRadius: BorderRadius.xl,
    marginBottom: Spacing.xl,
    overflow: "hidden",
  },
  revenueHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.xs,
  },
  sectionTitle: {
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    paddingHorizontal: Spacing.xs,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    width: "47%",
    padding: Spacing.lg, // Reduced padding for tighter look
    borderRadius: BorderRadius.lg,
    alignItems: "center",
    ...Shadows.sm,
    borderWidth: 1,
    borderColor: "transparent", // Placeholder for theme border
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.md,
  },
  quickStats: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: "transparent",
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
    opacity: 0.5,
  },
});
