'use server'

import { createClient } from '@/lib/supabase/server'
import { encrypt, decrypt } from '@/lib/encryption'
import Razorpay from 'razorpay'
import crypto from 'crypto'
import { revalidatePath } from 'next/cache'

// --- Settings Management ---

export async function savePaymentSettings(storeId: string, razorpayKeyId: string, razorpayKeySecret: string, isCodEnabled: boolean) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()

    // Auth check: Ensure user owns the store
    const { data: store } = await (await supabase)
        .from('stores')
        .select('id')
        .eq('id', storeId)
        .eq('shopkeeper_id', user?.id)
        .single()

    if (!store) return { error: 'Unauthorized access to store settings' }

    const encryptedSecret = razorpayKeySecret ? encrypt(razorpayKeySecret) : null

    // Check if settings exist
    const { data: existing } = await (await supabase)
        .from('payment_settings')
        .select('*')
        .eq('store_id', storeId)
        .single()

    let error;
    if (existing) {
        const updateData: any = { is_cod_enabled: isCodEnabled, updated_at: new Date().toISOString() }
        if (razorpayKeyId) updateData.razorpay_key_id = razorpayKeyId
        if (encryptedSecret) updateData.razorpay_key_secret = encryptedSecret

        const res = await (await supabase)
            .from('payment_settings')
            .update(updateData)
            .eq('store_id', storeId)
        error = res.error
    } else {
        const res = await (await supabase)
            .from('payment_settings')
            .insert({
                store_id: storeId,
                razorpay_key_id: razorpayKeyId,
                razorpay_key_secret: encryptedSecret,
                is_cod_enabled: isCodEnabled
            })
        error = res.error
    }

    if (error) return { error: error.message }
    revalidatePath(`/dashboard/settings`)
    return { success: true }
}

export async function getPaymentSettings(storeId: string) {
    const supabase = createClient()
    // This action might be called by shopkeeper (to see settings) OR checkout (to check COD enabled)
    // We must NOT return the secret to the client.

    const { data } = await (await supabase)
        .from('payment_settings')
        .select('razorpay_key_id, is_cod_enabled')
        .eq('store_id', storeId)
        .single()

    return data
}


// --- Transaction Processing ---

export async function createRazorpayOrder(orderId: string) {
    const supabase = createClient()

    // 1. Fetch Order
    const { data: order } = await (await supabase)
        .from('orders')
        .select('*')
        .eq('id', orderId)
        .single()

    if (!order) return { error: 'Order not found' }

    // 2. Fetch real per-store Razorpay credentials from payment_settings
    const { data: settings, error: settingsError } = await (await supabase)
        .from('payment_settings')
        .select('razorpay_key_id, razorpay_key_secret')
        .eq('store_id', order.store_id)
        .single()

    if (settingsError || !settings?.razorpay_key_id || !settings?.razorpay_key_secret) {
        return { error: 'Online payment is not configured for this store. Please contact the store owner.' }
    }

    // 3. Decrypt the stored secret
    const key_secret = decrypt(settings.razorpay_key_secret)
    if (!key_secret) return { error: 'Payment configuration error: decryption failed. Store must re-save their keys.' }

    // 4. Initialize Razorpay with tenant credentials
    const instance = new Razorpay({
        key_id: settings.razorpay_key_id,
        key_secret: key_secret,
    })

    // 5. Create Order on Razorpay
    const options = {
        amount: Math.round(order.total_amount * 100), // paise
        currency: 'INR',
        receipt: orderId.slice(0, 10),
    }

    try {
        const rzOrder = await instance.orders.create(options)

        // 6. Persist RZ Order ID
        await (await supabase)
            .from('orders')
            .update({ razorpay_order_id: rzOrder.id })
            .eq('id', orderId)

        return {
            success: true,
            razorpayOrderId: rzOrder.id,
            keyId: settings.razorpay_key_id,
            amount: rzOrder.amount as number,
            currency: 'INR',
        }
    } catch (error: any) {
        console.error('[payment] Razorpay order creation error:', error?.error || error)
        return { error: 'Failed to create payment order. Please try again.' }
    }
}

