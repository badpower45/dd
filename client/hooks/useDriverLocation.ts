import { useEffect, useState } from "react";
import * as Location from "expo-location";
import { useAuth } from "@/contexts/AuthContext";
import { api } from "@/lib/api";
import { Alert } from "react-native";

export function useDriverLocation() {
  const { user } = useAuth();
  const [location, setLocation] = useState<Location.LocationObject | null>(
    null,
  );
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let subscription: Location.LocationSubscription | null = null;

    const startTracking = async () => {
      if (user?.role !== "driver") return;

      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        setErrorMsg("Permission to access location was denied");
        Alert.alert(
          "Permission required",
          "Location permission is needed for driver tracking.",
        );
        return;
      }

      subscription = await Location.watchPositionAsync(
        {
          accuracy: Location.Accuracy.High,
          timeInterval: 10000, // Update every 10 seconds
          distanceInterval: 50, // Update every 50 meters
        },
        async (loc) => {
          setLocation(loc);
          try {
            // Send to Backend
            await api.drivers.updateLocation(
              user.id,
              loc.coords.latitude,
              loc.coords.longitude,
            );
          } catch (err) {
            console.error("Failed to update location", err);
          }
        },
      );
    };

    startTracking();

    return () => {
      if (subscription) {
        subscription.remove();
      }
    };
  }, [user]);

  return { location, errorMsg };
}
