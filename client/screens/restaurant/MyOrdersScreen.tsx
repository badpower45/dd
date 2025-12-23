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
import { MapPin, Phone, DollarSign, Package } from "lucide-react-native";
import Animated, { FadeInDown, FadeInUp, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCardSkeleton } from "@/components/SkeletonLoader";
import { StatusPulse } from "@/components/PulseAnimation";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import type { Order } from "@/lib/types";
import { Spacing, BorderRadius, Colors, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const loadOrders = async () => {
    if (!user) return;
    try {
      const data = await api.orders.list({ restaurantId: user.id });
      // Transform snake_case to camelCase for frontend
      const transformedOrders = (data as any[]).map((order: any) => ({
        id: order.id,
        createdAt: order.created_at,
        restaurantId: order.restaurant_id,
        driverId: order.driver_id,
        customerName: order.customer_name,
        customerAddress: order.delivery_address,
        customerGeo: order.delivery_lat && order.delivery_lng
          ? { lat: parseFloat(order.delivery_lat), lng: parseFloat(order.delivery_lng) }
          : null,
        phonePrimary: order.customer_phone,
        phoneSecondary: null,
        collectionAmount: order.collection_amount,
        deliveryFee: order.delivery_fee,
        status: order.status,
        deliveryWindow: order.delivery_window,
      })) as Order[];
      setOrders(transformedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [user]),
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View
      entering={FadeInUp.duration(400).delay(index * 80)}
      layout={Layout.springify()}
    >
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          {
            backgroundColor: theme.backgroundDefault,
            transform: [{ scale: pressed ? 0.98 : 1 }],
            ...Shadows.sm,
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={styles.customerInfo}>
            <StatusPulse status={item.status} />
            <ThemedText type="h3" numberOfLines={1} style={styles.customerName}>
              {item.customerName}
            </ThemedText>
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
            <DollarSign size={18} color={theme.success} />
            <ThemedText type="h3" style={{ color: theme.success }}>
              {item.collectionAmount.toFixed(2)} ج.م
            </ThemedText>
          </View>
          {item.deliveryWindow ? (
            <View style={[styles.deliveryBadge, { backgroundColor: theme.primary + "15" }]}>
              <ThemedText type="caption" style={{ color: theme.primary }}>
                {item.deliveryWindow}
              </ThemedText>
            </View>
          ) : null}
        </View>
      </Pressable>
    </Animated.View>
  );

  const renderSkeleton = () => (
    <View style={styles.skeletonContainer}>
      {[1, 2, 3].map((i) => (
        <OrderCardSkeleton key={i} />
      ))}
    </View>
  );

  const renderEmptyState = () => (
    <Animated.View
      entering={FadeInDown.duration(400)}
      style={styles.emptyState}
    >
      <View style={[styles.emptyIcon, { backgroundColor: theme.primary + "15" }]}>
        <Package size={48} color={theme.primary} />
      </View>
      <ThemedText
        type="h3"
        style={{ textAlign: "center", marginBottom: Spacing.sm }}
      >
        لا توجد طلبات بعد
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, textAlign: "center" }}
      >
        اضغط على زر + لإنشاء أول طلب
      </ThemedText>
    </Animated.View>
  );

  return (
    <ThemedView style={styles.container}>
      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          {
            paddingTop: headerHeight + Spacing.lg,
            paddingBottom: tabBarHeight + Spacing["5xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={loading ? [] : orders}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderOrderCard}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={theme.primary}
          />
        }
        ListEmptyComponent={loading ? renderSkeleton : renderEmptyState}
        showsVerticalScrollIndicator={false}
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
  skeletonContainer: {
    gap: Spacing.md,
  },
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.lg,
    marginBottom: Spacing.md,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
  },
  customerInfo: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
    gap: Spacing.sm,
  },
  customerName: {
    flex: 1,
    marginRight: Spacing.sm,
  },
  cardRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: Spacing.sm,
  },
  cardText: {
    marginLeft: Spacing.sm,
    flex: 1,
  },
  cardFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.xs,
  },
  deliveryBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    borderRadius: BorderRadius.sm,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: Spacing["4xl"],
  },
  emptyIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: Spacing.lg,
  },
});
