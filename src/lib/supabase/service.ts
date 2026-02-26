import { createClient } from '@supabase/supabase-js'

/**
 * Creates a Supabase Admin client with elevated privileges (Service Role).
 * ONLY USE THIS SERVER-SIDE for background tasks that require bypassing RLS,
 * such as decrementing product stock or updating loyalty points after an order.
 * NEVER return this client to the browser/client-side.
 */
export function createAdminClient() {
    return createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false
            }
        }
    )
}
