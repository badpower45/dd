import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";

import { supabase, isSupabaseConfigured } from "@/lib/supabase";
import { queryKeys } from "@/lib/query-keys";

/**
 * اشتراك لحظي لتغييرات السائقين (الموقع، الحالة) لتحديث الخريطة فوراً.
 */
export function useRealtimeDrivers(enabled: boolean = true) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled || !isSupabaseConfigured()) return;

    const channel = supabase
      .channel("drivers-realtime")
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "users",
          filter: "role=eq.driver",
        },
        () => {
          queryClient.invalidateQueries({ queryKey: queryKeys.activeDrivers });
        },
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [enabled, queryClient]);
}
