'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

// Note: Real admin actions often require SERVICE_ROLE key to manage other users (like `auth.admin.createUser`).
// For this MVP, we might assume the current user is an admin and has access to RLS-protected admin tables,
// but creating AUTH users usually requires elevated privileges beyond just RLS.
// We will focus on DB interactions here.

export async function getShopkeepers() {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    // In a real app, verify user.role === 'admin'. 
    // Here we'll just check if logged in.
    if (!user) return []

    const adminDb = createAdminClient()

    // Fetch profiles that are 'shopkeeper' role
    // and join with stores.
    // Since Supabase Auth doesn't easily expose 'users' list to client directly without admin API,
    // we rely on our 'stores' table as the primary record of a shopkeeper existance for now,
    // or we query a public 'profiles' table if we had one.
    // Querying 'stores' table is safest.

    const { data: stores, error } = await adminDb
        .from('stores')
        .select(`
            id,
            name,
            slug,
            shopkeeper_id,
            logo_url,
            shopkeepers (
                email,
                subscription_status,
                trial_end_date
            )
        `)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching shopkeepers:', error)
        return []
    }

    // Map to a cleaner format expected by the UI table
    return stores.map((s: any) => ({
        id: s.id,
        name: s.name,
        slug: s.slug,
        shopkeeper_id: s.shopkeeper_id,
        is_enabled: s.shopkeepers?.subscription_status !== 'cancelled',
        logo_url: s.logo_url,
        email: s.shopkeepers?.email || 'N/A',
        subscription_status: s.shopkeepers?.subscription_status || 'trial',
        trial_end_date: s.shopkeepers?.trial_end_date,
        subscription_end_date: null
    }))
}

export async function getShopkeeperDetail(shopkeeperId: string) {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()
    if (!user) return null

    const adminDb = createAdminClient()

    const { data: store } = await adminDb
        .from('stores')
        .select(`
            *,
            shopkeepers (
                email,
                subscription_status,
                trial_end_date
            )
        `)
        .eq('shopkeeper_id', shopkeeperId)
        .single()

    if (!store) return null

    // Fetch subscription history
    const { data: subs } = await adminDb
        .from('subscriptions')
        .select('*')
        .eq('shopkeeper_id', shopkeeperId)
        .order('created_at', { ascending: false })

    // Health Indicators (Counts)
    const { count: productsCount } = await adminDb.from('products').select('*', { count: 'exact', head: true }).eq('store_id', store.id)
    const { count: ordersCount } = await adminDb.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', store.id)

    // Most recent order for health check
    const { data: lastOrder } = await adminDb.from('orders').select('created_at').eq('store_id', store.id).order('created_at', { ascending: false }).limit(1).single()

    // Fetch trial extensions
    const { data: extensions } = await adminDb
        .from('trial_extensions')
        .select('*')
        .eq('shopkeeper_id', shopkeeperId)
        .order('created_at', { ascending: false })

    // Fetch admin notes
    const { data: notes } = await adminDb
        .from('admin_notes')
        .select('*')
        .eq('shopkeeper_id', shopkeeperId)
        .order('created_at', { ascending: false })

    return {
        store,
        subscriptions: subs || [],
        extensions: extensions || [],
        notes: notes || [],
        health: {
            productsCount: productsCount || 0,
            ordersCount: ordersCount || 0,
            lastOrderDate: lastOrder?.created_at || null
        }
    }
}

export async function extendTrial(storeId: string, newDate: string, reason: string) {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const adminDb = createAdminClient()

    // Update Store (if it has it for legacy reasons)
    const { error: storeError } = await adminDb
        .from('stores')
        .update({ trial_end_date: newDate })
        .eq('id', storeId)

    if (storeError) return { error: storeError.message }

    // Get Shopkeeper ID
    const { data: storeDetails } = await adminDb.from('stores').select('shopkeeper_id').eq('id', storeId).single()
    const shopkeeperId = storeDetails?.shopkeeper_id

    // Update Shopkeepers Table
    if (shopkeeperId) {
        await adminDb.from('shopkeepers').update({
            trial_end_date: newDate,
            is_trial_extended: true
        }).eq('id', shopkeeperId)
    }

    // Log Extension
    await adminDb
        .from('trial_extensions')
        .insert({
            shopkeeper_id: shopkeeperId,
            admin_id: user.id,
            extended_to: newDate,
            reason: reason
        })

    revalidatePath(`/admin/shopkeepers`)
    if (shopkeeperId) revalidatePath(`/admin/shopkeepers/${shopkeeperId}`)
    return { success: true }
}

