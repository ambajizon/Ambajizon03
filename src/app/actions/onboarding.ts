'use server';

import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/service';
import { revalidatePath } from 'next/cache';

export async function completeShopkeeperRegistration(formData: FormData) {
    const supabase = await createClient(); // Wait for the client

    // Get current user to ensure authentication
    const { data: { user }, error: authError } = await supabase.auth.getUser();

    if (authError || !user) {
        return { error: 'Authentication failed. Please try signing in again.' };
    }

    const name = formData.get('name') as string;
    const email = user.email; // Source of truth is auth user

    if (!name) {
        return { error: 'Name is required' };
    }

    // Insert into shopkeepers table
    // We utilize the trial logic default values (or set them here explicitly if needed)
    // Subscription status 'trial', trial_end_date handled by defaults or trigger?
    // Let's set them explicitly to be safe if defaults aren't there.
    const trialEndDate = new Date();
    trialEndDate.setDate(trialEndDate.getDate() + 14); // 14 days trial

    const { error: insertError } = await supabase
        .from('shopkeepers')
        .insert({
            id: user.id,
            email: email,
            // full_name column missing in schema, relying on auth metadata or store name
            subscription_status: 'trial',
            trial_end_date: trialEndDate.toISOString(),
            // created_at handled by default
        })
        .select()
        .single();

    if (insertError) {
        // If error code is 23505 (unique_violation), it means profile already exists, which is fine.
        if (insertError.code !== '23505') {
            console.error('Error creating shopkeeper profile:', insertError);
            return { error: 'Failed to create profile. ' + insertError.message };
        }
    }

    // Insert pending store for wizard to update later
    const adminSupabase = createAdminClient();
    const storeSlug = `store-${user.id.substring(0, 8)}-${Date.now()}`;

    const { error: storeError } = await adminSupabase
        .from('stores')
        .insert({
            shopkeeper_id: user.id,
            name: name, // Exact store name provided by user
            slug: storeSlug,
        });

    if (storeError && storeError.code !== '23505') {
        console.error('Error creating store profile:', storeError);
        return { error: 'Failed to create initial store record. ' + storeError.message };
    }

    revalidatePath('/dashboard');
    return { success: true };
}
