import { getStoreBySlug } from '@/app/actions/storefront'
import { getCurrentCustomer, getCustomerAddresses } from '@/app/actions/customer'
import { getCustomerOrders } from '@/app/actions/checkout'
import { notFound, redirect } from 'next/navigation'
import StoreHeader from '@/components/storefront/StoreHeader'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import ProfileDashboard from '@/components/storefront/profile/ProfileDashboard'

export default async function ProfilePage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) notFound()

    const customer = await getCurrentCustomer(store.id)
    if (!customer) {
        redirect(`/${params.store}/auth?redirect=/${params.store}/shop/profile`)
    }

    const [addresses, orders] = await Promise.all([
        getCustomerAddresses(store.id),
        getCustomerOrders(store.id),
    ])

    return (
        <div className="min-h-screen" style={{ background: '#F7F8FA' }}>
            {/* Desktop header */}
            <div className="hidden md:block">
                <StoreHeader
                    storeId={store.id}
                    storeName={store.name}
                    storeSlug={store.slug}
                    logoUrl={store.logo_url}
                />
            </div>

            {/* Mobile header */}
            <div className="md:hidden">
                <StoreHeader
                    storeId={store.id}
                    storeName={store.name}
                    storeSlug={store.slug}
                    logoUrl={store.logo_url}
                    showBack={true}
                />
            </div>

            <ProfileDashboard
                store={{
                    id: store.id,
                    name: store.name,
                    slug: store.slug,
                    logo_url: store.logo_url,
                    whatsapp_number: (store as any).whatsapp_number ?? null,
                }}
                customer={customer}
                addresses={addresses}
                orders={orders}
            />

            <MobileBottomNav storeSlug={store.slug} />
        </div>
    )
}
