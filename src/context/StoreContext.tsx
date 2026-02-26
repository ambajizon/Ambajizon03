'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

interface StoreInfo {
    name: string | null;
    logo_url: string | null;
    slug: string | null;
}

interface StoreContextType {
    storeInfo: StoreInfo;
    updateStoreInfo: (updates: Partial<StoreInfo>) => void;
    isLoading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined)

export function StoreProvider({ children }: { children: React.ReactNode }) {
    const [storeInfo, setStoreInfo] = useState<StoreInfo>({
        name: null,
        logo_url: null,
        slug: null
    })
    const [isLoading, setIsLoading] = useState(true)

    useEffect(() => {
        async function fetchInitialStoreInfo() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()

                if (user) {
                    const { data: store } = await supabase
                        .from('stores')
                        .select('name, logo_url, slug')
                        .eq('shopkeeper_id', user.id)
                        .maybeSingle()

                    if (store) {
                        setStoreInfo({
                            name: store.name,
                            logo_url: store.logo_url,
                            slug: store.slug
                        })
                    }
                }
            } catch (error) {
                console.error('Failed to fetch store info for context:', error)
            } finally {
                setIsLoading(false)
            }
        }

        fetchInitialStoreInfo()
    }, [])

    const updateStoreInfo = (updates: Partial<StoreInfo>) => {
        setStoreInfo(current => ({ ...current, ...updates }))
    }

    return (
        <StoreContext.Provider value={{ storeInfo, updateStoreInfo, isLoading }}>
            {children}
        </StoreContext.Provider>
    )
}

export function useStoreContext() {
    const context = useContext(StoreContext)
    if (context === undefined) {
        throw new Error('useStoreContext must be used within a StoreProvider')
    }
    return context
}
