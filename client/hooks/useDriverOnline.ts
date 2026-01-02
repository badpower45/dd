import { useCallback, useEffect, useRef, useState } from "react";
import { Alert } from "react-native";
import {
  startLocationUpdates,
  stopLocationUpdates,
  type LocationOptions,
} from "@/lib/locationService";

type OnLocationPush = (lat: number, lng: number) => Promise<void> | void;

export function useDriverOnline(
  onLocationPush?: OnLocationPush,
  options?: LocationOptions,
) {
  const [isOnline, setIsOnline] = useState(false);
  const [isRequesting, setIsRequesting] = useState(false);
  const lastSentRef = useRef<number>(0);

  const stopTracking = useCallback(async () => {
    await stopLocationUpdates();
    setIsOnline(false);
  }, []);

  const startTracking = useCallback(async () => {
    setIsRequesting(true);
    const ok = await startLocationUpdates(async (coords) => {
      const now = Date.now();
      // Throttle pushes to avoid flooding the backend
      if (now - lastSentRef.current < 7000) return;
      lastSentRef.current = now;
      try {
        await onLocationPush?.(coords.latitude, coords.longitude);
      } catch (error) {
        console.log("Location push failed", error);
      }
    }, options);

    if (!ok) {
      Alert.alert("تنبيه", "إذن الموقع مطلوب لتفعيل التتبع");
      setIsOnline(false);
      setIsRequesting(false);
      return;
    }

    setIsOnline(true);
    setIsRequesting(false);
  }, [onLocationPush, options]);

  const toggleOnline = useCallback(
    async (value: boolean) => {
      if (value) {
        await startTracking();
      } else {
        await stopTracking();
      }
    },
    [startTracking, stopTracking],
  );

  useEffect(() => {
    return () => {
      stopTracking();
    };
  }, [stopTracking]);

  return {
    isOnline,
    isRequesting,
    toggleOnline,
  };
}
