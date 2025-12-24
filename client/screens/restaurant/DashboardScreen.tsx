import React, { useEffect, useState } from "react";
import { View, StyleSheet, ScrollView, RefreshControl, I18nManager } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useNavigation } from "@react-navigation/native";
import { Package, Truck, Plus, TrendingUp } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatCard } from "@/components/StatCard";
import { ActionCard } from "@/components/ActionCard";
import { GradientCard } from "@/components/GradientCard";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Spacing } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

interface Stats {
  todayOrders: number;
  totalCollection: number;
  activeDeliveries: number;
}

export default function DashboardScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    if (!user?.id) return;
    try {
      const data = await api.analytics.getRestaurantStats(user.id);
      setStats(data);
    } catch (error) {
      console.log("Failed to fetch stats", error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (user?.id) {
      fetchStats();
    }
  }, [user?.id]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (value: number) => {
    return `${(value / 100).toFixed(0)} ج.م`;
  };

  return (
    <ThemedView style={styles.container}>
      {/* Header */}
      <Animated.View
        entering={FadeInDown.duration(400)}
        style={[styles.header, { paddingTop: insets.top + Spacing.lg }]}
      >
        <View>
          <ThemedText type="small" style={{ color: theme.textSecondary }}>
            مرحباً 👋
          </ThemedText>
          <ThemedText type="h2">{user?.fullName || "المطعم"}</ThemedText>
        </View>
      </Animated.View>

      <ScrollView
        contentContainerStyle={[styles.content, { paddingBottom: tabBarHeight + Spacing["4xl"] }]}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Hero Stat - Total Collection */}
        <GradientCard
          gradient="primary"
          icon={<TrendingUp size={20} color="#FFFFFF" />}
          title="إجمالي التحصيلات"
          style={styles.heroCard}
        >
          <ThemedText type="h1" style={styles.heroValue}>
            {loading ? "..." : formatCurrency(stats?.totalCollection || 0)}
          </ThemedText>
        </GradientCard>

        {/* Stats Row */}
        <View style={styles.statsRow}>
          <StatCard
            value={loading ? "-" : stats?.todayOrders || 0}
            label="طلبات اليوم"
            icon={<Package size={20} color={theme.info} />}
            iconBgColor={`${theme.info}15`}
            delay={200}
          />
          <StatCard
            value={loading ? "-" : stats?.activeDeliveries || 0}
            label="جاري التوصيل"
            icon={<Truck size={20} color={theme.warning} />}
            iconBgColor={`${theme.warning}15`}
            delay={300}
          />
        </View>

        {/* Quick Actions */}
        <Animated.View entering={FadeInUp.duration(400).delay(400)}>
          <View style={styles.sectionHeader}>
            <View style={[styles.sectionDot, { backgroundColor: theme.primary }]} />
            <ThemedText type="h4">الإجراءات السريعة</ThemedText>
          </View>
        </Animated.View>

        <ActionCard
          title="عرض الطلبات"
          subtitle="إدارة ومتابعة كل الطلبات"
          icon={<Package size={20} color={theme.primary} />}
          iconBgColor={`${theme.primary}15`}
          onPress={() => (navigation as any).navigate("OrdersTab")}
          delay={450}
          style={styles.actionCard}
        />

        <ActionCard
          title="طلب جديد"
          subtitle="إنشاء طلب توصيل"
          icon={<Plus size={20} color={theme.success} />}
          iconBgColor={`${theme.success}15`}
          onPress={() => (navigation as any).navigate("CreateOrder")}
          delay={500}
        />
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
  },
  content: {
    padding: Spacing.lg,
    paddingBottom: Spacing["4xl"],
  },
  heroCard: {
    marginBottom: Spacing.lg,
  },
  heroValue: {
    color: "#FFFFFF",
    fontSize: 32,
    fontWeight: "700",
    marginTop: Spacing.md,
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  sectionHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.md,
    gap: Spacing.sm,
  },
  sectionDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  actionCard: {
    marginBottom: Spacing.sm,
  },
});