export async function toggleStoreStatus(storeId: string, isEnabled: boolean) {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const adminDb = createAdminClient()

    // Get shopkeeper_id
    const { data: store } = await adminDb.from('stores').select('shopkeeper_id').eq('id', storeId).single()
    if (!store?.shopkeeper_id) return { error: 'Store not found' }

    const newStatus = isEnabled ? 'active' : 'cancelled'
    const { error } = await adminDb
        .from('shopkeepers')
        .update({ subscription_status: newStatus })
        .eq('id', store.shopkeeper_id)

    if (error) return { error: error.message }
    revalidatePath(`/admin/shopkeepers`)
    return { success: true }
}

export async function addAdminNote(shopkeeperId: string, noteText: string) {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const adminDb = createAdminClient()
    const { error } = await adminDb.from('admin_notes').insert({
        shopkeeper_id: shopkeeperId,
        admin_id: user.id,
        note: noteText
    })

    if (error) return { error: error.message }
    revalidatePath(`/admin/shopkeepers/${shopkeeperId}`)
    return { success: true }
}

export async function activateSubscriptionManually(shopkeeperId: string) {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()

    if (!user) return { error: 'Unauthorized' }

    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1) // 1 year from now

    const adminDb = createAdminClient()
    const { error } = await adminDb.from('shopkeepers').update({
        subscription_status: 'active'
    }).eq('id', shopkeeperId)

    if (error) return { error: error.message }
    revalidatePath(`/admin/shopkeepers/${shopkeeperId}`)
    return { success: true }
}

export async function getAdminDashboardStats() {
    const supabaseSession = await createClient()
    const { data: { user } } = await supabaseSession.auth.getUser()
    if (!user) return null

    const adminDb = createAdminClient()

    const { data: shopkeepers } = await adminDb.from('shopkeepers').select('*')
    const totalShopkeepers = shopkeepers?.length || 0
    const activeShopkeepers = shopkeepers?.filter(s => s.subscription_status === 'active').length || 0
    const trialShopkeepers = shopkeepers?.filter(s => s.subscription_status === 'trial').length || 0
    const expiredShopkeepers = shopkeepers?.filter(s => s.subscription_status === 'expired').length || 0

    const now = new Date()
    const alertExpiringTrials = shopkeepers?.filter(s => {
        if (s.subscription_status !== 'trial') return false
        const end = new Date(s.trial_end_date)
        const diff = (end.getTime() - now.getTime()) / (1000 * 3600 * 24)
        return diff > 0 && diff <= 7
    }).length || 0

    const alertExpiringSubs = 0 // Not applicable without subscription_end_date logic

    // Get revenue
    const { data: subs } = await adminDb.from('subscriptions').select('*')
    const paidSubs = subs?.filter(s => ['paid', 'success', 'completed', 'active'].includes((s.status || '').toLowerCase())) || []

    const totalRevenue = paidSubs.reduce((sum, s) => sum + (Number(s.amount) || 0), 0)

    const thisMonth = new Date()
    const thisMonthRevenue = paidSubs.filter(s => {
        const d = new Date(s.created_at)
        return d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear()
    }).reduce((sum, s) => sum + (Number(s.amount) || 0), 0)

    // Recent signups (stores)
    const { data: recentStores } = await adminDb.from('stores').select('name, created_at, slug').order('created_at', { ascending: false }).limit(5)

    return {
        totalShopkeepers, activeShopkeepers, trialShopkeepers, expiredShopkeepers,
        totalRevenue, thisMonthRevenue, alertExpiringTrials, alertExpiringSubs,
        recentSignups: recentStores || []
    }
}

export async function createShopkeeper(data: { fullName: string, email: string, phone: string, storeName: string, slug: string }) {
    const supabaseClient = createClient()
    const { data: { user } } = await (await supabaseClient).auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') return { error: 'Unauthorized' }

    // Use service role key to bypass RLS and create new auth user directly
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create Auth User
    const { data: authData, error: authError } = await adminSupabase.auth.admin.createUser({
        email: data.email,
        password: 'password123', // Default password
        email_confirm: true,
        user_metadata: {
            role: 'shopkeeper',
            full_name: data.fullName
        }
    })

    if (authError) return { error: authError.message }
    const newUserId = authData.user.id

    // 2. Add to Shopkeepers table (starts trial)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 15) // 15 Days trial

    const { error: skError } = await adminSupabase.from('shopkeepers').insert({
        id: newUserId,
        email: data.email,
        trial_start_date: new Date().toISOString(),
        trial_end_date: trialEndDate.toISOString(),
        subscription_status: 'trial',
        is_trial_extended: false
    })

    if (skError) return { error: skError.message }

    // 3. Add to Stores table
    const { error: storeError } = await adminSupabase.from('stores').insert({
        shopkeeper_id: newUserId,
        name: data.storeName,
        slug: data.slug,
        phone_number: data.phone,
        is_enabled: true
    })

    if (storeError) return { error: storeError.message }

    revalidatePath('/admin/shopkeepers')
    revalidatePath('/admin')
    return { success: true }
}

