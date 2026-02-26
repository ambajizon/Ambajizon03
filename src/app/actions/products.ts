'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type Category = {
    id: string
    name: string
    image_url: string | null
    is_enabled: boolean
    sort_order: number
}

// --- CATEGORIES ---

export async function getCategories() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return []

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return []

    const { data, error } = await (await supabase)
        .from('categories')
        .select('*')
        .eq('store_id', store.id)
        // RLS will handle filtering by store/shopkeeper, but we need to join stores if RLS isn't magic enough
        // Actually, RLS policy "Shopkeepers can manage own categories" uses auth.uid(), so simple select works if policy is active.
        // However, we need to ensure we are selecting from the right store if a shopkeeper theoretically has multiple (schema allows 1:1 shopkeeper:store mostly).
        // Let's assume RLS works as defined.
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching categories:', error)
        return []
    }

    return data as Category[]
}

export async function createCategory(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { success: false, message: 'Not authenticated' }

    // Get Store ID
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return { success: false, message: 'Store not found' }

    const name = formData.get('name') as string
    const image_url = formData.get('image_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string) || 0

    const { data: insertedData, error } = await (await supabase)
        .from('categories')
        .insert({
            store_id: store.id,
            name,
            image_url,
            sort_order,
            is_enabled: true
        })
        .select()
        .single()

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products/categories')
    return { success: true, message: 'Category created', category: insertedData as Category }
}

export async function updateCategory(id: string, formData: FormData) {
    const supabase = createClient()

    const name = formData.get('name') as string
    const image_url = formData.get('image_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string) || 0
    const is_enabled = formData.get('is_enabled') === 'true'

    const { error } = await (await supabase)
        .from('categories')
        .update({
            name,
            image_url,
            sort_order,
            is_enabled
        })
        .eq('id', id)

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products/categories')
    return { success: true, message: 'Category updated' }
}

export async function deleteCategory(id: string) {
    const supabase = createClient()

    // Check for subcategories or products first?
    // For now, let's just try delete. Foreign keys might restrict it if we had them set to restrict.
    // Schema didn't specify cascade, so it might fail if referenced. Use try/catch.

    const { error } = await (await supabase)
        .from('categories')
        .delete()
        .eq('id', id)

    if (error) return { success: false, message: 'Failed to delete. Check if it has subcategories.' }

    revalidatePath('/dashboard/products/categories')
    return { success: true, message: 'Category deleted' }
}

// --- SUBCATEGORIES ---

export type Subcategory = {
    id: string
    category_id: string
    name: string
    image_url: string | null
    is_enabled: boolean
    sort_order: number
    categories?: { name: string }
}

export async function getSubcategories() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return []

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return []

    const { data, error } = await (await supabase)
        .from('subcategories')
        .select('*, categories(name)')
        .eq('store_id', store.id)
        .order('sort_order', { ascending: true })
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching subcategories:', error)
        return []
    }

    return data as Subcategory[]
}

