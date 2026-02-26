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

export async function getCustomerProfile(customerId: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data: customer, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .eq('store_id', storeId)
        .single()

    if (error || !customer) return { error: 'Customer not found' }
    return { data: customer }
}

export async function updateCustomerProfile(customerId: string, data: any) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customers')
        .update({
            full_name: data.full_name,
            email: data.email,
            mobile: data.mobile,
            city: data.city,
            state: data.state,
            birthday: data.birthday,
            source: data.source,
            star_rating: data.star_rating
        })
        .eq('id', customerId)
        .eq('store_id', storeId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function updateCustomerControls(customerId: string, isBanned: boolean, banReason: string, codBlocked: boolean, codBlockReason: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customers')
        .update({
            is_banned: isBanned,
            ban_reason: banReason,
            cod_blocked: codBlocked,
            cod_block_reason: codBlockReason
        })
        .eq('id', customerId)
        .eq('store_id', storeId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function getCustomerAnalytics(customerId: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    // Fetch customer to get loyalty points balance
    const { data: customer } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', customerId)
        .single()

    const { data: orders } = await supabase
        .from('orders')
        .select('id, total_amount, created_at, order_items(product_name, product_id, quantity, price)')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

    if (!orders || orders.length === 0) {
        return {
            data: {
                totalOrders: 0,
                totalSpend: 0,
                aov: 0,
                mostBoughtProduct: 'N/A',
                mostBoughtCategory: 'N/A',
                daysSinceLastOrder: null,
                loyaltyPoints: customer?.loyalty_points || 0
            }
        }
    }

    const totalOrders = orders.length
    const totalSpend = orders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)
    const aov = Math.round(totalSpend / totalOrders)

    // Calculate most bought product and category (if applicable)
    const productFrequency: Record<string, number> = {}
    // Note: since we don't have category mapped directly in order_items easily without another query, 
    // we will just base most bought product on product_name frequency.

    orders.forEach(o => {
        o.order_items?.forEach((item: any) => {
            const pName = item.product_name || 'Unknown Product'
            productFrequency[pName] = (productFrequency[pName] || 0) + (Number(item.quantity) || 1)
        })
    })

    let mostBoughtProduct = 'N/A'
    let maxQty = 0
    Object.entries(productFrequency).forEach(([name, qty]) => {
        if (qty > maxQty) {
            maxQty = qty
            mostBoughtProduct = name
        }
    })

    let mostBoughtCategory = 'N/A'
    const productIds = Array.from(new Set(orders.flatMap(o => o.order_items?.map((i: any) => i.product_id)).filter(Boolean)))

    if (productIds.length > 0) {
        // We do a direct join with categories via the foreign key on products
        const { data: productsData } = await supabase
            .from('products')
            .select(`id, category_id, categories(name)`)
            .in('id', productIds)

        const productCategoryMap: Record<string, string> = {}
        productsData?.forEach((p: any) => {
            if (p.categories && p.categories.name) {
                productCategoryMap[p.id] = p.categories.name
            }
        })

        const categoryFrequency: Record<string, number> = {}
        orders.forEach(o => {
            o.order_items?.forEach((item: any) => {
                if (item.product_id && productCategoryMap[item.product_id]) {
                    const catName = productCategoryMap[item.product_id]
                    categoryFrequency[catName] = (categoryFrequency[catName] || 0) + (Number(item.quantity) || 1)
                }
            })
        })

        let maxCatQty = 0
        Object.entries(categoryFrequency).forEach(([name, qty]) => {
            if (qty > maxCatQty) {
                maxCatQty = qty
                mostBoughtCategory = name
            }
        })
    }

    let daysSinceLastOrder = null
    if (orders.length > 0 && orders[0].created_at) {
        daysSinceLastOrder = Math.floor((new Date().getTime() - new Date(orders[0].created_at).getTime()) / (1000 * 3600 * 24))
    }

    return {
        data: {
            totalOrders,
            totalSpend,
            aov,
            mostBoughtProduct: maxQty > 0 ? mostBoughtProduct : 'N/A',
            mostBoughtCategory,
            daysSinceLastOrder,
            loyaltyPoints: customer?.loyalty_points || 0
        }
    }
}

export async function autoTagCustomers() {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    // Fetch all customers for this store
    const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('store_id', storeId)

    if (!customers || customers.length === 0) return { success: true }

    // Fetch orders to calculate stats
    const customerIds = customers.map(c => c.id)
    const { data: orders } = await supabase
        .from('orders')
        .select('customer_id, total_amount, created_at')
        .in('customer_id', customerIds)

    const now = new Date()

    // Process each customer
    for (const customer of customers) {
        const cOrders = orders?.filter(o => o.customer_id === customer.id) || []
        const orderCount = cOrders.length
        const totalSpent = cOrders.reduce((sum, o) => sum + (Number(o.total_amount) || 0), 0)

        let lastOrderDate: Date | null = null
        if (orderCount > 0) {
            lastOrderDate = new Date(Math.max(...cOrders.map(o => new Date(o.created_at).getTime())))
        }

        let newTag = 'new'

        if (orderCount === 0 || orderCount === 1) {
            newTag = 'New'
        } else if (orderCount >= 2 && orderCount <= 4) {
            newTag = 'Regular'
        }

        if (orderCount >= 5 || totalSpent >= 5000) {
            newTag = 'VIP'
        }

        if (lastOrderDate) {
            const daysSinceLastOrder = Math.floor((now.getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24))
            if (daysSinceLastOrder >= 30 && daysSinceLastOrder < 60 && newTag !== 'VIP') {
                newTag = 'At Risk'
            } else if (daysSinceLastOrder >= 60 && newTag !== 'VIP') {
                newTag = 'Inactive'
            }
        }

        await supabase
            .from('customers')
            .update({ auto_tag: newTag, tag: newTag }) // tag to support legacy display
            .eq('id', customer.id)
    }

    return { success: true }
}

export async function bulkUpdateTag(customerIds: string[], tag: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customers')
        .update({ tag: tag, auto_tag: tag })
        .in('id', customerIds)
        .eq('store_id', storeId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function bulkUpdateBanStatus(customerIds: string[], isBanned: boolean, reason: string = '') {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customers')
        .update({ is_banned: isBanned, ban_reason: reason })
        .in('id', customerIds)
        .eq('store_id', storeId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function bulkUpdateCODStatus(customerIds: string[], codBlocked: boolean, reason: string = '') {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { error } = await supabase
        .from('customers')
        .update({ cod_blocked: codBlocked, cod_block_reason: reason })
        .in('id', customerIds)
        .eq('store_id', storeId)

    if (error) return { error: error.message }
    return { success: true }
}

// --- STEP 3D: Loyalty Points ---
export async function getLoyaltyTransactions(customerId: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('loyalty_transactions')
        .select('*')
        .eq('customer_id', customerId)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function addLoyaltyTransaction(customerId: string, points: number, type: 'earned' | 'redeemed', note: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    if (points <= 0) return { error: 'Points must be greater than 0' }

    const { data: customer } = await supabase
        .from('customers')
        .select('loyalty_points')
        .eq('id', customerId)
        .single()

    const currentPoints = customer?.loyalty_points || 0
    if (type === 'redeemed' && currentPoints < points) {
        return { error: 'Insufficient loyalty points to redeem' }
    }

    const newBalance = type === 'earned' ? currentPoints + points : currentPoints - points

    const { error: txError } = await supabase
        .from('loyalty_transactions')
        .insert({
            customer_id: customerId,
            store_id: storeId,
            points,
            type,
            note
        })

    if (txError) return { error: txError.message }

    const { error: updError } = await supabase
        .from('customers')
        .update({ loyalty_points: newBalance })
        .eq('id', customerId)

    if (updError) return { error: updError.message }
    return { success: true, newBalance }
}

// --- STEP 3E: Order History ---
export async function getCustomerOrders(customerId: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('orders')
        .select(`
            id, total_amount, status, payment_status, payment_method, created_at,
            order_items ( id, product_id, product_name, quantity, price, products (images) )
        `)
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

// --- STEP 3F & 3G: Communications and Notes ---
export async function getCustomerCommunications(customerId: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    const { data, error } = await supabase
        .from('customer_communications')
        .select('*')
        .eq('customer_id', customerId)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    if (error) return { error: error.message }
    return { data }
}

export async function addCustomerCommunication(customerId: string, type: 'whatsapp' | 'call' | 'note' | 'email', message: string) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }
    const { data: { user } } = await supabase.auth.getUser()

    const { error } = await supabase
        .from('customer_communications')
        .insert({
            customer_id: customerId,
            store_id: storeId,
            type,
            message,
            created_by: user?.id
        })

    if (error) return { error: error.message }
    return { success: true }
}

export async function updateCustomerCommunication(commId: string, message: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('customer_communications')
        .update({ message })
        .eq('id', commId)

    if (error) return { error: error.message }
    return { success: true }
}

export async function deleteCustomerCommunication(commId: string) {
    const supabase = await createClient()

    const { error } = await supabase
        .from('customer_communications')
        .delete()
        .eq('id', commId)

    if (error) return { error: error.message }
    return { success: true }
}

// --- STEP 6: Bulk CSV Import ---
export async function bulkImportCustomers(rows: any[]) {
    const supabase = await createClient()
    const storeId = await getStoreId()
    if (!storeId) return { error: 'Unauthorized' }

    if (rows.length === 0) return { error: 'No data to import' }

    // Map CSV rows to DB columns, assuming lowercase headers
    // Required: Name/Full Name, Mobile/Phone
    const cleanData = rows.map(r => {
        return {
            store_id: storeId,
            full_name: r.name || r.full_name || r.customer_name || 'Unknown',
            mobile: r.mobile || r.phone || null,
            email: r.email || null,
            city: r.city || null,
            state: r.state || null,
            source: r.source && ['tourist', 'referral', 'social', 'walk-in', 'other'].includes(r.source.toLowerCase())
                ? r.source.toLowerCase() : 'other',
            tag: r.tag || 'new'
        }
    }).filter(r => r.mobile || r.email) // Need at least mobile or email

    // We cannot easily do an upsert on mobile/store_id without a unique constraint.
    // However, if we do a direct insert, it will just insert them.
    // For a robust system, we should query existing first to prevent duplicates.
    const { data: existing } = await supabase
        .from('customers')
        .select('mobile, email')
        .eq('store_id', storeId)

    const existingMobiles = new Set(existing?.filter(e => e.mobile).map(e => e.mobile))
    const existingEmails = new Set(existing?.filter(e => e.email).map(e => e.email))

    const newRecords = cleanData.filter(d =>
        (d.mobile && !existingMobiles.has(d.mobile)) ||
        (d.email && !existingEmails.has(d.email))
    )

    if (newRecords.length === 0) {
        return { success: true, count: 0, skipped: cleanData.length }
    }

    const { error } = await supabase
        .from('customers')
        .insert(newRecords)

    if (error) return { error: error.message }
    return { success: true, count: newRecords.length, skipped: cleanData.length - newRecords.length }
}
