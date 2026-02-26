'use server'

import { createClient } from '@/lib/supabase/server'
import { encrypt } from '@/lib/encryption'
import { revalidatePath } from 'next/cache'
// import axios from 'axios' // We'll use fetch

export async function saveShippingSettings(email: string, pass: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { data: store } = await (await supabase).from('stores').select('id').eq('shopkeeper_id', user.id).single()
    if (!store) return { error: 'Store not found' }

    // Encrypt password
    const encryptedPass = encrypt(pass)

    // Upsert settings
    // Check existing
    const { data: existing } = await (await supabase).from('shipping_settings').select('id').eq('store_id', store.id).single()

    if (existing) {
        await (await supabase)
            .from('shipping_settings')
            .update({
                shiprocket_email: email,
                shiprocket_password: encryptedPass,
                updated_at: new Date().toISOString()
            })
            .eq('id', existing.id)
    } else {
        await (await supabase)
            .from('shipping_settings')
            .insert({
                store_id: store.id,
                shiprocket_email: email,
                shiprocket_password: encryptedPass
            })
    }

    return { success: true }
}

export async function createShipment(orderId: string) {
    // 1. Get Order
    // 2. Get Shipping Settings (decrypt pass)
    // 3. Auth with Shiprocket -> Get Token
    // 4. Create Order in Shiprocket
    // 5. Update Order Tracking in DB with AWB

    // For MVP Demo, we will just simulate a success and update tracking.
    const supabase = createClient()

    // Mock Update
    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: 'Shipped',
            note: 'Shipment created via Shiprocket (Simulated). AWB: 123456789'
        })

    return { success: true, awb: '123456789' }
}

export async function saveManualShipping(orderId: string, payload: { partner: string, trackingNumber: string, trackingUrl: string, estDelivery: string, note: string }) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { error } = await (await supabase)
        .from('orders')
        .update({
            shipping_partner: payload.partner,
            tracking_number: payload.trackingNumber,
            tracking_url: payload.trackingUrl,
            estimated_delivery: payload.estDelivery || null,
            shipping_note: payload.note,
            status: 'Shipped'
        })
        .eq('id', orderId)

    if (error) return { error: error.message }

    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: 'Shipped',
            note: `Shipped via ${payload.partner}\nTracking: ${payload.trackingNumber}${payload.note ? '\nNote: ' + payload.note : ''}`
        })

    revalidatePath(`/dashboard/orders/${orderId}`)
    return { success: true }
}
