'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

// Helper to update analytics
async function updateAnalytics(storeId: string, amount: number) {
    const supabase = createClient()
    const today = new Date().toISOString().split('T')[0]

    const { data: existing } = await (await supabase)
        .from('store_analytics')
        .select('*')
        .eq('store_id', storeId)
        .eq('date', today)
        .single()

    if (existing) {
        await (await supabase)
            .from('store_analytics')
            .update({
                order_count: (existing.order_count || 0) + 1,
                revenue: (existing.revenue || 0) + amount
            })
            .eq('id', existing.id)
    } else {
        await (await supabase)
            .from('store_analytics')
            .insert({
                store_id: storeId,
                date: today,
                order_count: 1,
                revenue: amount,
                visitor_count: 0
            })
    }
}

export async function createOrder(storeId: string, cartItems: any[], totalAmount: number, addressId: string, paymentMethod: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) return { error: 'Not authenticated' }

    // 1. Get Customer ID
    const { data: customer } = await (await supabase)
        .from('customers')
        .select('id, email')
        .eq('auth_user_id', user.id)
        .eq('store_id', storeId)
        .single()

    if (!customer) return { error: 'Customer not found' }

    // 2. Create Order
    const { data: order, error: orderError } = await (await supabase)
        .from('orders')
        .insert({
            store_id: storeId,
            customer_id: customer.id,
            address_id: addressId,
            total_amount: totalAmount,
            status: 'pending',
            payment_status: paymentMethod === 'COD' ? 'pending' : 'pending',
            payment_method: paymentMethod
        })
        .select()
        .single()

    if (orderError) return { error: orderError.message }

    // 3. Create Order Items
    const orderItems = cartItems.map((item: any) => ({
        order_id: order.id,
        product_id: item.product.id,
        quantity: item.quantity,
        price_at_time: item.product.price
    }))

    const { error: itemsError } = await (await supabase)
        .from('order_items')
        .insert(orderItems)

    if (itemsError) return { error: itemsError.message }

    // 4. Create Order Tracking Initial Status
    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: order.id,
            status: 'Confirmed',
            note: 'Order placed successfully'
        })

    // 5. Update Analytics
    await updateAnalytics(storeId, totalAmount)

    // Clear Cart
    const { data: cart } = await (await supabase)
        .from('carts')
        .select('id')
        .eq('customer_id', customer.id)
        .single()

    if (cart) {
        await (await supabase).from('cart_items').delete().eq('cart_id', cart.id)
    }

    revalidatePath(`/[store]/shop/orders`)
    return { success: true, orderId: order.id }
}

export async function getCustomerOrders(storeId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    if (!user) return []

    const { data: customer } = await (await supabase)
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('store_id', storeId)
        .single()

    if (!customer) return []

    const { data: orders } = await (await supabase)
        .from('orders')
        .select(`
            *,
            items: order_items (
                *,
                product: products (name, images)
            )
        `)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

    return orders || []
}

export async function getOrderDetail(orderId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return null

    // Check if user is shopkeeper
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .limit(1)
        .maybeSingle()

    // If store owner, they can see order. If customer, we need to check ownership.
    let query = (await supabase)
        .from('orders')
        .select(`
            *,
            items: order_items (
                *,
                product: products (name, images, price)
            ),
            customers (*),
            order_tracking (*),
            stores (id, name, slug)
        `)
        .eq('id', orderId)
        .single()

    const { data: order, error } = await query

    if (error) {
        console.error("DEBUG: getOrderDetail query error:", error)
        return null
    }

    console.log("DEBUG getOrderDetail: user=", user?.id, "store=", store?.id, "order=", !!order, "order.store_id=", order?.store_id)

    if (!order) return null

    // Security check: Match store_id (if shopkeeper) or customer_id (if customer)
    if (store && order.store_id === store.id) return order

    // Check if customer
    // Fetch customer id for this store
    const { data: customer } = await (await supabase)
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('store_id', order.store_id)
        .limit(1)
        .maybeSingle()

    if (customer && order.customer_id === customer.id) return order

    return null
}

export async function updateOrderStatus(orderId: string, status: string) {
    const supabase = createClient()

    await (await supabase)
        .from('orders')
        .update({ status })
        .eq('id', orderId)

    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: status,
            note: `Status updated to ${status}`
        })

    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true }
}

