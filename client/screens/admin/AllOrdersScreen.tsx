import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Phone, Clock } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";

import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { Spacing, BorderRadius, StatusColors } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

const FILTER_OPTIONS: { label: string; value: OrderStatus | "all" }[] = [
  { label: "الكل", value: "all" },
  { label: "قيد الانتظار", value: "pending" },
  { label: "تم التعيين", value: "assigned" },
  { label: "تم التوصيل", value: "delivered" },
];

export default function AllOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<OrderStatus | "all">("all");

  const loadOrders = async () => {
    try {
      const data = await api.orders.list();
      setOrders(data as any);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, []),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const filteredOrders =
    filter === "all" ? orders : orders.filter((o) => o.status === filter);

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString("ar-SA", {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View
      style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3" numberOfLines={1}>
            {item.customerName}
          </ThemedText>
          <View style={styles.timeRow}>
            <Clock size={14} color={theme.textSecondary} />
            <ThemedText
              type="caption"
              style={{ color: theme.textSecondary, marginRight: Spacing.xs }}
            >
              {formatTime(item.createdAt)}
            </ThemedText>
          </View>
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.cardRow}>
        <MapPin size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.cardText, { color: theme.textSecondary }]}
          numberOfLines={2}
        >
          {item.customerAddress}
        </ThemedText>
      </View>

      <View style={styles.cardRow}>
        <Phone size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.cardText, { color: theme.textSecondary }]}
        >
          {item.phonePrimary}
        </ThemedText>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <ThemedText type="h3" style={{ color: theme.link }}>
            {item.collectionAmount.toFixed(2)} ر.س
          </ThemedText>
        </View>
        {item.deliveryWindow ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {item.deliveryWindow}
          </ThemedText>
        ) : null}
      </View>
    </View>
  );

  const renderHeader = () => (
    <View style={styles.filterContainer}>
      {FILTER_OPTIONS.map((option) => (
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

  const getFilterLabel = (filterValue: OrderStatus | "all") => {
    const labels: Record<string, string> = {
      all: "الكل",
      pending: "قيد الانتظار",
      assigned: "تم التعيين",
      delivered: "تم التوصيل",
    };
    return labels[filterValue] || filterValue;
  };

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText
        type="h3"
        style={{ textAlign: "center", marginBottom: Spacing.sm }}
      >
        لا توجد طلبات
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, textAlign: "center" }}
      >
        {filter === "all"
          ? "لم يتم إنشاء أي طلبات بعد"
          : `لا توجد طلبات ${getFilterLabel(filter)}`}
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
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        ListEmptyComponent={loading ? null : renderEmptyState}
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
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: Spacing.xs,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: Spacing.sm,
  },
  cardText: {
    marginRight: Spacing.sm,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  separator: {
    height: Spacing.md,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
});