export async function getBillingRecords() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') return []

    const { data } = await (await supabase)
        .from('subscriptions')
        .select(`
            *,
            stores ( name, slug )
        `)
        .order('created_at', { ascending: false })

    return data || []
}

export async function markPaymentPaid(paymentId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user || user.user_metadata?.role !== 'admin') return { error: 'Unauthorized' }

    // 1. Get payment details
    const { data: payment } = await (await supabase).from('subscriptions').select('*').eq('id', paymentId).single()
    if (!payment) return { error: 'Payment not found' }

    // 2. Mark payment paid
    await (await supabase).from('subscriptions').update({ status: 'paid', transaction_id: 'MANUAL_' + Date.now() }).eq('id', paymentId)

    // 3. Mark shopkeeper subscription active 
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    await (await supabase).from('shopkeepers').update({
        subscription_status: 'active',
        subscription_end_date: endDate.toISOString()
    }).eq('id', payment.shopkeeper_id)

    revalidatePath('/admin/billing')
    revalidatePath(`/admin/shopkeepers/${payment.shopkeeper_id}`)
    revalidatePath('/admin')
    return { success: true }
}

// --- Admin Settings (Stored in Admin User Metadata for MVP) ---

export async function getAdminSettings() {
    const supabaseClient = createClient()
    const { data: { user } } = await (await supabaseClient).auth.getUser()

    if (!user || user.user_metadata?.role !== 'admin') return null
    return user.user_metadata || {}
}

export async function saveAdminSettings(settings: any) {
    const supabaseClient = createClient()
    const { data: { user } } = await (await supabaseClient).auth.getUser()

    if (!user || user.user_metadata?.role !== 'admin') return { error: 'Unauthorized' }

    // Use admin client to safely update user metadata
    const { createClient: createSupabaseClient } = await import('@supabase/supabase-js')
    const adminSupabase = createSupabaseClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    const updatedMetadata = { ...user.user_metadata, ...settings }

    const { error } = await adminSupabase.auth.admin.updateUserById(user.id, {
        user_metadata: updatedMetadata
    })

    if (error) return { error: error.message }

    // Refresh session or let client revalidate
    revalidatePath('/admin/settings')
    return { success: true }
}

// --- Admin Analytics ---

export async function getAdminAnalytics() {
    const supabaseClient = createClient()
    const { data: { user } } = await (await supabaseClient).auth.getUser()

    if (!user || user.user_metadata?.role !== 'admin') return null

    // Fetch Last 6 months boundaries
    const now = new Date()
    const past6Months = new Date()
    past6Months.setMonth(now.getMonth() - 5)
    past6Months.setDate(1) // Start of 6th month ago
    past6Months.setHours(0, 0, 0, 0)

    // 1. Revenue Over Time
    const { data: subs } = await (await supabaseClient)
        .from('subscriptions')
        .select('amount, created_at, status')
        .gte('created_at', past6Months.toISOString())

    // 2. Shopkeeper Growth Over Time
    const { data: stores } = await (await supabaseClient)
        .from('stores')
        .select('created_at')
        .gte('created_at', past6Months.toISOString())

    // Initialize map
    const monthlyData: Record<string, { name: string, revenue: number, newStores: number }> = {}

    for (let i = 0; i < 6; i++) {
        const d = new Date()
        d.setMonth(now.getMonth() - (5 - i))
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}` // yyyy-mm
        const name = d.toLocaleDateString('default', { month: 'short', year: '2-digit' }) // Jan 24

        monthlyData[key] = { name, revenue: 0, newStores: 0 }
    }

    // Process subs
    if (subs) {
        subs.forEach(s => {
            if (['paid', 'success', 'completed', 'active'].includes((s.status || '').toLowerCase())) {
                const date = new Date(s.created_at)
                const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
                if (monthlyData[key]) {
                    monthlyData[key].revenue += (Number(s.amount) || 0)
                }
            }
        })
    }

    // Process stores
    if (stores) {
        stores.forEach(s => {
            const date = new Date(s.created_at)
            const key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
            if (monthlyData[key]) {
                monthlyData[key].newStores += 1
            }
        })
    }

    const chartData = Object.keys(monthlyData).sort().map(k => monthlyData[k])

    return { chartData }
}
