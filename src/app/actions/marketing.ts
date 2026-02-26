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
        .eq('shopkeeper_id', user.id) // Check this column name!
        .single()

    return store?.id
}

// --- Coupons ---

export async function getCoupons() {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return []

    const { data } = await supabase
        .from('coupons')
        .select('*')
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    return data || []
}

export async function createCoupon(data: any) {
    try {
        const supabase = await createClient()
        const storeId = await getStoreId()
        if (!storeId) return { error: 'Unauthorized' }

        // Ensure numeric fields are numbers
        // Ensure numeric fields are numbers
        const couponData = {
            store_id: storeId,
            code: data.code,
            type: data.discount_type, // Map discount_type to type
            value: Number(data.value),
            min_order_amount: Number(data.min_order_amount || 0),
            max_uses: Number(data.max_uses || 100),
            expiry_date: data.expiry_date,
            is_enabled: true,
            used_count: 0
        }

        console.log('Creating coupon:', couponData)

        const { error } = await supabase
            .from('coupons')
            .insert(couponData)

        if (error) {
            console.error('Create Coupon DB Error:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/marketing/coupons')
        return { success: true }
    } catch (err: any) {
        console.error('Create Coupon Exception:', err)
        return { error: err.message || 'Failed to create coupon' }
    }
}

export async function deleteCoupon(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('coupons').delete().eq('id', id)
        if (error) return { error: error.message }
        revalidatePath('/dashboard/marketing/coupons')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Failed to delete coupon' }
    }
}

// --- Offers ---

export async function getOffers() {
    try {
        const supabase = await createClient()
        const storeId = await getStoreId()
        if (!storeId) return []

        const { data, error } = await supabase
            .from('festival_offers')
            .select('*')
            .eq('store_id', storeId)
            .order('created_at', { ascending: false })

        if (error) {
            console.error('Get Offers Error:', error)
            return []
        }

        return data || []
    } catch (err) {
        console.error('Get Offers Exception:', err)
        return []
    }
}

export async function createOffer(data: any) {
    try {
        const supabase = await createClient()
        const storeId = await getStoreId()
        if (!storeId) return { error: 'Unauthorized' }

        console.log('Creating offer:', data)

        const validData = {
            store_id: storeId,
            name: data.name,
            banner_url: data.banner_url || 'https://res.cloudinary.com/djp3zvlud/image/upload/v1739947938/ambajizon/products/placeholder.png',
            start_date: data.start_date ? new Date(data.start_date).toISOString() : null,
            end_date: data.end_date ? new Date(data.end_date).toISOString() : null,
            is_enabled: data.is_enabled !== undefined ? data.is_enabled : true
        }

        const { error } = await supabase
            .from('festival_offers')
            .insert(validData)

        if (error) {
            console.error('Create Offer DB Error:', error)
            return { error: error.message }
        }

        revalidatePath('/dashboard/marketing/offers')
        return { success: true }
    } catch (err: any) {
        console.error('Create Offer Exception:', err)
        return { error: err.message || 'Failed to create offer' }
    }
}

export async function deleteOffer(id: string) {
    try {
        const supabase = await createClient()
        const { error } = await supabase.from('festival_offers').delete().eq('id', id)
        if (error) return { error: error.message }
        revalidatePath('/dashboard/marketing/offers')
        return { success: true }
    } catch (err: any) {
        return { error: err.message || 'Failed to delete offer' }
    }
}

// --- Reminders ---

export async function getReminders() {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return []

    const { data } = await supabase
        .from('marketing_reminders')
        .select('*')
        .eq('store_id', storeId)
        .order('trigger_after_days', { ascending: true })

    return data || []
}

export async function createReminder(data: any) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const insertData = {
        trigger_after_days: data.trigger_after_days,
        message_template: data.message_template,
        is_enabled: data.is_enabled ?? true,
        store_id: storeId
    }

    const { error } = await supabase.from('marketing_reminders').insert(insertData)
    if (error) {
        if (error.message.includes('is_enabled') || error.code === 'PGRST204') {
            delete (insertData as any).is_enabled
            const { error: err2 } = await supabase.from('marketing_reminders').insert(insertData)
            if (err2) return { error: err2.message }
        } else {
            return { error: error.message }
        }
    }
    revalidatePath('/dashboard/marketing/reminders')
    return { success: true }
}

export async function updateReminder(id: string, data: any) {
    const supabase = await createClient()

    const updateData = {
        trigger_after_days: data.trigger_after_days,
        message_template: data.message_template,
        is_enabled: data.is_enabled
    }

    const { error } = await supabase.from('marketing_reminders').update(updateData).eq('id', id)
    if (error) {
        if (error.message.includes('is_enabled') || error.code === 'PGRST204') {
            delete (updateData as any).is_enabled
            const { error: err2 } = await supabase.from('marketing_reminders').update(updateData).eq('id', id)
            if (err2) return { error: err2.message }
        } else {
            return { error: error.message }
        }
    }
    revalidatePath('/dashboard/marketing/reminders')
    return { success: true }
}

export async function deleteReminder(id: string) {
    const supabase = await createClient()
    const { error } = await supabase.from('marketing_reminders').delete().eq('id', id)
    if (error) return { error: error.message }
    revalidatePath('/dashboard/marketing/reminders')
    return { success: true }
}


export async function getCustomersForReminder(days: number) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return []

    const { data: customers } = await supabase
        .from('customers')
        .select('*, orders(created_at)')
        .eq('store_id', storeId)

    if (!customers) return []

    const thresholdDate = new Date()
    thresholdDate.setDate(thresholdDate.getDate() - days)

    return customers.filter((c: any) => {
        if (!c.orders || c.orders.length === 0) return false

        const dates = c.orders.map((o: any) => new Date(o.created_at).getTime())
        const lastOrderTime = Math.max(...dates)
        const lastOrderDate = new Date(lastOrderTime)

        return lastOrderDate < thresholdDate
    }).map((c: any) => ({
        ...c,
        last_order_date: new Date(Math.max(...c.orders.map((o: any) => new Date(o.created_at).getTime()))).toISOString()
    }))
}
