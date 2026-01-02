/**
 * Custom hook for real-time order updates
 */

import { useEffect, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import supabaseApi, { Order } from "@/lib/supabaseApi";
import { RealtimeChannel } from "@supabase/supabase-js";

export function useRealtimeOrders(enabled: boolean = true) {
  const [channel, setChannel] = useState<RealtimeChannel | null>(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    const subscription = supabaseApi.orders.subscribeToOrders(
      (order: Order) => {
        // Invalidate relevant queries when orders update
        queryClient.invalidateQueries({ queryKey: ["orders"] });
        queryClient.invalidateQueries({ queryKey: ["order", order.id] });
        queryClient.invalidateQueries({ queryKey: ["stats"] });
      },
    );

    setChannel(subscription);

    return () => {
      if (subscription) {
        supabaseApi.orders.unsubscribe(subscription);
      }
    };
  }, [enabled, queryClient]);

  return channel;
}
