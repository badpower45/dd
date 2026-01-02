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
import { MapPin, Phone, Clock, Banknote } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";

import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

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
      // Safely map Supabase snake_case fields to the UI
      const mappedOrders = (data as any[]).map((o) => ({
        id: o.id,
        customerName: o.customer_name || "عميل مجهول",
        customerAddress: o.delivery_address || "بدون عنوان",
        phonePrimary: o.customer_phone || "-",
        collectionAmount: Number(o.collection_amount || 0),
        status: o.status || "pending",
        createdAt: o.created_at,
        deliveryWindow: o.delivery_window,
      })) as Order[];
      setOrders(mappedOrders);
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
    try {
      const date = new Date(dateString);
      return date.toLocaleTimeString("ar-SA", {
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return "--:--";
    }
  };

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: theme.backgroundDefault, ...Shadows.sm },
      ]}
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
          numberOfLines={1}
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

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={styles.amountContainer}>
          <Banknote size={16} color={theme.primary} style={{ marginLeft: 4 }} />
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {(item.collectionAmount || 0).toFixed(2)} ر.س
          </ThemedText>
        </View>
        {item.deliveryWindow && (
          <View style={styles.windowBadge}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              {item.deliveryWindow}
            </ThemedText>
          </View>
        )}
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
        data={filteredOrders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        ListHeaderComponent={renderHeader}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={
          loading ? null : (
            <View style={styles.emptyState}>
              <ThemedText type="body" style={{ color: theme.textSecondary }}>
                لا توجد طلبات في هذا القسم
              </ThemedText>
            </View>
          )
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
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
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
    marginTop: 4,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
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
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  windowBadge: {
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
  },
  separator: { height: Spacing.md },
  emptyState: { flex: 1, alignItems: "center", paddingTop: 50 },
});
