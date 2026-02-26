import { createClient } from '@/lib/supabase/server'
import OrdersClient from './OrdersClient'

async function getShopOrders() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return []

    // Get Store ID
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .limit(1)
        .maybeSingle()

    if (!store) return []

    // Get Orders
    const { data: orders } = await (await supabase)
        .from('orders')
        .select(`
            *,
            customers (full_name, mobile)
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

    return orders || []
}

export default async function OrdersPage() {
    const orders = await getShopOrders()

    return <OrdersClient initialOrders={orders} />
}
