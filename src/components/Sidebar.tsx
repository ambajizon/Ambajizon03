'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStoreContext } from '@/context/StoreContext'

const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
    { name: 'Orders', href: '/dashboard/orders', icon: 'local_mall' },
    { name: 'Payments', href: '/dashboard/payments', icon: 'payments' },
    { name: 'Products', href: '/dashboard/products', icon: 'inventory_2' },
    { name: 'Categories', href: '/dashboard/products/categories', icon: 'sell', indent: true },
    { name: 'Subcategories', href: '/dashboard/products/subcategories', icon: 'layers', indent: true },
    { name: 'Storefront', href: '/dashboard/storefront', icon: 'storefront' },
    { name: 'Marketing', href: '/dashboard/marketing', icon: 'campaign' },
    { name: 'Coupons', href: '/dashboard/marketing/coupons', icon: 'local_offer', indent: true },
    { name: 'Offers', href: '/dashboard/marketing/offers', icon: 'sell', indent: true },
    { name: 'Share M.', href: '/dashboard/marketing/share', icon: 'share', indent: true },
    { name: 'Reminders', href: '/dashboard/marketing/reminders', icon: 'notifications', indent: true },
    { name: 'CRM', href: '/dashboard/crm', icon: 'group' },
    { name: 'Reports', href: '/dashboard/reports', icon: 'bar_chart' },
    { name: 'Analytics', href: '/dashboard/analytics', icon: 'trending_up' },
    { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
]

export default function Sidebar() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [pendingOrders, setPendingOrders] = useState(0)
    const { storeInfo } = useStoreContext()

    useEffect(() => {
        async function fetchPendingOrders() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: store } = await supabase
                .from('stores')
                .select('id')
                .eq('shopkeeper_id', user.id)
                .maybeSingle()

            if (store) {
                const { count } = await supabase
                    .from('orders')
                    .select('*', { count: 'exact', head: true })
                    .eq('store_id', store.id)
                    .eq('status', 'pending')

                setPendingOrders(count || 0)
            }
        }
        fetchPendingOrders()
    }, [])

    return (
        <>
            <button
                type="button"
                className="fixed left-4 top-4 z-50 p-2 text-gray-700 lg:hidden flex items-center justify-center"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-outlined text-[24px]">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-white shadow-lg transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
                <nav className="flex-1 space-y-1 overflow-y-auto px-4 py-8">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[14px] font-bold transition-all ${item.indent ? 'ml-6' : ''} ${isActive
                                    ? 'bg-primary/10 text-primary'
                                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                    }`}
                            >
                                <div className="flex items-center">
                                    <span className={`material-symbols-outlined mr-3 text-[22px] transition-colors ${isActive ? 'text-primary' : 'text-slate-400 group-hover:text-slate-500'}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </div>
                                {item.name === 'Orders' && pendingOrders > 0 && (
                                    <span className="bg-red-500 text-white text-[10px] min-w-[20px] h-[20px] flex items-center justify-center rounded-full font-bold px-1.5 shadow-sm">
                                        {pendingOrders > 99 ? '99+' : pendingOrders}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>
            </div>

            {/* Overlay for mobile */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/50 lg:hidden"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
