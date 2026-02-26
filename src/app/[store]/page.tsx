import { getStoreBySlug } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import DoorClient from '@/components/storefront/DoorClient'
import InstallPrompt from '@/components/storefront/InstallPrompt'

export default async function StoreDoorPage({ params }: { params: { store: string } }) {
    const supabase = await createClient()
    const [{ data: { user } }, store] = await Promise.all([
        supabase.auth.getUser(),
        getStoreBySlug(params.store)
    ])

    if (!store) notFound()

    if (store.is_enabled === false) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center p-8 bg-gray-50 text-center">
                <div className="w-24 h-24 bg-gray-200 rounded-full flex items-center justify-center mb-6">
                    <span className="text-3xl">🏪</span>
                </div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Store Temporarily Unavailable</h1>
                <p className="text-gray-500 max-w-sm mx-auto">
                    The shopkeeper has temporarily disabled this store. Please check back later or contact the owner directly.
                </p>
            </div>
        )
    }

    return (
        <>
            <DoorClient store={store} storeSlug={params.store} isLoggedIn={!!user} />
            <InstallPrompt storeName={store.name} primaryColor={store.primary_color || '#3b82f6'} logoUrl={store.logo_url} />
        </>
    )
}
