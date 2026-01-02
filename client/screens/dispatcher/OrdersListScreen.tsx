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
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MapPin, Phone, Banknote, Clock, Truck } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { api } from "@/lib/api";
import { Order } from "@/lib/types";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function OrdersListScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    try {
      const data = await api.orders.list();
      // Map Supabase snake_case to frontend camelCase safely
      const mappedOrders = (data as any[]).map((o) => ({
        id: o.id,
        customerName: o.customer_name || "عميل",
        customerAddress: o.delivery_address || "بدون عنوان",
        phonePrimary: o.customer_phone || "-",
        collectionAmount: Number(o.collection_amount || 0),
        status: o.status || "pending",
        createdAt: o.created_at,
        deliveryWindow: o.delivery_window,
      })) as Order[];

      setOrders(mappedOrders.filter((o) => o.status === "pending"));
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

  const handleOrderPress = (order: Order) => {
    navigation.navigate("AssignOrder", { order });
  };

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
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        {
          backgroundColor: theme.backgroundDefault,
          ...Shadows.sm,
          transform: [{ scale: pressed ? 0.98 : 1 }],
        },
      ]}
      onPress={() => handleOrderPress(item)}
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
              أُنشئ {formatTime(item.createdAt)}
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

      <View style={[styles.cardFooter, { borderTopColor: theme.border }]}>
        <View style={styles.amountContainer}>
          <Banknote size={16} color={theme.primary} style={{ marginLeft: 4 }} />
          <ThemedText type="h4" style={{ color: theme.primary }}>
            {(item.collectionAmount || 0).toFixed(2)} ر.س
          </ThemedText>
        </View>
        <View style={styles.assignButton}>
          <Truck size={18} color={theme.primary} />
          <ThemedText
            type="small"
            style={{
              color: theme.primary,
              marginRight: 4,
              fontWeight: "700",
            }}
          >
            تعيين سائق
          </ThemedText>
        </View>
      </View>
    </Pressable>
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
        data={orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
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
                لا توجد طلبات معلقة حالياً
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
  orderCard: { padding: Spacing.lg, borderRadius: BorderRadius.md },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: Spacing.md,
  },
  timeRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardText: { marginRight: Spacing.sm, flex: 1, color: "#64748B" },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.sm,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  amountContainer: { flexDirection: "row", alignItems: "center" },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2563EB15",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  separator: { height: Spacing.md },
  emptyState: { flex: 1, alignItems: "center", paddingTop: 100 },
});
