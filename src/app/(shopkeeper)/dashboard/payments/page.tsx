import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import PaymentsClient from './PaymentsClient'

export const metadata = {
    title: 'Payments | ShopVCard Dashboard',
}

export default async function PaymentsPage() {
    const supabase = createClient()

    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) {
        redirect('/login')
    }

    // Get the shopkeeper's store
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) {
        redirect('/dashboard/setup')
    }

    // Fetch all orders with customer details
    const { data: orders, error } = await (await supabase)
        .from('orders')
        .select(`
            *,
            customers (
                full_name,
                email,
                mobile
            )
        `)
        .eq('store_id', store.id)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching payments/orders:', error)
        return <div className="p-8 text-center text-red-500">Failed to load payments data.</div>
    }

    // Calculate Stats
    let totalExpected = 0
    let totalCollected = 0
    let totalPending = 0

    const validOrders = orders || []

    validOrders.forEach(order => {
        const amount = order.total_amount || 0
        const isCancelled = (order.status || '').toLowerCase() === 'cancelled'

        if (!isCancelled) {
            totalExpected += amount
            if (order.payment_status === 'paid') {
                totalCollected += amount
            } else if (order.payment_status === 'pending') {
                totalPending += amount
            }
        }
    })

    return (
        <PaymentsClient
            initialOrders={validOrders}
            stats={{
                totalExpected,
                totalCollected,
                totalPending
            }}
        />
    )
}
