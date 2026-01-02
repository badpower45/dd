import React, { useState } from "react";
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
import {
  MapPin,
  Phone,
  Banknote,
  Package,
  Clock,
  ChevronLeft,
} from "lucide-react-native";
import Animated, { FadeInUp, Layout } from "react-native-reanimated";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { OrderCardSkeleton } from "@/components/SkeletonLoader";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { useOrders } from "@/hooks/useApi";
import { useRealtimeOrders } from "@/hooks/useRealtimeOrders";
import type { Order } from "@/lib/supabaseApi";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MyOrdersScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  // Use the new hooks with realtime updates
  const {
    data: orders = [],
    isLoading: loading,
    refetch,
  } = useOrders({
    restaurantId: user?.id,
  });

  // Enable realtime updates
  useRealtimeOrders(true);

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const renderOrderCard = ({ item, index }: { item: Order; index: number }) => (
    <Animated.View
      entering={FadeInUp.duration(400).delay(index * 50)}
      layout={Layout.springify()}
    >
      <Pressable
        style={({ pressed }) => [
          styles.orderCard,
          {
            backgroundColor: theme.backgroundDefault,
            borderLeftWidth: 4,
            borderLeftColor:
              item.status === "delivered"
                ? theme.success
                : item.status === "pending"
                  ? theme.warning
                  : theme.primary,
            ...Shadows.sm,
            transform: [{ scale: pressed ? 0.98 : 1 }],
          },
        ]}
      >
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <ThemedText type="h3" numberOfLines={1}>
              {item.customer_name}
            </ThemedText>
            <View style={styles.idBadge}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                طلب #{item.id}
              </ThemedText>
            </View>
          </View>
          <StatusBadge status={item.status} />
        </View>

        <View style={styles.divider} />

        <View style={styles.cardBody}>
          <View style={styles.infoRow}>
            <MapPin size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={styles.infoText} numberOfLines={1}>
              {item.delivery_address}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Phone size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={styles.infoText}>
              {item.customer_phone}
            </ThemedText>
          </View>

          <View style={styles.infoRow}>
            <Clock size={16} color={theme.textSecondary} />
            <ThemedText type="small" style={styles.infoText}>
              {new Date(item.created_at).toLocaleDateString("ar-SA")}
            </ThemedText>
          </View>
        </View>

        <View
          style={[
            styles.cardFooter,
            { backgroundColor: theme.backgroundSecondary + "50" },
          ]}
        >
          <View style={styles.amountBox}>
            <ThemedText type="caption" style={{ color: theme.textSecondary }}>
              مبلغ التحصيل
            </ThemedText>
            <ThemedText type="h3" style={{ color: theme.primary }}>
              {item.collection_amount.toFixed(2)} ر.س
            </ThemedText>
          </View>
          <ChevronLeft size={20} color={theme.textSecondary} />
        </View>
      </Pressable>
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
            paddingBottom: tabBarHeight + Spacing.xl,
          },
        ]}
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
        ListEmptyComponent={
          loading ? (
            () => (
              <View style={{ gap: 12 }}>
                {[1, 2, 3].map((i) => (
                  <OrderCardSkeleton key={i} />
                ))}
              </View>
            )
          ) : (
            <View style={styles.emptyState}>
              <Package size={64} color={theme.border} />
              <ThemedText type="h3" style={{ marginTop: 16 }}>
                لا توجد طلبات
              </ThemedText>
            </View>
          )
        }
        showsVerticalScrollIndicator={false}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  list: { flex: 1 },
  listContent: { paddingHorizontal: Spacing.lg },
  orderCard: {
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.md,
    overflow: "hidden",
  },
  cardHeader: {
    padding: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  idBadge: {
    marginTop: 4,
    backgroundColor: "#F1F5F9",
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    alignSelf: "flex-start",
  },
  divider: {
    height: 1,
    backgroundColor: "#F1F5F9",
    marginHorizontal: Spacing.lg,
  },
  cardBody: {
    padding: Spacing.lg,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: Spacing.sm,
  },
  infoText: {
    flex: 1,
    color: "#475569",
  },
  cardFooter: {
    padding: Spacing.md,
    paddingHorizontal: Spacing.lg,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  amountBox: {
    gap: 2,
  },
  emptyState: {
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 100,
  },
});
