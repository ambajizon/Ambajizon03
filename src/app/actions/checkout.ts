'use server'

import { createClient } from '@/lib/supabase/server'
import { getCurrentCustomer, getCustomerAddresses } from './customer'
import { getCart } from './cart'
import { createAdminClient } from '@/lib/supabase/service'

export async function createOrder(storeId: string, cartId: string, addressId: string, paymentMethod: 'cod' | 'online', pointsToRedeem: number = 0) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return { error: 'Customer not found' }

    // Fetch Cart
    const cart = await getCart(storeId)
    if (!cart || cart.cart_items.length === 0) return { error: 'Cart is empty' }

    // Fetch Address (enforce IDOR boundary)
    const { data: address } = await (await supabase)
        .from('customer_addresses')
        .select('*')
        .eq('id', addressId)
        .eq('customer_id', customer.id)
        .single()

    if (!address) return { error: 'Invalid delivery address' }

    // Calculate Totals and Snapshot Items
    let subtotal = 0
    let shippingFee = 0
    const orderItemsPayload = []

    for (const item of cart.cart_items) {
        // Here we should verify stock again
        if (item.products.stock < item.quantity) {
            return { error: `Not enough stock for ${item.products.name}` }
        }

        const price = item.products.price
        subtotal += price * item.quantity

        orderItemsPayload.push({
            product_id: item.product_id,
            quantity: item.quantity,
            price_at_purchase: price,
            product_snapshot: item.products
        })
    }

    // Verify loyalty points for redemption
    if (pointsToRedeem > 0) {
        if (!customer.loyalty_points || customer.loyalty_points < pointsToRedeem) {
            return { error: 'Not enough loyalty points available' }
        }
    }

    const maxDiscount = subtotal * 0.5
    const computedDiscount = pointsToRedeem / 10

    if (computedDiscount > maxDiscount) {
        return { error: 'Cannot redeem points beyond 50% of the order value' }
    }

    // Parse shipping details
    const store = await (await supabase).from('stores').select('id').eq('id', storeId).limit(1).maybeSingle()
    const shippingDetails: any = {}

    shippingFee = Number(shippingDetails?.shipping_price) || 0

    const total = Math.max(0, subtotal + shippingFee - computedDiscount) // Prevent total from dropping below 0


    // Create Order Transaction
    // 1. Insert Order
    const { data: order, error: orderError } = await (await supabase)
        .from('orders')
        .insert({
            store_id: storeId,
            customer_id: customer.id,
            status: 'pending',
            payment_mode: paymentMethod,
            payment_status: 'pending', // Mark 'paid' if verified online later
            subtotal: subtotal,
            total_amount: total,
            delivery_address: address
        })
        .select()
        .single()

    if (orderError) {
        console.error('Order creation failed:', orderError)
        return { error: 'Failed to create order' }
    }

    // 2. Insert Order Items
    const itemsWithOrderId = orderItemsPayload.map(item => ({
        ...item,
        order_id: order.id
    }))

    const { error: itemsError } = await (await supabase)
        .from('order_items')
        .insert(itemsWithOrderId)

    if (itemsError) {
        return { error: 'Failed to save order items' }
    }

    // 3. Clear Cart
    await (await supabase)
        .from('cart_items')
        .delete()
        .eq('cart_id', cartId)

    // Prepare Admin Client for restricted background operations
    const adminClient = createAdminClient()

    // 4. Update Stock (Parallelize N+1 using Admin Client to bypass RLS)
    try {
        await Promise.all(
            cart.cart_items.map((item: any) =>
                adminClient
                    .from('products')
                    .update({ stock: item.products.stock - item.quantity })
                    .eq('id', item.product_id)
            )
        )
    } catch (e) {
        console.error('Failed to update stock:', e)
        // Non-blocking but we should log this properly in prod
    }

    // 5. Add Tracking
    await adminClient
        .from('order_tracking')
        .insert({
            order_id: order.id,
            status: 'created',
            note: 'Order placed successfully'
        })

    // 6. Handle Loyalty Points (Redeem & Earn)
    const newEarnedPoints = Math.floor(total / 10)

    // Total points diff for user
    let pointsDiff = newEarnedPoints - pointsToRedeem

    if (pointsToRedeem > 0) {
        // Log redemption
        await (await supabase)
            .from('loyalty_transactions')
            .insert({
                store_id: storeId,
                customer_id: customer.id,
                type: 'redeemed',
                points: pointsToRedeem,
                order_id: order.id,
                note: `Redeemed for order #${order.id.split('-')[0]}` // shortened ID
            })
    }

    if (newEarnedPoints > 0) {
        // Log earnings
        await (await supabase)
            .from('loyalty_transactions')
            .insert({
                store_id: storeId,
                customer_id: customer.id,
                type: 'earned',
                points: newEarnedPoints,
                order_id: order.id,
                note: 'Earned from order'
            })
    }

    // Update final points balance on customer using Admin Client
    if (pointsDiff !== 0) {
        const currentPoints = customer.loyalty_points || 0
        await adminClient
            .from('customers')
            .update({ loyalty_points: Math.max(0, currentPoints + pointsDiff) })
            .eq('id', customer.id)
    }

    return { success: true, orderId: order.id }
}

export async function getCustomerOrders(storeId: string) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return []

    const { data: orders } = await (await supabase)
        .from('orders')
        .select(`
            *,
            order_items (
                id,
                quantity,
                price_at_purchase,
                products (
                    name,
                    images
                )
            )
        `)
        .eq('store_id', storeId)
        .eq('customer_id', customer.id)
        .order('created_at', { ascending: false })

    return orders || []
}
