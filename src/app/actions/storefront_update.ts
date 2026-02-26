'use server'

import { createClient } from '@/lib/supabase/client' // Oops, server actions should use server client usually, but public read is fine with client or no-cookie server.
// Actually let's use the standard pattern
import { createClient as createServerClient } from '@/lib/supabase/server'

// ... existing actions

export async function getStoreOffers(storeId: string) {
    const supabase = createServerClient()
    const now = new Date().toISOString()

    const { data } = await (await supabase)
        .from('festival_offers')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true }) // Ending soonest first

    return data || []
}
