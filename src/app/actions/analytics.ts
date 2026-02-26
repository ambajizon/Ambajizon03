'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function recordVisit(storeId: string) {
    const supabase = createClient()
    // Call the security definer function
    const { error } = await (await supabase).rpc('increment_store_visit', { target_store_id: storeId })
    if (error) {
        console.error('Error recording visit:', error)
    }
}

export async function getAnalyticsData(storeId: string, days = 30) {
    const supabase = createClient()

    const { data: analytics, error } = await (await supabase)
        .from('store_analytics')
        .select('*')
        .eq('store_id', storeId)
        .order('date', { ascending: true })
        .limit(days)

    if (error) return []
    return analytics
}

export async function getDashboardStats(storeId: string) {
    const supabase = createClient()

    // Aggregate stats
    const { data, error } = await (await supabase)
        .from('store_analytics')
        .select('visitor_count, order_count, revenue')
        .eq('store_id', storeId)

    if (error || !data) return { visitors: 0, orders: 0, revenue: 0 }

    const visitors = data.reduce((acc, curr) => acc + (curr.visitor_count || 0), 0)
    const orders = data.reduce((acc, curr) => acc + (curr.order_count || 0), 0)
    const revenue = data.reduce((acc, curr) => acc + (curr.revenue || 0), 0)

    return { visitors, orders, revenue }
}
