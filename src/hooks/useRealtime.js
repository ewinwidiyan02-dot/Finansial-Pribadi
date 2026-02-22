import { useEffect } from 'react';
import { api } from '../services/api';

export function useRealtime(tables, callback) {
    useEffect(() => {
        // If it's a single string, convert to array
        const tableList = Array.isArray(tables) ? tables : [tables];
        const channels = [];

        tableList.forEach(table => {
            const channel = api.supabase
                .channel(`public:${table}`)
                .on(
                    'postgres_changes',
                    { event: '*', schema: 'public', table: table },
                    (payload) => {
                        console.log(`Realtime update on ${table}:`, payload);
                        if (callback) callback();
                    }
                )
                .subscribe();

            channels.push(channel);
        });

        // Cleanup function
        return () => {
            channels.forEach(channel => {
                api.supabase.removeChannel(channel);
            });
        };
    }, [tables, callback]);
}
