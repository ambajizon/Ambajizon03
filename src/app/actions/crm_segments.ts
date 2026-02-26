'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

async function getStoreId() {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: store } = await supabase
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .maybeSingle()

    return store?.id
}

export type SegmentFilter = {
    tags?: string[]
    city?: string
    minSpent?: number
    daysSinceOrder?: number
    source?: string
}

// Fetch all segments
export async function getSegments() {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

// Get single segment
export async function getSegment(id: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('customer_segments')
        .select('*')
        .eq('id', id)
        .eq('store_id', storeId)
        .single()

    if (error || !data) return { error: 'Segment not found' }
    return { data }
}

// Create new segment
export async function createSegment(name: string, filters: SegmentFilter) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('customer_segments')
        .insert({
            store_id: storeId,
            name,
            filters
        })
        .select()
        .single()

    if (error) return { error: error.message }

    revalidatePath('/dashboard/crm/segments')
    return { success: true, data }
}

// Delete segment
export async function deleteSegment(id: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customer_segments')
        .delete()
        .eq('id', id)
        .eq('store_id', storeId)

    if (error) return { error: error.message }

    revalidatePath('/dashboard/crm/segments')
    return { success: true }
}

// Preview and evaluate filters
export async function evaluateSegmentFilters(filters: SegmentFilter) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    // Start with all customers for store
    let query = supabase.from('customers').select('id, store_id, full_name, mobile, email, tag, city, source, total_spent, order_count, created_at')
    query = query.eq('store_id', storeId)

    // Apply exact filters
    if (filters.tags && filters.tags.length > 0) {
        query = query.in('tag', filters.tags)
    }

    if (filters.city && filters.city.trim() !== '') {
        query = query.ilike('city', `%${filters.city}%`)
    }

    if (filters.source && filters.source.trim() !== '') {
        query = query.eq('source', filters.source.toLowerCase())
    }

    // Execute customer query first
    const { data: customers, error } = await query

    if (error) return { error: error.message }
    if (!customers || customers.length === 0) {
        return { data: [] }
    }

    let filteredCustomers = [...customers]

    // We do memory aggregation for Orders-related filters if needed (minSpent, daysSinceOrder)
    if (filters.minSpent || filters.daysSinceOrder) {
        // Fetch all orders for matched customers to aggregate their stats locally
        const customerIds = filteredCustomers.map(c => c.id)

        const { data: relatedOrders } = await supabase
            .from('orders')
            .select('customer_id, total_amount, created_at')
            .in('customer_id', customerIds)

        const aggregated = customerIds.map(cid => {
            const custOrders = relatedOrders?.filter(o => o.customer_id === cid) || []
            const totalSpent = custOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
            let daysSinceLast = null
            if (custOrders.length > 0) {
                const latest = new Date(Math.max(...custOrders.map(o => new Date(o.created_at).getTime())))
                daysSinceLast = Math.floor((new Date().getTime() - latest.getTime()) / (1000 * 3600 * 24))
            }

            return { cid, totalSpent, daysSinceLast }
        })

        // Apply Min Spent
        if (filters.minSpent) {
            const eligibleIds = aggregated.filter(a => a.totalSpent >= (filters.minSpent || 0)).map(a => a.cid)
            filteredCustomers = filteredCustomers.filter(c => eligibleIds.includes(c.id))
        }

        // Apply Days Since Order
        if (filters.daysSinceOrder !== undefined) {
            const maxDays = filters.daysSinceOrder
            const eligibleIds = aggregated.filter(a => a.daysSinceLast !== null && a.daysSinceLast <= maxDays).map(a => a.cid)
            filteredCustomers = filteredCustomers.filter(c => eligibleIds.includes(c.id))
        }
    }

    return { data: filteredCustomers }
}