export async function markOrderDelivered(orderId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify the order belongs to this shopkeeper's store
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .limit(1)
        .maybeSingle()

    if (!store) return { error: 'Store not found' }

    const { data: order, error: orderErr } = await (await supabase)
        .from('orders')
        .select('*, items: order_items(*)')
        .eq('id', orderId)
        .eq('store_id', store.id)
        .single()

    if (orderErr || !order) return { error: 'Order not found' }

    const statusLower = (order.status || '').toLowerCase()
    if (statusLower !== 'shipped') {
        return { error: 'Order must be in Shipped status to mark as delivered' }
    }

    // Update order status and preserve COD payment status (remove auto-pay)
    const { error: updateErr } = await (await supabase)
        .from('orders')
        .update({
            status: 'delivered',
            payment_status: order.payment_status // Retain current payment status
        })
        .eq('id', orderId)

    if (updateErr) return { error: updateErr.message }

    // Add tracking entry
    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: 'delivered',
            note: 'Order delivered successfully'
        })

    // Award loyalty points (total_amount / 10)
    const points = Math.floor((order.total_amount || 0) / 10)
    if (points > 0 && order.customer_id) {
        const { data: currentCustomer } = await (await supabase)
            .from('customers')
            .select('loyalty_points')
            .eq('id', order.customer_id)
            .single()

        await (await supabase)
            .from('customers')
            .update({
                loyalty_points: (currentCustomer?.loyalty_points || 0) + points
            })
            .eq('id', order.customer_id)
    }

    revalidatePath(`/dashboard/orders/${orderId}`)
    revalidatePath(`/dashboard/orders`)
    return { success: true, pointsAwarded: points }
}

export async function cancelOrder(orderId: string, reason: string, notes: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify the order belongs to this shopkeeper's store
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .limit(1)
        .maybeSingle()

    if (!store) return { error: 'Store not found' }

    const { data: order, error: orderErr } = await (await supabase)
        .from('orders')
        .select('*, items: order_items(*)')
        .eq('id', orderId)
        .eq('store_id', store.id)
        .single()

    if (orderErr || !order) return { error: 'Order not found' }

    const statusLower = (order.status || '').toLowerCase()
    if (statusLower === 'delivered') {
        return { error: 'Cannot cancel an already delivered order' }
    }
    if (statusLower === 'cancelled') {
        return { error: 'Order is already cancelled' }
    }

    // Cancel the order
    const { error: updateErr } = await (await supabase)
        .from('orders')
        .update({
            status: 'cancelled',
            cancellation_reason: reason,
            cancelled_at: new Date().toISOString(),
            cancelled_by: 'shopkeeper'
        })
        .eq('id', orderId)

    if (updateErr) return { error: updateErr.message }

    // Restore stock for each order item
    if (order.items && order.items.length > 0) {
        for (const item of order.items) {
            const { data: product } = await (await supabase)
                .from('products')
                .select('stock')
                .eq('id', item.product_id)
                .single()

            if (product) {
                await (await supabase)
                    .from('products')
                    .update({ stock: (product.stock || 0) + item.quantity })
                    .eq('id', item.product_id)
            }
        }
    }

    // Add tracking entry
    const trackingNote = `Cancelled by shopkeeper. Reason: ${reason}${notes ? `. Notes: ${notes}` : ''}`
    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: 'cancelled',
            note: trackingNote
        })

    revalidatePath(`/dashboard/orders/${orderId}`)
    revalidatePath(`/dashboard/orders`)
    return {
        success: true,
        showRefundReminder: order.payment_mode !== 'cod' && order.payment_status === 'paid'
    }
}

export async function markOrderAsPaid(orderId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Not authenticated' }

    // Verify the order belongs to this shopkeeper's store
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .limit(1)
        .maybeSingle()

    if (!store) return { error: 'Store not found' }

    const { data: order, error: orderErr } = await (await supabase)
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .eq('store_id', store.id)
        .single()

    if (orderErr || !order) return { error: 'Order not found' }

    if (order.payment_status === 'paid') {
        return { error: 'Order is already marked as paid' }
    }

    // Update payment status
    const { error: updateErr } = await (await supabase)
        .from('orders')
        .update({
            payment_status: 'paid'
        })
        .eq('id', orderId)

    if (updateErr) return { error: updateErr.message }

    // Add tracking entry
    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: order.status, // Keep current delivery status
            note: 'Payment received (marked as paid by shopkeeper)'
        })

    revalidatePath(`/dashboard/orders/${orderId}`)
    revalidatePath(`/dashboard/orders`)
    return { success: true }
}

