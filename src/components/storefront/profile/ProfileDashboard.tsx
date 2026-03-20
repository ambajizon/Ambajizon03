'use client'

import { useEffect, useState } from 'react'
import ProfileSidebar from './ProfileSidebar'
import ProfileHeader from './ProfileHeader'
import RewardsCard from './RewardsCard'
import OrdersSection from './OrdersSection'
import AddressesSection from './AddressesSection'
import { type Customer } from '@/app/actions/customer'

export type Section = 'overview' | 'orders' | 'addresses' | 'rewards' | 'settings'

const sectionTitles: Record<Section, string> = {
    overview: 'My Profile',
    orders: 'My Orders',
    addresses: 'Saved Addresses',
    rewards: 'Loyalty Points',
    settings: 'Account Settings',
}

interface ProfileDashboardProps {
    store: { id: string; name: string; slug: string; logo_url: string | null; whatsapp_number?: string | null }
    customer: Customer
    addresses: any[]
    orders: any[]
}

export default function ProfileDashboard({ store, customer, addresses, orders }: ProfileDashboardProps) {
    const [activeSection, setActiveSection] = useState<Section>('overview')

    // Dynamic page title per section
    useEffect(() => {
        document.title = `${sectionTitles[activeSection]} — ${store.name}`
        return () => { document.title = store.name }
    }, [activeSection, store.name])

    const initials = (customer.full_name || 'U')
        .split(' ')
        .map((n: string) => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)

    const memberYear = customer.created_at
        ? new Date(customer.created_at).getFullYear()
        : new Date().getFullYear()

    return (
        <div className="min-h-screen" style={{ background: '#F7F8FA' }}>
            {/* Mobile: horizontal scroll tab bar */}
            <ProfileSidebar
                activeSection={activeSection}
                onSectionChange={setActiveSection}
                customer={customer}
                initials={initials}
                orderCount={orders.length}
                storeSlug={store.slug}
                whatsappNumber={store.whatsapp_number || null}
                mobile
            />

            {/* Page body */}
            <div className="max-w-[1200px] mx-auto px-4 md:px-6 pb-28 md:pb-10">
                <div className="flex gap-6 items-start">

                    {/* Desktop sidebar */}
                    <div className="hidden lg:block shrink-0">
                        <ProfileSidebar
                            activeSection={activeSection}
                            onSectionChange={setActiveSection}
                            customer={customer}
                            initials={initials}
                            orderCount={orders.length}
                            storeSlug={store.slug}
                            whatsappNumber={store.whatsapp_number || null}
                        />
                    </div>

                    {/* Main content */}
                    <div className="flex-1 min-w-0 space-y-5 pt-4 pb-4">

                        {/* Always show profile header on overview */}
                        {(activeSection === 'overview') && (
                            <ProfileHeader
                                customer={customer}
                                initials={initials}
                                memberYear={memberYear}
                                orders={orders}
                                onSectionChange={setActiveSection}
                            />
                        )}

                        {/* Overview: show rewards + orders preview */}
                        {activeSection === 'overview' && (
                            <>
                                <RewardsCard points={customer.loyalty_points ?? 0} />
                                <OrdersSection
                                    orders={orders}
                                    storeSlug={store.slug}
                                    preview
                                />
                            </>
                        )}

                        {/* Dedicated orders tab */}
                        {activeSection === 'orders' && (
                            <OrdersSection
                                orders={orders}
                                storeSlug={store.slug}
                            />
                        )}

                        {/* Addresses tab */}
                        {activeSection === 'addresses' && (
                            <AddressesSection
                                addresses={addresses}
                                storeId={store.id}
                                storeSlug={store.slug}
                            />
                        )}

                        {/* Rewards tab */}
                        {activeSection === 'rewards' && (
                            <RewardsCard points={customer.loyalty_points ?? 0} expanded />
                        )}

                        {/* Settings tab */}
                        {activeSection === 'settings' && (
                            <SettingsSection customer={customer} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

// Inline settings section (simple, no extra file)
function SettingsSection({ customer }: { customer: Customer }) {
    return (
        <div className="bg-white rounded-2xl border border-rt-border p-6 shadow-rt-card space-y-6">
            <div>
                <h2 className="text-[18px] font-bold text-rt-text mb-1">Account Settings</h2>
                <p className="text-[13px] text-rt-muted">Manage your personal information</p>
            </div>
            <div className="space-y-4">
                {[
                    { label: 'Full Name', value: customer.full_name, placeholder: 'Your full name' },
                    { label: 'Email', value: customer.email || '', placeholder: 'your@email.com' },
                    { label: 'Mobile Number', value: customer.mobile || '', placeholder: '+91 XXXXX XXXXX' },
                ].map(({ label, value, placeholder }) => (
                    <div key={label}>
                        <label className="block text-[13px] font-semibold text-rt-text mb-1.5">{label}</label>
                        <input
                            defaultValue={value || ''}
                            placeholder={placeholder}
                            className="w-full h-11 px-4 rounded-[10px] border border-rt-border bg-rt-surface text-[14px] text-rt-text focus:outline-none focus:border-rt-primary transition-colors"
                        />
                    </div>
                ))}
                <div>
                    <label className="block text-[13px] font-semibold text-rt-text mb-1.5">Password</label>
                    <button className="text-[13px] text-rt-primary font-semibold hover:underline">Change Password →</button>
                </div>
            </div>
            <button className="w-full h-[48px] bg-rt-primary text-white font-bold rounded-[10px] hover:bg-rt-primary-dark transition-colors active:scale-[0.99] text-[15px]">
                Save Changes
            </button>
        </div>
    )
}
