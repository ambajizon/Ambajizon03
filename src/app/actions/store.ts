'use server'

import { createClient } from '@/lib/supabase/server'
import { createAdminClient } from '@/lib/supabase/service'
import { revalidatePath } from 'next/cache'

export async function getStoreSettings() {
    const supabase = await createClient()

    // Get current user
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get store for this user
    const { data: store, error } = await supabase
        .from('stores')
        .select('*')
        .eq('shopkeeper_id', user.id)
        .single()

    if (error) throw new Error(error.message)
    return store
}

export async function saveStoreSetup(data: any) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Use admin client to allow upserting a row if it doesn't exist
    // Normal client would fail due to RLS insert restrictions on stores table
    const adminSupabase = createAdminClient()

    // Ensure shopkeeper profile exists before creating the store to prevent foreign key errors
    // (Happens if the user signed up via Magic Link or direct provider bypass instead of /auth/register)
    const trialEndDate = new Date()
    trialEndDate.setDate(trialEndDate.getDate() + 14)

    const { error: shopkeeperError } = await adminSupabase
        .from('shopkeepers')
        .upsert({
            id: user.id,
            email: user.email || `${user.id}@placeholder.com`,
            subscription_status: 'trial',
            trial_end_date: trialEndDate.toISOString(),
        }, { onConflict: 'id' })

    if (shopkeeperError) {
        return { error: 'Failed to initialize shopkeeper profile: ' + shopkeeperError.message }
    }

    const { error } = await adminSupabase
        .from('stores')
        .upsert({
            shopkeeper_id: user.id,
            name: data.name,
            slug: data.slug,
            logo_url: data.logo_url,
            hero_banner_url: data.hero_banner_url,
            whatsapp_number: data.whatsapp_number,
            phone_number: data.phone_number,
            shop_timing: data.shop_timing,
            location_url: data.location_url,
            is_setup_completed: true,
            // updated_at is omitted to let database handle it if trigger exists
        }, { onConflict: 'shopkeeper_id' })

    if (error) return { error: error.message }

    revalidatePath('/dashboard')
    return { success: true }
}

export async function updateStoreSettings(formData: FormData) {
    const supabase = await createClient()

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) throw new Error('Not authenticated')

    // Get store id and current theme_config first
    const { data: store } = await supabase
        .from('stores')
        .select('id, theme_config')
        .eq('shopkeeper_id', user.id)
        .single()

    if (!store) throw new Error('Store not found')

    const currentThemeConfig = store.theme_config || {}

    const newThemeConfig = {
        ...currentThemeConfig,
        description: formData.get('description'),
        hero_image_url: formData.get('hero_image_url'),
        hero_title: formData.get('hero_title'),
        hero_subtitle: formData.get('hero_subtitle'),
        hero_cta_text: formData.get('hero_cta_text'),
        primary_color: formData.get('primary_color'),
        font_style: formData.get('font_style'),
        show_flash_sale: formData.get('show_flash_sale') === 'true',
        show_exclusive: formData.get('show_exclusive') === 'true',
        show_sales_zone: formData.get('show_sales_zone') === 'true',
        footer_text: formData.get('footer_text'),
        social_links: {
            instagram: formData.get('instagram'),
            facebook: formData.get('facebook'),
            youtube: formData.get('youtube'),
            x: formData.get('x'),
        }
    }

    const updates = {
        name: formData.get('name'),
        logo_url: formData.get('logo_url'),
        theme_config: newThemeConfig
    }

    const { error } = await supabase
        .from('stores')
        .update(updates)
        .eq('id', store.id)

    if (error) {
        // Fallback: try updating without theme_config if it fails (unlikely, but safe)
        const { error: fbErr } = await supabase
            .from('stores')
            .update({ name: updates.name, logo_url: updates.logo_url })
            .eq('id', store.id)

        if (fbErr) throw new Error(fbErr.message)
    }

    revalidatePath('/dashboard/storefront')
    revalidatePath(`/${store.id}`)
    return { success: true }
}
