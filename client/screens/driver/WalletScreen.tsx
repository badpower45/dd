import React, { useState, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, I18nManager } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { DollarSign, TrendingUp, Calendar, Package } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function WalletScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [todayDeliveries, setTodayDeliveries] = useState<Order[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    try {
      const all = await api.orders.list({ driverId: user.id });
      const delivered = all.filter((o: Order) => o.status === "delivered");
      setAllDeliveries(delivered);

      // Filter for today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const todayOrders = delivered.filter((o: Order) => {
        const orderDate = new Date(o.createdAt);
        return orderDate >= today;
      });
      setTodayDeliveries(todayOrders);
    } catch (error) {
      console.error("Error loading wallet data:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadData();
    }, [user]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const todayTotal = todayDeliveries.reduce(
    (sum, order) => sum + order.collectionAmount,
    0,
  );

  const allTimeTotal = allDeliveries.reduce(
    (sum, order) => sum + order.collectionAmount,
    0,
  );

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-SA", { hour: "2-digit", minute: "2-digit" });
  };

  const renderDeliveryItem = ({ item }: { item: Order }) => (
    <View
      style={[styles.deliveryItem, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.deliveryInfo}>
        <ThemedText type="body" style={{ fontWeight: "600" }}>
          {item.customerName}
        </ThemedText>
        <ThemedText type="caption" style={{ color: theme.textSecondary }}>
          {formatTime(item.createdAt)}
        </ThemedText>
      </View>
      <ThemedText type="h4" style={{ color: theme.link }}>
        {item.collectionAmount.toFixed(2)} ر.س
      </ThemedText>
    </View>
  );

  const renderHeader = () => (
    <View>
      <View
        style={[styles.summaryCard, { backgroundColor: theme.link, ...Shadows.lg }]}
      >
        <View style={styles.summaryHeader}>
          <Calendar size={20} color="#FFFFFF" />
          <ThemedText type="small" style={{ color: "#FFFFFF", marginRight: Spacing.sm }}>
            تحصيلات اليوم
          </ThemedText>
        </View>
        <ThemedText type="h1" style={{ color: "#FFFFFF", marginTop: Spacing.md }}>
          {todayTotal.toFixed(2)} ر.س
        </ThemedText>
        <ThemedText
          type="caption"
          style={{ color: "rgba(255,255,255,0.8)", marginTop: Spacing.xs }}
        >
          {todayDeliveries.length} توصيلة مكتملة
        </ThemedText>
      </View>

      <View style={styles.statsRow}>
        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.statIcon, { backgroundColor: "#10B98120" }]}>
            <Package size={20} color="#10B981" />
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            إجمالي التوصيلات
          </ThemedText>
          <ThemedText type="h3">{allDeliveries.length}</ThemedText>
        </View>

        <View
          style={[styles.statCard, { backgroundColor: theme.backgroundDefault }]}
        >
          <View style={[styles.statIcon, { backgroundColor: "#3B82F620" }]}>
            <TrendingUp size={20} color="#3B82F6" />
          </View>
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            الإجمالي الكلي
          </ThemedText>
          <ThemedText type="h3">{allTimeTotal.toFixed(2)} ر.س</ThemedText>
        </View>
      </View>

      <ThemedText type="h4" style={styles.sectionTitle}>
        توصيلات اليوم
      </ThemedText>
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <DollarSign size={48} color={theme.textSecondary} />
      <ThemedText
        type="body"
        style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.md }}
      >
        لم تُكمل أي توصيلات اليوم
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, textAlign: "center", marginTop: Spacing.xs }}
      >
        أكمل التوصيلات لترى أرباحك هنا
      </ThemedText>
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
        data={todayDeliveries}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderDeliveryItem}
        ListHeaderComponent={renderHeader}
        ListEmptyComponent={loading ? null : renderEmptyState}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
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
  summaryCard: {
    padding: Spacing.xl,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  summaryHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  statsRow: {
    flexDirection: "row",
    gap: Spacing.md,
    marginBottom: Spacing.xl,
  },
  statCard: {
    flex: 1,
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
  sectionTitle: {
    marginBottom: Spacing.md,
  },
  deliveryItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  deliveryInfo: {
    flex: 1,
  },
  separator: {
    height: Spacing.sm,
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: Spacing["3xl"],
  },
});