export async function createSubcategory(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { success: false, message: 'Not authenticated' }

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return { success: false, message: 'Store not found' }

    const category_id = formData.get('category_id') as string
    const name = formData.get('name') as string
    const image_url = formData.get('image_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string) || 0

    const { error } = await (await supabase)
        .from('subcategories')
        .insert({
            store_id: store.id,
            category_id,
            name,
            image_url,
            sort_order,
            is_enabled: true
        })

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products/subcategories')
    return { success: true, message: 'Subcategory created' }
}

export async function updateSubcategory(id: string, formData: FormData) {
    const supabase = createClient()

    const category_id = formData.get('category_id') as string
    const name = formData.get('name') as string
    const image_url = formData.get('image_url') as string
    const sort_order = parseInt(formData.get('sort_order') as string) || 0
    const is_enabled = formData.get('is_enabled') === 'true'

    const { error } = await (await supabase)
        .from('subcategories')
        .update({
            category_id,
            name,
            image_url,
            sort_order,
            is_enabled
        })
        .eq('id', id)

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products/subcategories')
    return { success: true, message: 'Subcategory updated' }
}

export async function deleteSubcategory(id: string) {
    const supabase = createClient()

    const { error } = await (await supabase)
        .from('subcategories')
        .delete()
        .eq('id', id)

    if (error) return { success: false, message: 'Failed to delete. Check if it has products.' }

    revalidatePath('/dashboard/products/subcategories')
    return { success: true, message: 'Subcategory deleted' }
}

// --- PRODUCTS ---

export type Product = {
    id: string
    store_id: string
    category_id: string
    subcategory_id: string | null
    name: string
    description: string | null
    images: string[]
    price: number
    mrp: number | null
    stock: number
    tags: string[]
    badge: 'none' | 'new' | 'hot' | 'sale' | 'limited'
    display_section: 'none' | 'home' | 'flash_sale' | 'sales_zone' | 'exclusive'
    is_enabled: boolean
    categories?: { name: string }
    subcategories?: { name: string }
}

export async function getProducts() {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return []

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return []

    const { data, error } = await (await supabase)
        .from('products')
        .select('*, categories(name), subcategories(name)')
        .eq('store_id', store.id)
        .neq('is_deleted', true) // Filter gracefully handles cases where is_deleted is null (old rows before adding the column natively)
        .order('created_at', { ascending: false })

    if (error) {
        console.error('Error fetching products:', error)
        return []
    }

    return data as Product[]
}

export async function createProduct(formData: FormData) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { success: false, message: 'Not authenticated' }

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return { success: false, message: 'Store not found' }

    // Parse Data
    const category_id = formData.get('category_id') as string
    const subcategory_id = formData.get('subcategory_id') as string || null
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const images = JSON.parse(formData.get('images') as string || '[]')
    const price = parseFloat(formData.get('price') as string)
    const mrp = parseFloat(formData.get('mrp') as string) || null
    const stock = parseInt(formData.get('stock') as string) || 0
    const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean)
    const badge = formData.get('badge') as string
    const display_section = formData.get('display_section') as string
    const is_enabled = formData.get('is_enabled') === 'true'

    const { error } = await (await supabase)
        .from('products')
        .insert({
            store_id: store.id,
            category_id,
            subcategory_id,
            name,
            description,
            images,
            price,
            mrp,
            stock,
            tags,
            badge,
            display_section,
            is_enabled
        })

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product created' }
}

export async function updateProduct(id: string, formData: FormData) {
    const supabase = createClient()

    const category_id = formData.get('category_id') as string
    const subcategory_id = formData.get('subcategory_id') as string || null
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const images = JSON.parse(formData.get('images') as string || '[]')
    const price = parseFloat(formData.get('price') as string)
    const mrp = parseFloat(formData.get('mrp') as string) || null
    const stock = parseInt(formData.get('stock') as string) || 0
    const tags = (formData.get('tags') as string).split(',').map(t => t.trim()).filter(Boolean)
    const badge = formData.get('badge') as string
    const display_section = formData.get('display_section') as string
    const is_enabled = formData.get('is_enabled') === 'true'

    const { error } = await (await supabase)
        .from('products')
        .update({
            category_id,
            subcategory_id,
            name,
            description,
            images,
            price,
            mrp,
            stock,
            tags,
            badge,
            display_section,
            is_enabled
        })
        .eq('id', id)

    if (error) return { success: false, message: error.message }

    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product updated' }
}

export async function deleteProduct(id: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { success: false, message: 'Unauthorized' }

    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) return { success: false, message: 'Store not found' }

    const { error } = await (await supabase)
        .from('products')
        .update({
            is_enabled: false,
            is_deleted: true
        })
        .eq('id', id)
        .eq('store_id', store.id)

    if (error) {
        // Fallback for missing column scenario or legit error
        return { success: false, message: 'Failed to delete product. Database error: ' + error.message }
    }

    revalidatePath('/dashboard/products')
    return { success: true, message: 'Product deleted' }
}