export async function verifyPayment(orderId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const supabase = createClient()

    // 1. Fetch Order to get RZ Order ID
    const { data: order } = await (await supabase)
        .from('orders')
        .select('razorpay_order_id, store_id')
        .eq('id', orderId)
        .single()

    if (!order || !order.razorpay_order_id) return { error: 'Invalid order for verification' }

    // 2. Fetch real per-store credentials from payment_settings
    const { data: settings } = await (await supabase)
        .from('payment_settings')
        .select('razorpay_key_secret')
        .eq('store_id', order.store_id)
        .single()

    if (!settings?.razorpay_key_secret) return { error: 'Payment settings not found for this store' }

    const key_secret = decrypt(settings.razorpay_key_secret)
    if (!key_secret) return { error: 'Payment configuration error: decryption failed' }

    // 3. Strict HMAC SHA256 — no bypasses
    const body = order.razorpay_order_id + '|' + razorpayPaymentId
    const expectedSignature = crypto
        .createHmac('sha256', key_secret)
        .update(body)
        .digest('hex')

    if (expectedSignature !== razorpaySignature) {
        console.error('[payment] Signature mismatch for order', orderId)
        return { error: 'Payment verification failed: invalid signature' }
    }

    // 4. Mark order as paid
    await (await supabase)
        .from('orders')
        .update({
            payment_status: 'paid',
            razorpay_payment_id: razorpayPaymentId,
            status: 'confirmed',
        })
        .eq('id', orderId)

    await (await supabase)
        .from('order_tracking')
        .insert({
            order_id: orderId,
            status: 'paid',
            note: `Payment verified. Razorpay ID: ${razorpayPaymentId}`,
        })

    revalidatePath(`/${orderId}`)
    return { success: true }
}

// --- Admin Platform Subscriptions ---

export async function createAdminSubscriptionOrder(planType: 'setup' | 'yearly') {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    // Fetch Admin Settings for Live Keys
    const { getAdminSettings } = await import('./admin')
    const adminSettings = await getAdminSettings()

    if (!adminSettings?.razorpay_key_id || !adminSettings?.is_live_payments) {
        return { error: 'Platform payments are currently offline' }
    }

    const key_secret = decrypt(adminSettings.razorpay_key_secret)
    if (!key_secret) return { error: 'Platform Configuration Error: decryption failed' }

    const amount = planType === 'setup'
        ? (adminSettings.onboarding_price || 9999)
        : (adminSettings.yearly_price || 6999)

    // Create a pending subscription record first
    const { data: sub, error: subError } = await (await supabase).from('subscriptions').insert({
        shopkeeper_id: user.id,
        amount: amount,
        plan_type: planType,
        status: 'pending'
    }).select('id').single()

    if (subError) return { error: subError.message }

    const instance = new Razorpay({
        key_id: adminSettings.razorpay_key_id,
        key_secret: key_secret,
    })

    try {
        const rzOrder = await instance.orders.create({
            amount: amount * 100,
            currency: 'INR',
            receipt: sub.id.substring(0, 10)
        })

        // Update sub with RZ ID
        await (await supabase).from('subscriptions').update({ transaction_id: rzOrder.id }).eq('id', sub.id)

        return {
            success: true,
            razorpayOrderId: rzOrder.id,
            keyId: adminSettings.razorpay_key_id,
            amount: rzOrder.amount as number,
            subId: sub.id
        }
    } catch (e: any) {
        return { error: e.message || 'Payment engine failure' }
    }
}

export async function verifyAdminSubscriptionPayment(subId: string, razorpayPaymentId: string, razorpaySignature: string) {
    const supabase = createClient()
    const { data: { user } } = await (await supabase).auth.getUser()
    if (!user) return { error: 'Unauthorized' }

    const { getAdminSettings } = await import('./admin')
    const adminSettings = await getAdminSettings()

    if (!adminSettings?.razorpay_key_secret) return { error: 'Config missing' }

    const admin_key_secret = decrypt(adminSettings.razorpay_key_secret)
    if (!admin_key_secret) return { error: 'Admin payment configuration error: decryption failed' }

    const { data: sub } = await (await supabase).from('subscriptions').select('transaction_id').eq('id', subId).single()
    if (!sub) return { error: 'Subscription link broken' }

    // Strict HMAC verification using decrypted real key
    const body = sub.transaction_id + '|' + razorpayPaymentId
    const expectedSignature = crypto
        .createHmac('sha256', admin_key_secret)
        .update(body)
        .digest('hex')

    if (expectedSignature !== razorpaySignature) {
        console.error('[payment] Admin subscription signature mismatch for sub', subId)
        return { error: 'Invalid payment signature' }
    }

    // Success -> Mark as paid
    await (await supabase).from('subscriptions').update({
        status: 'paid',
        transaction_id: razorpayPaymentId
    }).eq('id', subId)

    // Bump Shopkeeper Status
    const endDate = new Date()
    endDate.setFullYear(endDate.getFullYear() + 1)

    await (await supabase).from('shopkeepers').update({
        subscription_status: 'active',
        subscription_end_date: endDate.toISOString()
    }).eq('id', user.id)

    revalidatePath('/admin')
    return { success: true }
}
