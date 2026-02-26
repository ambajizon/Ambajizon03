'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'
import { getCurrentCustomer } from './customer'

export async function getCart(storeId: string) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return null

    // Find existing cart
    const { data: cart } = await (await supabase)
        .from('carts')
        .select('*, cart_items(*, products(*))')
        .eq('store_id', storeId)
        .eq('customer_id', customer.id)
        .single()

    if (cart) return cart

    // Create new cart if auth
    const { data: newCart, error } = await (await supabase)
        .from('carts')
        .insert({
            store_id: storeId,
            customer_id: customer.id
        })
        .select()
        .single()

    if (error) {
        console.error('Error creating cart:', error)
        return null
    }

    return { ...newCart, cart_items: [] }
}

export async function addToCart(storeId: string, productId: string, quantity: number = 1) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return { error: 'Please login to add items to cart' }

    let cart = await getCart(storeId)
    if (!cart) return { error: 'Failed to initialize cart' }

    // Check if item exists
    const existingItem = await (await supabase)
        .from('cart_items')
        .select('*')
        .eq('cart_id', cart.id)
        .eq('product_id', productId)
        .single()

    if (existingItem.data) {
        // Update Qty
        await (await supabase)
            .from('cart_items')
            .update({ quantity: existingItem.data.quantity + quantity })
            .eq('id', existingItem.data.id)
    } else {
        // Insert
        await (await supabase)
            .from('cart_items')
            .insert({
                cart_id: cart.id,
                product_id: productId,
                quantity: quantity
            })
    }

    revalidatePath(`/${storeId}/shop/cart`)
    return { success: true }
}

export async function updateCartItemQty(itemId: string, quantity: number, storeSlug: string) {
    const supabase = createClient()

    if (quantity <= 0) {
        return removeFromCart(itemId, storeSlug)
    }

    const customer = await getCurrentCustomer(storeSlug)
    if (!customer) return { error: 'Not authenticated' }

    const cart = await getCart(storeSlug)
    if (!cart) return { error: 'Cart not found' }

    const { error } = await (await supabase)
        .from('cart_items')
        .update({ quantity })
        .eq('id', itemId)
        .eq('cart_id', cart.id)

    if (error) return { error: error.message }

    revalidatePath(`/${storeSlug}/shop/cart`)
    return { success: true }
}

export async function removeFromCart(itemId: string, storeSlug: string) {
    const supabase = createClient()

    const customer = await getCurrentCustomer(storeSlug)
    if (!customer) return { error: 'Not authenticated' }

    const cart = await getCart(storeSlug)
    if (!cart) return { error: 'Cart not found' }

    const { error } = await (await supabase)
        .from('cart_items')
        .delete()
        .eq('id', itemId)
        .eq('cart_id', cart.id)

    if (error) return { error: error.message }

    revalidatePath(`/${storeSlug}/shop/cart`)
    return { success: true }
}
