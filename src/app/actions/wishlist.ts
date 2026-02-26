'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function addToWishlist(storeId: string, productId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Not logged in' }

    const { data: customer } = await (await supabase)
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('store_id', storeId)
        .single()

    if (!customer) return { error: 'Customer profile not found' }

    const { error } = await (await supabase)
        .from('wishlists')
        .insert({ customer_id: customer.id, product_id: productId })

    if (error) {
        if (error.code === '23505') return { success: true, message: 'Already in wishlist' } // Unique violation
        return { error: error.message }
    }

    revalidatePath(`/${storeId}/shop`)
    return { success: true }
}

export async function removeFromWishlist(storeId: string, productId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Not logged in' }

    const { data: customer } = await (await supabase)
        .from('customers')
        .select('id')
        .eq('auth_user_id', user.id)
        .eq('store_id', storeId)
        .single()

    if (!customer) return { error: 'Customer profile not found' }

    const { error } = await (await supabase)
        .from('wishlists')
        .delete()
        .eq('customer_id', customer.id)
        .eq('product_id', productId)

    if (error) return { error: error.message }

    revalidatePath(`/${storeId}/shop`)
    return { success: true }
}

export async function getWishlist(storeId: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return []

    const { data: list } = await (await supabase)
        .from('customers')
        .select(`
            id,
            wishlists (
                product: products (*)
            )
        `)
        .eq('auth_user_id', user.id)
        .eq('store_id', storeId)
        .single()

    if (!list || !list.wishlists) return []
    return list.wishlists.map((w: any) => w.product)
}
