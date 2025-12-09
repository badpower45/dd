import React, { useState, useCallback, useEffect, useRef } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
  Switch,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import {
  MapPin,
  Phone,
  DollarSign,
  Clock,
  Package,
  CheckCircle,
  Navigation,
  Radio,
} from "lucide-react-native";
import * as Linking from "expo-linking";
import * as Location from "expo-location";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { Button } from "@/components/Button";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { 
  getOrdersByDriver, 
  updateOrderStatus, 
  seedDemoOrders,
  updateDriverLocation,
  updateDriverStatus,
  notifyDriverLocationUpdate,
} from "@/lib/storage";
import { Order, OrderStatus, DriverStatus } from "@/lib/types";
import { Spacing, BorderRadius } from "@/constants/theme";

export default function MyTasksScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "completed">("active");
  const [isOnline, setIsOnline] = useState(false);
  const locationSubscription = useRef<Location.LocationSubscription | null>(null);
  const onlineIntentRef = useRef<boolean>(false);

  const loadOrders = async () => {
    if (!user) return;
    try {
      await seedDemoOrders("restaurant-001");
      const data = await getOrdersByDriver(user.id);
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

  const stopLocationTracking = () => {
    if (locationSubscription.current) {
      locationSubscription.current.remove();
      locationSubscription.current = null;
    }
  };

  const handleToggleOnline = async (value: boolean) => {
    if (!user) return;
    
    onlineIntentRef.current = value;
    
    if (!value) {
      stopLocationTracking();
      setIsOnline(false);
      await updateDriverStatus(user.id, "offline");
      await notifyDriverLocationUpdate();
      return;
    }

    const { status } = await Location.requestForegroundPermissionsAsync();
    if (!onlineIntentRef.current) return;
    
    if (status !== "granted") {
      Alert.alert("Permission Denied", "Location permission is required to go online");
      setIsOnline(false);
      return;
    }

    try {
      const subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000,
          distanceInterval: 50,
        },
        (location) => {
          if (user && onlineIntentRef.current) {
            updateDriverLocation(user.id, {
              lat: location.coords.latitude,
              lng: location.coords.longitude,
            }).then(() => notifyDriverLocationUpdate());
          }
        }
      );
      
      if (!onlineIntentRef.current) {
        subscription.remove();
        return;
      }
      
      locationSubscription.current = subscription;
      setIsOnline(true);
      
      await updateDriverStatus(user.id, "available");
      if (!onlineIntentRef.current) return;
      
      await notifyDriverLocationUpdate();
    } catch (error) {
      console.error("Failed to start location tracking:", error);
      stopLocationTracking();
      setIsOnline(false);
      Alert.alert("Error", "Failed to start location tracking");
    }
  };

  useEffect(() => {
    return () => {
      stopLocationTracking();
    };
  }, []);

  const onRefresh = async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  };

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    try {
      await updateOrderStatus(orderId, newStatus);
      await loadOrders();
      Alert.alert(
        "Success",
        newStatus === "picked_up"
          ? "Order marked as picked up"
          : "Order delivered successfully!",
      );
    } catch (error) {
      Alert.alert("Error", "Failed to update order status");
    }
  };

  const handleOpenMaps = (order: Order) => {
    if (order.customer_geo) {
      const url = `https://maps.google.com/?q=${order.customer_geo.lat},${order.customer_geo.lng}`;
      Linking.openURL(url);
    } else {
      const encoded = encodeURIComponent(order.customer_address);
      Linking.openURL(`https://maps.google.com/?q=${encoded}`);
    }
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active") {
      return order.status === "assigned" || order.status === "picked_up";
    }
    return order.status === "delivered";
  });

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View
      style={[styles.orderCard, { backgroundColor: theme.backgroundDefault }]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3" numberOfLines={1}>
            {item.customer_name}
          </ThemedText>
          {item.delivery_window ? (
            <View style={styles.timeRow}>
              <Clock size={14} color={theme.textSecondary} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginLeft: Spacing.xs }}
              >
                {item.delivery_window}
              </ThemedText>
            </View>
          ) : null}
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
          {item.customer_address}
        </ThemedText>
      </View>

      <View style={styles.cardRow}>
        <Phone size={16} color={theme.textSecondary} />
        <Pressable onPress={() => Linking.openURL(`tel:${item.phone_primary}`)}>
          <ThemedText
            type="small"
            style={{ color: theme.link, marginLeft: Spacing.sm }}
          >
            {item.phone_primary}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <DollarSign size={20} color={theme.link} />
          <ThemedText type="h2" style={{ color: theme.link }}>
            {item.collection_amount.toFixed(2)}
          </ThemedText>
        </View>
      </View>

      {filter === "active" ? (
        <View style={styles.actionsContainer}>
          <Pressable
            style={[styles.actionButton, { backgroundColor: theme.backgroundSecondary }]}
            onPress={() => handleOpenMaps(item)}
          >
            <Navigation size={18} color={theme.link} />
            <ThemedText
              type="small"
              style={{ color: theme.link, marginLeft: Spacing.xs, fontWeight: "600" }}
            >
              Navigate
            </ThemedText>
          </Pressable>

          {item.status === "assigned" ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#F9731620" }]}
              onPress={() => handleUpdateStatus(item.id, "picked_up")}
            >
              <Package size={18} color="#F97316" />
              <ThemedText
                type="small"
                style={{ color: "#F97316", marginLeft: Spacing.xs, fontWeight: "600" }}
              >
                Pick Up
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#10B98120" }]}
              onPress={() => handleUpdateStatus(item.id, "delivered")}
            >
              <CheckCircle size={18} color="#10B981" />
              <ThemedText
                type="small"
                style={{ color: "#10B981", marginLeft: Spacing.xs, fontWeight: "600" }}
              >
                Delivered
              </ThemedText>
            </Pressable>
          )}
        </View>
      ) : null}
    </View>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyState}>
      <ThemedText type="h3" style={{ textAlign: "center", marginBottom: Spacing.sm }}>
        {filter === "active" ? "No Active Tasks" : "No Completed Tasks"}
      </ThemedText>
      <ThemedText
        type="small"
        style={{ color: theme.textSecondary, textAlign: "center" }}
      >
        {filter === "active"
          ? "You don't have any assigned orders right now"
          : "You haven't completed any deliveries yet"}
      </ThemedText>
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.filterContainer,
          { paddingTop: headerHeight + Spacing.lg, backgroundColor: theme.backgroundRoot },
        ]}
      >
        <View style={[styles.onlineToggleContainer, { backgroundColor: theme.backgroundDefault }]}>
          <View style={styles.onlineToggleLeft}>
            <Radio size={20} color={isOnline ? "#10B981" : theme.textSecondary} />
            <ThemedText type="body" style={{ marginLeft: Spacing.sm, fontWeight: "600" }}>
              {isOnline ? "Online" : "Offline"}
            </ThemedText>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ false: theme.border, true: "#10B98150" }}
            thumbColor={isOnline ? "#10B981" : theme.textSecondary}
          />
        </View>

        <View style={[styles.filterTabs, { backgroundColor: theme.backgroundDefault }]}>
          <Pressable
            style={[
              styles.filterTab,
              filter === "active" && { backgroundColor: theme.link },
            ]}
            onPress={() => setFilter("active")}
          >
            <ThemedText
              type="small"
              style={{
                color: filter === "active" ? "#FFFFFF" : theme.text,
                fontWeight: "600",
              }}
            >
              Active
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.filterTab,
              filter === "completed" && { backgroundColor: theme.link },
            ]}
            onPress={() => setFilter("completed")}
          >
            <ThemedText
              type="small"
              style={{
                color: filter === "completed" ? "#FFFFFF" : theme.text,
                fontWeight: "600",
              }}
            >
              Completed
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: tabBarHeight + Spacing.xl },
        ]}
        scrollIndicatorInsets={{ bottom: insets.bottom }}
        data={filteredOrders}
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
  filterContainer: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.md,
  },
  onlineToggleContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
    marginBottom: Spacing.md,
  },
  onlineToggleLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  filterTabs: {
    flexDirection: "row",
    borderRadius: BorderRadius.sm,
    padding: Spacing.xs,
  },
  filterTab: {
    flex: 1,
    paddingVertical: Spacing.sm,
    alignItems: "center",
    borderRadius: BorderRadius.xs,
  },
  list: {
    flex: 1,
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingTop: Spacing.md,
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
    marginLeft: Spacing.sm,
    flex: 1,
  },
  cardFooter: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "rgba(0,0,0,0.05)",
  },
  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionsContainer: {
    flexDirection: "row",
    marginTop: Spacing.md,
    gap: Spacing.sm,
  },
  actionButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.xs,
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
