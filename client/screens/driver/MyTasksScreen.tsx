import React, { useState, useCallback, useEffect } from "react";
import {
  View,
  FlatList,
  StyleSheet,
  RefreshControl,
  Pressable,
  Alert,
  Switch,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useHeaderHeight } from "@react-navigation/elements";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect } from "@react-navigation/native";
import {
  MapPin,
  Phone,
  Banknote,
  Clock,
  Package,
  CheckCircle,
  Navigation,
  Radio,
} from "lucide-react-native";
import * as Linking from "expo-linking";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Order, OrderStatus } from "@/lib/types";
import { useDriverOnline } from "@/hooks/useDriverOnline";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

export default function MyTasksScreen() {
  const insets = useSafeAreaInsets();
  const headerHeight = useHeaderHeight();
  const tabBarHeight = useBottomTabBarHeight();
  const { theme } = useTheme();
  const { user } = useAuth();

  const [orders, setOrders] = useState<Order[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"active" | "completed">("active");

  const { isOnline, isRequesting, toggleOnline } = useDriverOnline(
    async (lat, lng) => {
      if (!user) return;
      await api.drivers.updateLocation(user.id, lat, lng);
    },
    { timeInterval: 10000, distanceInterval: 40 },
  );

  const handleToggleOnline = useCallback(
    async (value: boolean) => {
      if (!user) {
        Alert.alert("تنبيه", "تسجيل الدخول مطلوب لتفعيل التتبع");
        return;
      }
      await toggleOnline(value);
    },
    [toggleOnline, user],
  );

  const loadOrders = useCallback(async () => {
    if (!user) {
      setLoading(false);
      return;
    }
    try {
      const data = await api.orders.list({ driverId: user.id });
      const mappedOrders: Order[] = (data as any[]).map((o) => ({
        id: o.id,
        createdAt: o.created_at,
        restaurantId: o.restaurant_id,
        driverId: o.driver_id,
        customerName: o.customer_name || "عميل",
        customerAddress: o.delivery_address || "بدون عنوان",
        customerGeo:
          o.delivery_lat && o.delivery_lng
            ? { lat: Number(o.delivery_lat), lng: Number(o.delivery_lng) }
            : null,
        phonePrimary: o.customer_phone || "-",
        phoneSecondary: null,
        collectionAmount: Number(o.collection_amount || 0),
        deliveryFee: Number(o.delivery_fee || 0),
        status: o.status,
        deliveryWindow: o.delivery_window,
        restaurant: undefined,
        driver: undefined,
      }));
      setOrders(mappedOrders);
    } catch (error) {
      console.error("Error loading orders:", error);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useFocusEffect(
    useCallback(() => {
      loadOrders();
    }, [loadOrders]),
  );

  useEffect(() => {
    return () => {
      toggleOnline(false);
    };
  }, [toggleOnline]);

  const handleUpdateStatus = async (
    orderId: number,
    newStatus: OrderStatus,
  ) => {
    try {
      await api.orders.update(orderId, { status: newStatus });
      await loadOrders();
      Alert.alert("نجاح", "تم تحديث حالة الطلب");
    } catch (error) {
      Alert.alert("خطأ", "فشل تحديث الحالة");
    }
  };

  const handleOpenMaps = (order: Order) => {
    const url = order.customerGeo
      ? `https://www.google.com/maps/search/?api=1&query=${order.customerGeo.lat},${order.customerGeo.lng}`
      : `https://maps.google.com/?q=${encodeURIComponent(order.customerAddress)}`;
    Linking.openURL(url);
  };

  const filteredOrders = orders.filter((order) => {
    if (filter === "active")
      return order.status === "assigned" || order.status === "picked_up";
    return order.status === "delivered";
  });

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadOrders();
    setRefreshing(false);
  }, [loadOrders]);

  const renderOrderCard = ({ item }: { item: Order }) => (
    <View
      style={[
        styles.orderCard,
        { backgroundColor: theme.backgroundDefault, ...Shadows.sm },
      ]}
    >
      <View style={styles.cardHeader}>
        <View style={{ flex: 1 }}>
          <ThemedText type="h3">{item.customerName}</ThemedText>
          {item.deliveryWindow && (
            <View style={styles.timeRow}>
              <Clock size={14} color={theme.textSecondary} />
              <ThemedText
                type="caption"
                style={{ color: theme.textSecondary, marginRight: 4 }}
              >
                {item.deliveryWindow}
              </ThemedText>
            </View>
          )}
        </View>
        <StatusBadge status={item.status} />
      </View>

      <View style={styles.cardRow}>
        <MapPin size={16} color={theme.textSecondary} />
        <ThemedText type="small" style={styles.cardText} numberOfLines={2}>
          {item.customerAddress}
        </ThemedText>
      </View>

      <View style={styles.cardFooter}>
        <View style={styles.amountContainer}>
          <Banknote size={20} color={theme.primary} style={{ marginLeft: 4 }} />
          <ThemedText type="h2" style={{ color: theme.primary }}>
            {(item.collectionAmount || 0).toFixed(2)} ر.س
          </ThemedText>
        </View>
      </View>

      {filter === "active" && (
        <View style={styles.actionsContainer}>
          <Pressable
            style={[
              styles.actionButton,
              { backgroundColor: theme.backgroundSecondary },
            ]}
            onPress={() => handleOpenMaps(item)}
          >
            <Navigation size={18} color={theme.primary} />
            <ThemedText
              type="small"
              style={{
                color: theme.primary,
                fontWeight: "700",
                marginRight: 4,
              }}
            >
              خرائط
            </ThemedText>
          </Pressable>

          {item.status === "assigned" ? (
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#F9731615" }]}
              onPress={() => handleUpdateStatus(item.id, "picked_up")}
            >
              <Package size={18} color="#F97316" />
              <ThemedText
                type="small"
                style={{ color: "#F97316", fontWeight: "700", marginRight: 4 }}
              >
                استلام
              </ThemedText>
            </Pressable>
          ) : (
            <Pressable
              style={[styles.actionButton, { backgroundColor: "#10B98115" }]}
              onPress={() => handleUpdateStatus(item.id, "delivered")}
            >
              <CheckCircle size={18} color="#10B981" />
              <ThemedText
                type="small"
                style={{ color: "#10B981", fontWeight: "700", marginRight: 4 }}
              >
                توصيل
              </ThemedText>
            </Pressable>
          )}
        </View>
      )}
    </View>
  );

  return (
    <ThemedView style={styles.container}>
      <View
        style={[
          styles.filterContainer,
          { paddingTop: headerHeight + Spacing.lg },
        ]}
      >
        <View
          style={[
            styles.onlineToggle,
            { backgroundColor: theme.backgroundDefault, ...Shadows.sm },
          ]}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <Radio
              size={20}
              color={isOnline ? "#10B981" : theme.textSecondary}
            />
            <ThemedText type="h4" style={{ marginRight: 8 }}>
              {isOnline
                ? "أنت الآن متاح"
                : isRequesting
                  ? "جارِ التفعيل..."
                  : "أنت الآن غير متصل"}
            </ThemedText>
          </View>
          <Switch
            value={isOnline}
            onValueChange={handleToggleOnline}
            trackColor={{ true: "#10B981" }}
            disabled={isRequesting}
          />
        </View>

        <View style={styles.tabs}>
          <Pressable
            style={[
              styles.tab,
              filter === "active" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter("active")}
          >
            <ThemedText
              style={{
                color: filter === "active" ? "#FFF" : theme.text,
                fontWeight: "700",
              }}
            >
              المهام الحالية
            </ThemedText>
          </Pressable>
          <Pressable
            style={[
              styles.tab,
              filter === "completed" && { backgroundColor: theme.primary },
            ]}
            onPress={() => setFilter("completed")}
          >
            <ThemedText
              style={{
                color: filter === "completed" ? "#FFF" : theme.text,
                fontWeight: "700",
              }}
            >
              المكتملة
            </ThemedText>
          </Pressable>
        </View>
      </View>

      <FlatList
        style={styles.list}
        contentContainerStyle={{
          paddingHorizontal: Spacing.lg,
          paddingBottom: 100,
        }}
        data={filteredOrders}
        keyExtractor={(item) => String(item.id)}
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
            <View style={{ paddingTop: 50, alignItems: "center" }}>
              <ThemedText style={{ color: theme.textSecondary }}>
                لا توجد طلبات هنا
              </ThemedText>
            </View>
          )
        }
        ItemSeparatorComponent={() => <View style={{ height: 12 }} />}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterContainer: { paddingHorizontal: Spacing.lg, marginBottom: Spacing.md },
  onlineToggle: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.lg,
  },
  tabs: {
    flexDirection: "row",
    backgroundColor: "#E2E8F0",
    borderRadius: BorderRadius.md,
    padding: 4,
  },
  tab: {
    flex: 1,
    paddingVertical: 10,
    alignItems: "center",
    borderRadius: BorderRadius.sm,
  },
  list: { flex: 1 },
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
    marginTop: Spacing.sm,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: "#F1F5F9",
  },
  amountContainer: { flexDirection: "row", alignItems: "center" },
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
    paddingVertical: 12,
    borderRadius: BorderRadius.sm,
  },
});
