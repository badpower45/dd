import { useEffect } from 'react';
import { supabase, isSupabaseConfigured } from '@/lib/supabase';
import { useQueryClient } from '@tanstack/react-query';
import { Order } from '@/lib/types';

export function useOrderSubscription() {
    const queryClient = useQueryClient();

    useEffect(() => {
        if (!isSupabaseConfigured()) {
            console.log('Supabase not configured, skipping realtime subscription');
            return;
        }

        const channel = supabase
            .channel('public:orders')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'orders',
                },
                (payload) => {
                    console.log('Real-time order update:', payload);
                    // Invalidate orders query to refetch fresh data
                    queryClient.invalidateQueries({ queryKey: ['orders'] });

                    // Optimistic update could go here if needed
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);
}
