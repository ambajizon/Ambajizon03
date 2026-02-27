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
            {/* Mobile hamburger — now white on dark */}
            <button
                type="button"
                className="fixed left-4 top-4 z-50 p-2 text-white bg-indigo-900/80 rounded-lg lg:hidden flex items-center justify-center shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-outlined text-[24px]">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Dark Indigo Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-40 w-64 transform bg-indigo-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand / Logo area */}
                <div className="px-6 py-6 border-b border-indigo-800/60 shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-white/10 flex items-center justify-center">
                            <span className="material-symbols-outlined text-white text-[20px]">storefront</span>
                        </div>
                        <div>
                            <p className="text-white font-black text-[15px] leading-tight">{storeInfo.name || 'Ambajizon'}</p>
                            <p className="text-indigo-300 text-[11px] font-medium">Seller Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 py-4">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group flex items-center justify-between rounded-lg px-3 py-2.5 text-[13.5px] font-bold transition-all ${item.indent ? 'ml-5' : ''} ${isActive
                                    ? 'bg-white text-indigo-900 shadow-sm'
                                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <span className={`material-symbols-outlined text-[20px] transition-colors ${isActive ? 'text-indigo-700' : 'text-indigo-300 group-hover:text-white'}`}>
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

                {/* Bottom version stamp */}
                <div className="px-5 py-4 border-t border-indigo-800/60 shrink-0">
                    <p className="text-indigo-400 text-[11px] font-medium">Ambajizon v1.0 • Seller Panel</p>
                </div>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/60 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
