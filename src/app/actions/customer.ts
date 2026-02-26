'use server'

import { createClient } from '@/lib/supabase/server'
import { createClient as createAdminSDK } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'

export type Customer = {
    id: string
    auth_user_id: string
    store_id: string
    full_name: string
    mobile: string | null
    email: string | null
    created_at: string
    is_banned?: boolean
    ban_reason?: string
    cod_blocked?: boolean
    cod_block_reason?: string
    loyalty_points?: number
}

export async function getCurrentCustomer(storeId: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) return null

    const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .eq('auth_user_id', user.id)
        .single()

    if (error && error.code !== 'PGRST116') {
        console.error('Error fetching customer:', error)
    }

    return data as Customer | null
}

export async function registerCustomer(storeId: string, name: string, phone: string) {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: 'You must be logged in to register as a customer.' }
    }

    // Use Admin Client to bypass RLS
    const adminClient = createAdminSDK(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )

    // Check existing via Admin (Auth ID)
    const { data: existing } = await adminClient
        .from('customers')
        .select('*')
        .eq('store_id', storeId)
        .eq('auth_user_id', user.id)
        .single()

    if (existing) {
        return { success: true, customer: existing }
    }

    // Check existing via Email (Link Account)
    if (user.email) {
        const { data: existingByEmail } = await adminClient
            .from('customers')
            .select('*')
            .eq('store_id', storeId)
            .eq('email', user.email)
            .single()

        if (existingByEmail) {
            // Update auth_user_id
            await adminClient
                .from('customers')
                .update({ auth_user_id: user.id })
                .eq('id', existingByEmail.id)

            return { success: true, customer: { ...existingByEmail, auth_user_id: user.id } }
        }
    }

    // Check existing via Phone (Link Account)
    if (phone) {
        const { data: existingByPhone } = await adminClient
            .from('customers')
            .select('*')
            .eq('store_id', storeId)
            .eq('mobile', phone) // Schema uses 'mobile' col? 'phone' arg.
            .single()

        if (existingByPhone) {
            // Update auth_user_id
            await adminClient
                .from('customers')
                .update({ auth_user_id: user.id })
                .eq('id', existingByPhone.id)

            return { success: true, customer: { ...existingByPhone, auth_user_id: user.id } }
        }
    }

    const { data, error } = await adminClient
        .from('customers')
        .insert({
            auth_user_id: user.id,
            store_id: storeId,
            full_name: name,
            mobile: phone, // Map 'phone' arg to 'mobile' column?
            email: user.email
        })
        .select()
        .single()

    if (error) {
        console.error('Error registering customer:', error)
        return { error: `Failed to create customer profile. Code: ${error.code}, Msg: ${error.message}, Details: ${error.details}` }
    }

    revalidatePath(`/${storeId}`)
    return { success: true, customer: data }
}

export async function getCustomerAddresses(storeId: string) {
    const supabase = createClient()
    const user = await getCurrentCustomer(storeId)

    if (!user) return []

    const { data } = await (await supabase)
        .from('customer_addresses')
        .select('*')
        .eq('customer_id', user.id)
        .order('is_default', { ascending: false })

    return data || []
}

export async function addAddress(storeId: string, address: any) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return { error: 'Customer not found' }

    // If default, unset other defaults
    if (address.is_default) {
        await (await supabase)
            .from('customer_addresses')
            .update({ is_default: false })
            .eq('customer_id', customer.id)
    }

    const { error } = await (await supabase)
        .from('customer_addresses')
        .insert({
            ...address,
            customer_id: customer.id,
            store_id: storeId
        })

    if (error) return { error: error.message }
    return { success: true }
}
