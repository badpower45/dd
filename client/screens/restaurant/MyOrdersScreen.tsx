import React, { useState, useCallback } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import { MapPin, Phone, DollarSign } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { getOrdersByRestaurant, seedDemoOrders } from "@/lib/storage";
import { Order } from "@/lib/types";
import { Spacing, BorderRadius, Colors } from "@/constants/theme";

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
      await seedDemoOrders(user.id);
      const data = await getOrdersByRestaurant(user.id);
      setOrders(data);
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

  const renderOrderCard = ({ item }: { item: Order }) => (
    <Pressable
      style={({ pressed }) => [
        styles.orderCard,
        { backgroundColor: theme.backgroundDefault, opacity: pressed ? 0.8 : 1 },
      ]}
    >
      <View style={styles.cardHeader}>
        <ThemedText type="h3" numberOfLines={1} style={styles.customerName}>
          {item.customer_name}
        </ThemedText>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.cardRow}>
        <MapPin size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.cardText, { color: theme.textSecondary }]}
          numberOfLines={1}
        >
          {item.customer_address}
        </ThemedText>
      </View>

      <View style={styles.cardRow}>
        <Phone size={16} color={theme.textSecondary} />
        <ThemedText
          type="small"
          style={[styles.cardText, { color: theme.textSecondary }]}
        >
          {item.phone_primary}
        </ThemedText>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <DollarSign size={16} color={theme.link} />
          <ThemedText type="h3" style={{ color: theme.link }}>
            {item.collection_amount.toFixed(2)}
          </ThemedText>
        </View>
        {item.delivery_window ? (
          <ThemedText type="caption" style={{ color: theme.textSecondary }}>
            {item.delivery_window}
          </ThemedText>
        ) : null}
      </View>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText type="h3" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        No Orders Yet
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, textAlign: "center" }}
      >
        Tap the + button to create your first order
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
            paddingBottom: tabBarHeight + Spacing["5xl"],
          },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={orders}
        keyExtractor={(item) => item.id}
        renderItem={renderOrderCard}
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
  orderCard: {
    padding: Spacing.lg,
    borderRadius: BorderRadius.sm,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: Spacing.md,
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
