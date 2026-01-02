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
import { StatCard } from "@/components/StatCard";
import { GradientCard } from "@/components/GradientCard";
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
      setOrders(data as any);
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
        {/* Revenue Hero Card */}
        <GradientCard
          gradient="primary"
          icon={<TrendingUp size={22} color="#FFFFFF" />}
          title="إجمالي الإيرادات"
          subtitle="المُسلّم"
          style={styles.heroCard}
        >
          <ThemedText type="h1" style={styles.heroValue}>
            {stats.totalRevenue.toFixed(2)} ر.س
          </ThemedText>
          <ThemedText type="caption" style={styles.heroSubtext}>
            من {stats.delivered} توصيلة مكتملة
          </ThemedText>
        </GradientCard>

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View
            style={[styles.sectionDot, { backgroundColor: theme.primary }]}
          />
          <ThemedText type="h4">نظرة عامة على حالة الطلبات</ThemedText>
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <StatCard
            icon={<Package size={22} color={theme.text} />}
            iconBgColor={theme.backgroundSecondary}
            label="إجمالي الطلبات"
            value={stats.total}
            delay={0}
          />
          <StatCard
            icon={<Clock size={22} color={StatusColors.pending.text} />}
            iconBgColor={StatusColors.pending.bg}
            label="قيد الانتظار"
            value={stats.pending}
            delay={100}
          />
          <StatCard
            icon={<Truck size={22} color={StatusColors.assigned.text} />}
            iconBgColor={StatusColors.assigned.bg}
            label="تم التعيين"
            value={stats.assigned}
            delay={200}
          />
          <StatCard
            icon={<CheckCircle size={22} color={StatusColors.delivered.text} />}
            iconBgColor={StatusColors.delivered.bg}
            label="تم التوصيل"
            value={stats.delivered}
            delay={300}
          />
        </View>

        {/* Quick Stats Section */}
        <View style={styles.sectionHeader}>
          <View style={[styles.sectionDot, { backgroundColor: theme.info }]} />
          <ThemedText type="h4">إحصائيات سريعة</ThemedText>
        </View>

        <View
          style={[
            styles.quickStats,
            {
              backgroundColor: theme.backgroundDefault,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.quickStatRow}>
            <View style={styles.quickStatItem}>
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${theme.info}15` },
                ]}
              >
                <Users size={20} color={theme.info} />
              </View>
              <View style={styles.quickStatText}>
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
              <View
                style={[
                  styles.quickStatIcon,
                  { backgroundColor: `${theme.success}15` },
                ]}
              >
                <Package size={20} color={theme.success} />
              </View>
              <View style={styles.quickStatText}>
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
  heroCard: {
    marginBottom: Spacing.xl,
  },
  heroValue: {
    color: "#FFFFFF",
    marginTop: Spacing.md,
    fontSize: 32,
    fontWeight: "700",
  },
  heroSubtext: {
    color: "rgba(255,255,255,0.8)",
    marginTop: Spacing.xs,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    marginTop: Spacing.sm,
    gap: Spacing.sm,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  statsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  quickStats: {
    borderRadius: BorderRadius.lg,
    overflow: "hidden",
    ...Shadows.sm,
    marginBottom: Spacing.xl,
    borderWidth: 1,
  },
  quickStatRow: {
    padding: Spacing.lg,
  },
  quickStatItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  quickStatIcon: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.md,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: Spacing.md,
  },
  quickStatText: {
    flex: 1,
  },
  divider: {
    height: 1,
    marginHorizontal: Spacing.lg,
  },
});
