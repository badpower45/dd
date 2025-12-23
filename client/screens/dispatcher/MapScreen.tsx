import React, { useState, useCallback, useMemo } from "react";
import {
  View,
  StyleSheet,
  Pressable,
  Platform,
  I18nManager,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useBottomTabBarHeight } from "@react-navigation/bottom-tabs";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { MapPin, Truck, X } from "lucide-react-native";

import { ThemedText } from "@/components/ThemedText";
import { ThemedView } from "@/components/ThemedView";
import { StatusBadge } from "@/components/StatusBadge";
import { useTheme } from "@/hooks/useTheme";

import { api } from "@/lib/api";
import { Order, Profile } from "@/lib/types";
import { Spacing, BorderRadius, Shadows } from "@/constants/theme";
import { calculateDistance, calculateETA } from "@/lib/location";

I18nManager.allowRTL(true);
I18nManager.forceRTL(true);

// Get native maps components only on native platforms
// This MUST be a top-level conditional to work with Metro's dead code elimination
const getNativeMaps = () => {
  if (Platform.OS === "web") {
    return { MapView: null, Marker: null, PROVIDER_DEFAULT: null };
  }
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const RNMaps = require("react-native-maps");
  return {
    MapView: RNMaps.default,
    Marker: RNMaps.Marker,
    PROVIDER_DEFAULT: RNMaps.PROVIDER_DEFAULT,
  };
};

const { MapView, Marker, PROVIDER_DEFAULT } = getNativeMaps();

