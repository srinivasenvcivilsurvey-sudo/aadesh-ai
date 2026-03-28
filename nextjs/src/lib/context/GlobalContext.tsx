// src/lib/context/GlobalContext.tsx
'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { createSPASassClientAuthenticated as createSPASassClient } from '@/lib/supabase/client';

type User = {
    email: string;
    id: string;
    registered_at: Date;
    credits_remaining: number;
    total_orders_generated: number;
};

interface GlobalContextType {
    loading: boolean;
    user: User | null;
    refreshProfile: () => Promise<void>;
}

const GlobalContext = createContext<GlobalContextType | undefined>(undefined);

export function GlobalProvider({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState<User | null>(null);

    const loadProfile = async () => {
        try {
            const supabase = await createSPASassClient();
            const client = supabase.getSupabaseClient();

            // Get auth user
            const { data: { user: authUser } } = await client.auth.getUser();
            if (!authUser) throw new Error('User not found');

            // Fetch profile from profiles table
            const { data: profile } = await client
                .from('profiles' as never)
                .select('credits_remaining, total_orders_generated')
                .eq('id' as never, authUser.id as never)
                .single();

            setUser({
                email: authUser.email!,
                id: authUser.id,
                registered_at: new Date(authUser.created_at),
                credits_remaining: (profile as { credits_remaining: number } | null)?.credits_remaining ?? 3,
                total_orders_generated: (profile as { total_orders_generated: number } | null)?.total_orders_generated ?? 0,
            });
        } catch (error) {
            console.error('Error loading data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadProfile();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const refreshProfile = async () => {
        await loadProfile();
    };

    return (
        <GlobalContext.Provider value={{ loading, user, refreshProfile }}>
            {children}
        </GlobalContext.Provider>
    );
}

export const useGlobal = () => {
    const context = useContext(GlobalContext);
    if (context === undefined) {
        throw new Error('useGlobal must be used within a GlobalProvider');
    }
    return context;
};
