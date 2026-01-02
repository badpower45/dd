import { useEffect, useCallback } from "react";
import { supabase } from "./supabase";

interface Location {
  latitude: number;
  longitude: number;
}

export function useRealtimeTracking(orderId: number) {
  const subscribeToDriverLocation = useCallback(
    (callback: (location: Location) => void) => {
      const channel = supabase
        .channel(`order-${orderId}-tracking`)
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "orders",
            filter: `id=eq.${orderId}`,
          },
          (payload) => {
            // Extract driver location from payload
            if (payload.new && payload.new.driver_location) {
              callback(payload.new.driver_location);
            }
          },
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    },
    [orderId],
  );

  return { subscribeToDriverLocation };
}

/**
 * Update driver location in real-time
 */
export async function updateDriverLocation(
  orderId: number,
  location: Location,
): Promise<void> {
  try {
    const { error } = await supabase
      .from("orders")
      .update({
        driver_location: location,
        updated_at: new Date().toISOString(),
      })
      .eq("id", orderId);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating driver location:", error);
    throw error;
  }
}

/**
 * Calculate ETA based on distance and traffic
 */
export function calculateETA(
  distanceKm: number,
  trafficFactor: number = 1.2,
): number {
  // Average speed in city: 25 km/h
  const baseSpeed = 25;
  const adjustedSpeed = baseSpeed / trafficFactor;
  const etaMinutes = (distanceKm / adjustedSpeed) * 60;
  return Math.round(etaMinutes);
}

/**
 * Calculate distance between two coordinates (Haversine formula)
 */
export function calculateDistance(from: Location, to: Location): number {
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
  return R * c;
}