export default function MapScreen() {
  const insets = useSafeAreaInsets();
  const tabBarHeight = useBottomTabBarHeight();
  const navigation = useNavigation<any>();
  const { theme } = useTheme();

  const [orders, setOrders] = useState<Order[]>([]);
  const [drivers, setDrivers] = useState<Profile[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const loadOrders = async () => {
    try {
      const allOrders = await api.orders.list();
      setOrders((allOrders as any[]).filter((o: any) => o.status === "pending"));
    } catch (error) {
      console.error("Failed to load orders", error);
    }
  };

  const loadDrivers = async () => {
    try {
      const activeDrivers = await api.drivers.getActive();
      // Map backend response where currentLat/Lng are strings to Profile structure
      const mappedDrivers = activeDrivers.map((d: any) => ({
        ...d,
        currentLocation:
          d.currentLat && d.currentLng
            ? { lat: parseFloat(d.currentLat), lng: parseFloat(d.currentLng) }
            : null,
      }));
      setDrivers(mappedDrivers);
    } catch (error) {
      console.error("Failed to load drivers", error);
    }
  };

  useFocusEffect(
    useCallback(() => {
      loadOrders();
      loadDrivers();

      // Poll for updates every 30s while focused
      const interval = setInterval(() => {
        loadOrders();
        loadDrivers();
      }, 30000);

      return () => clearInterval(interval);
    }, []),
  );

  // No longer using useEffect for legacy subscription
  // useEffect(() => { ... }, []);

  const getDriverMarkerColor = (status?: string) => {
    if (status === "available") return "#10B981";
    if (status === "busy") return "#F97316";
    return "#6B7280";
  };

  const availableDrivers = drivers.filter(
    (d) => d.driverStatus === "available",
  );
  const busyDrivers = drivers.filter((d) => d.driverStatus === "busy");

  const handleAssignOrder = () => {
    if (selectedOrder) {
      navigation.navigate("AssignOrder", { order: selectedOrder });
      setSelectedOrder(null);
    }
  };

  const initialRegion = {
    latitude: 40.7484,
    longitude: -73.9857,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  };

  return (
    <ThemedView style={styles.container}>
      {Platform.OS === "web" ? (
        <View style={styles.webFallback}>
          <MapPin size={48} color={theme.textSecondary} />
          <ThemedText
            type="h3"
            style={{ marginTop: Spacing.lg, textAlign: "center" }}
          >
            عرض الخريطة
          </ThemedText>
          <ThemedText
            type="small"
            style={{
              color: theme.textSecondary,
              textAlign: "center",
              marginTop: Spacing.sm,
            }}
          >
            شغّل التطبيق في Expo Go لعرض الخريطة التفاعلية
          </ThemedText>
          <ThemedText
            type="body"
            style={{ marginTop: Spacing["2xl"], textAlign: "center" }}
          >
            {orders.length} طلب قيد الانتظار
          </ThemedText>
        </View>
      ) : (
        <MapView
          style={styles.map}
          provider={PROVIDER_DEFAULT}
          initialRegion={initialRegion}
          showsUserLocation
          showsMyLocationButton
        >
          {orders.map((order) =>
            order.customerGeo ? (
              <Marker
                key={order.id}
                coordinate={{
                  latitude: order.customerGeo.lat,
                  longitude: order.customerGeo.lng,
                }}
                onPress={() => setSelectedOrder(order)}
              >
                <View style={styles.orderMarker}>
                  <MapPin size={20} color="#EAB308" />
                </View>
              </Marker>
            ) : null,
          )}

          {drivers.map((driver) =>
            driver.currentLocation ? (
              <Marker
                key={driver.id}
                coordinate={{
                  latitude: driver.currentLocation.lat,
                  longitude: driver.currentLocation.lng,
                }}
                title={driver.fullName || "سائق"}
              >
                <View
                  style={[
                    styles.driverMarker,
                    {
                      backgroundColor: `${getDriverMarkerColor(driver.driverStatus)}20`,
                    },
                  ]}
                >
                  <Truck
                    size={20}
                    color={getDriverMarkerColor(driver.driverStatus)}
                  />
                </View>
              </Marker>
            ) : null,
          )}
        </MapView>
      )}

      <View
        style={[
          styles.legend,
          {
            top: insets.top + Spacing.lg,
            backgroundColor: theme.backgroundRoot,
            ...Shadows.md,
          },
        ]}
      >
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#EAB308" }]} />
          <ThemedText type="caption">
            طلبات قيد الانتظار ({orders.length})
          </ThemedText>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#10B981" }]} />
          <ThemedText type="caption">
            سائقون متاحون ({availableDrivers.length})
          </ThemedText>
        </View>
        <View style={styles.legendRow}>
          <View style={[styles.legendDot, { backgroundColor: "#F97316" }]} />
          <ThemedText type="caption">
            سائقون مشغولون ({busyDrivers.length})
          </ThemedText>
        </View>
      </View>

      {selectedOrder ? (
        <View
          style={[
            styles.orderCard,
            {
              bottom: tabBarHeight + Spacing.lg,
              backgroundColor: theme.backgroundRoot,
              ...Shadows.lg,
            },
          ]}
        >
          <View style={styles.orderCardHeader}>
            <View style={{ flex: 1 }}>
              <ThemedText type="h3" numberOfLines={1}>
                {selectedOrder.customerName}
              </ThemedText>
              <ThemedText
                type="small"
                style={{ color: theme.textSecondary }}
                numberOfLines={1}
              >
                {selectedOrder.customerAddress}
              </ThemedText>
            </View>
            <Pressable
              style={styles.closeButton}
              onPress={() => setSelectedOrder(null)}
            >
              <X size={20} color={theme.textSecondary} />
            </Pressable>
          </View>

          <View style={styles.orderCardDetails}>
            <View style={styles.detailRow}>
              <StatusBadge status={selectedOrder.status} />
              <ThemedText type="h4" style={{ color: theme.link }}>
                {selectedOrder.collectionAmount.toFixed(2)} ر.س
              </ThemedText>
            </View>
          </View>

          {/* Dispatcher ETA Info */}
          {selectedOrder.customerGeo && drivers.length > 0 && (
            <View style={{ marginBottom: Spacing.md }}>
              <ThemedText type="caption" style={{ color: theme.textSecondary }}>
                أقرب سائق يبعد:{" "}
                {(() => {
                  const distances = drivers
                    .filter((d) => d.currentLocation)
                    .map((d) =>
                      calculateDistance(
                        d.currentLocation!.lat,
                        d.currentLocation!.lng,
                        selectedOrder.customerGeo!.lat,
                        selectedOrder.customerGeo!.lng,
                      ),
                    );
                  if (distances.length === 0) return "غير معروف";
                  const minKm = Math.min(...distances);
                  return `${minKm.toFixed(1)} كم (${calculateETA(minKm)} دقيقة)`;
                })()}
              </ThemedText>
            </View>
          )}

          <Pressable
            style={[styles.assignButton, { backgroundColor: theme.link }]}
            onPress={handleAssignOrder}
          >
            <Truck size={20} color="#FFFFFF" />
            <ThemedText
              type="body"
              style={{ color: "#FFFFFF", marginRight: Spacing.sm }}
            >
              تعيين سائق
            </ThemedText>
          </Pressable>
        </View>
      ) : null}
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  webFallback: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: Spacing.xl,
  },
  legend: {
    position: "absolute",
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: Spacing.xs,
  },
  legendDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginLeft: Spacing.sm,
  },
  orderMarker: {
    backgroundColor: "rgba(234, 179, 8, 0.2)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  driverMarker: {
    backgroundColor: "rgba(16, 185, 129, 0.2)",
    padding: Spacing.sm,
    borderRadius: BorderRadius.full,
  },
  orderCard: {
    position: "absolute",
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.lg,
    borderRadius: BorderRadius.md,
  },
  orderCardHeader: {
    flexDirection: "row",
    marginBottom: Spacing.md,
  },
  closeButton: {
    padding: Spacing.xs,
  },
  orderCardDetails: {
    marginBottom: Spacing.lg,
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assignButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: Spacing.md,
    borderRadius: BorderRadius.sm,
  },
});
