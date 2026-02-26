'use server'

import { createClient } from '@/lib/supabase/server'
import { cache } from 'react'
import { revalidatePath } from 'next/cache'

export async function revalidateStore(slug: string) {
    revalidatePath(`/${slug}`, 'layout')
}

export type StoreData = {
    id: string
    name: string
    slug: string
    logo_url: string | null
    hero_banner_url: string | null
    primary_color: string
    font_family: string
    whatsapp_number: string | null
    phone_number: string | null
    shop_timing: string | null
    location_url: string | null
    footer_text: string | null
    social_links: any
    is_enabled: boolean
    is_live: boolean
    about_page_text: string | null
    contact_page_text: string | null
}

export const getStoreBySlug = cache(async (slug: string) => {
    const supabase = createClient()

    // Sanitize slug/hostname to prevent PostgREST comma injection in .or()
    const safeIdentifier = slug.replace(/[^a-zA-Z0-9.\-]/g, '')

    const { data, error } = await (await supabase)
        .from('stores')
        .select('*')
        .or(`slug.eq.${safeIdentifier},theme_config->>custom_domain.eq.${safeIdentifier}`)
        .single()

    if (error || !data) {
        return null
    }

    // Map theme_config nested properties to top-level if they exist
    const theme = data.theme_config || {};
    return {
        ...data,
        whatsapp_number: data.whatsapp_number || theme.whatsapp_number || null,
        phone_number: data.phone_number || theme.phone_number || null,
        shop_timing: data.shop_timing || theme.shop_timing || null,
        location_url: data.location_url || theme.location_url || null,
        footer_text: data.footer_text || theme.footer_text || null,
        social_links: data.social_links || theme.social_links || null,
        about_page_text: data.about_page_text || theme.about_page_text || null,
        contact_page_text: data.contact_page_text || theme.contact_page_text || null,
    } as StoreData
})

export const getStoreCategories = cache(async (storeId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('categories')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true })

    if (error) {
        console.error('Error fetching storefront categories:', error)
        return []
    }

    return data
})

export const getStoreSubcategories = cache(async (categoryId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('subcategories')
        .select('*')
        .eq('category_id', categoryId)
        .eq('is_enabled', true)
        .order('sort_order', { ascending: true })

    if (error) return []
    return data
})

export const getFeaturedProducts = cache(async (storeId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .neq('display_section', 'none')
        .limit(10) // Limit for homepage

    if (error) return []
    return data
})

export const getProductsByCategory = cache(async (storeId: string, categoryId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('products')
        .select('*')
        .eq('store_id', storeId)
        .eq('category_id', categoryId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
})

export const getProductById = cache(async (productId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('products')
        .select('*, categories(name), subcategories(name)')
        .eq('id', productId)
        .eq('is_enabled', true)
        .single()

    if (error) return null
    return data
})

export const getStoreOffers = async (storeId: string) => {
    const supabase = createClient()
    const now = new Date().toISOString()

    const { data } = await (await supabase)
        .from('festival_offers')
        .select('*')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .lte('start_date', now)
        .gte('end_date', now)
        .order('end_date', { ascending: true })

    return data || []
}

export const getStoreProducts = cache(async (storeId: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
})

export const getProductsBySection = cache(async (storeId: string, section: string) => {
    const supabase = createClient()

    const { data, error } = await (await supabase)
        .from('products')
        .select('*, categories(name)')
        .eq('store_id', storeId)
        .eq('is_enabled', true)
        .eq('display_section', section)
        .order('created_at', { ascending: false })

    if (error) return []
    return data
})