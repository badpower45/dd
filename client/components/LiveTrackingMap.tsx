import React, { useState, useEffect, useRef } from "react";
import { View, StyleSheet, Pressable } from "react-native";
import MapView, { Marker, Polyline } from "react-native-maps";
import { useTheme } from "@/hooks/useTheme";
import { ThemedText } from "@/components/ThemedText";
import { MapPin, Navigation, Clock } from "lucide-react-native";
import { Spacing, BorderRadius } from "@/constants/theme";

interface Location {
  latitude: number;
  longitude: number;
}

interface LiveTrackingMapProps {
  orderId: number;
  driverLocation?: Location;
  customerLocation: Location;
  restaurantLocation?: Location;
  onCenterDriver?: () => void;
}

export function LiveTrackingMap({
  orderId,
  driverLocation,
  customerLocation,
  restaurantLocation,
  onCenterDriver,
}: LiveTrackingMapProps) {
  const { theme } = useTheme();
  const mapRef = useRef<MapView>(null);
  const [eta, setEta] = useState<number>(0);
  const [distance, setDistance] = useState<number>(0);
  const [route, setRoute] = useState<Location[]>([]);

  // Calculate ETA and distance
  useEffect(() => {
    if (driverLocation && customerLocation) {
      calculateRoute(driverLocation, customerLocation);
    }
  }, [driverLocation, customerLocation]);

  const calculateRoute = async (from: Location, to: Location) => {
    try {
      // Calculate straight-line distance (in reality, use Google Directions API)
      const R = 6371; // Earth radius in km
      const dLat = ((to.latitude - from.latitude) * Math.PI) / 180;
      const dLon = ((to.longitude - from.longitude) * Math.PI) / 180;
      const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((from.latitude * Math.PI) / 180) *
        Math.cos((to.latitude * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      const distanceKm = R * c;

      setDistance(distanceKm);

      // Estimate ETA (assuming 30 km/h average speed)
      const etaMinutes = (distanceKm / 30) * 60;
      setEta(Math.round(etaMinutes));

      // Create simple route (in reality, use Google Directions API)
      setRoute([from, to]);
    } catch (error) {
      console.error("Error calculating route:", error);
    }
  };

  const centerOnDriver = () => {
    if (driverLocation && mapRef.current) {
      mapRef.current.animateToRegion(
        {
          ...driverLocation,
          latitudeDelta: 0.01,
          longitudeDelta: 0.01,
        },
        500,
      );
    }
    onCenterDriver?.();
  };

  const fitToMarkers = () => {
    if (mapRef.current) {
      const markers = [
        driverLocation,
        customerLocation,
        restaurantLocation,
      ].filter(Boolean) as Location[];

      if (markers.length > 0) {
        mapRef.current.fitToCoordinates(markers, {
          edgePadding: { top: 50, right: 50, bottom: 50, left: 50 },
          animated: true,
        });
      }
    }
  };

  useEffect(() => {
    fitToMarkers();
  }, [driverLocation, customerLocation, restaurantLocation]);

  return (
    <View style={styles.container}>
      <MapView
        ref={mapRef}
        style={styles.map}
        initialRegion={{
          ...customerLocation,
          latitudeDelta: 0.02,
          longitudeDelta: 0.02,
        }}
      >
        {/* Route Polyline */}
        {route.length > 1 && (
          <Polyline
            coordinates={route}
            strokeColor={theme.primary}
            strokeWidth={4}
          />
        )}

        {/* Restaurant Marker */}
        {restaurantLocation && (
          <Marker coordinate={restaurantLocation} title="المطعم">
            <View style={[styles.marker, { backgroundColor: theme.warning }]}>
              <MapPin size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Driver Marker */}
        {driverLocation && (
          <Marker coordinate={driverLocation} title="السائق">
            <View style={[styles.marker, { backgroundColor: theme.primary }]}>
              <Navigation size={20} color="#FFFFFF" />
            </View>
          </Marker>
        )}

        {/* Customer Marker */}
        <Marker coordinate={customerLocation} title="العميل">
          <View style={[styles.marker, { backgroundColor: theme.success }]}>
            <MapPin size={20} color="#FFFFFF" />
          </View>
        </Marker>
      </MapView>

      {/* ETA Card */}
      {driverLocation && (
        <View
          style={[
            styles.etaCard,
            {
              backgroundColor: theme.backgroundSecondary,
              borderColor: theme.border,
            },
          ]}
        >
          <View style={styles.etaRow}>
            <Clock size={18} color={theme.primary} />
            <ThemedText type="small" style={{ marginLeft: Spacing.xs }}>
              الوقت المتوقع:
            </ThemedText>
            <ThemedText
              type="h4"
              style={{ color: theme.primary, marginLeft: Spacing.sm }}
            >
              {eta} دقيقة
            </ThemedText>
          </View>
          <ThemedText
            type="caption"
            style={{ color: theme.textSecondary, marginTop: Spacing.xs }}
          >
            المسافة: {distance.toFixed(1)} كم
          </ThemedText>
        </View>
      )}

      {/* Center on Driver Button */}
      {driverLocation && (
        <Pressable
          onPress={centerOnDriver}
          style={({ pressed }) => [
            styles.centerButton,
            {
              backgroundColor: theme.primary,
              opacity: pressed ? 0.8 : 1,
            },
          ]}
        >
          <Navigation size={20} color="#FFFFFF" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  map: {
    flex: 1,
  },
  marker: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 3,
    borderColor: "#FFFFFF",
  },
  etaCard: {
    position: "absolute",
    top: Spacing.lg,
    left: Spacing.lg,
    right: Spacing.lg,
    padding: Spacing.md,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  etaRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  centerButton: {
    position: "absolute",
    bottom: Spacing.xl,
    right: Spacing.lg,
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 5,
  },
});
