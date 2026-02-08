import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '../services/supabaseClient';

const SupabaseContext = createContext();

export function SupabaseProvider({ children }) {
    const [session, setSession] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            setSession(session);
            setLoading(false);
        });

        const {
            data: { subscription },
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session);
        });

        return () => subscription.unsubscribe();
    }, []);

    const value = {
        session,
        loading,
        supabase,
    };

    return (
        <SupabaseContext.Provider value={value}>
            {!loading && children}
        </SupabaseContext.Provider>
    );
}

export function useSupabase() {
    return useContext(SupabaseContext);
}
