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
            {/* Mobile hamburger */}
            <button
                type="button"
                className="fixed left-3 top-3 z-50 p-1.5 text-white bg-indigo-900/80 rounded-lg lg:hidden flex items-center justify-center shadow"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-outlined text-[20px]">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Dark Indigo Sidebar — compact w-56 */}
            <div className={`fixed inset-y-0 left-0 z-40 w-56 transform bg-indigo-900 shadow-2xl transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 flex flex-col ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>

                {/* Brand area */}
                <div className="px-3.5 py-3.5 border-b border-indigo-800/60 shrink-0">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-lg bg-white/10 flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-white text-[15px]">storefront</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-white font-black text-[12.5px] leading-tight truncate">{storeInfo.name || 'Ambajizon'}</p>
                            <p className="text-indigo-300 text-[10px] font-medium">Seller Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto px-2 py-2 hide-scrollbar space-y-px">
                    {navigation.map((item) => {
                        const isActive = pathname === item.href
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                onClick={() => setIsOpen(false)}
                                className={`group flex items-center justify-between rounded-md px-2.5 py-1.5 text-xs font-semibold transition-all ${item.indent ? 'ml-4' : ''} ${isActive
                                    ? 'bg-white text-indigo-900 shadow-sm'
                                    : 'text-indigo-200 hover:bg-white/10 hover:text-white'
                                    }`}
                            >
                                <div className="flex items-center gap-2">
                                    <span className={`material-symbols-outlined text-[17px] transition-colors ${isActive ? 'text-indigo-700' : 'text-indigo-400 group-hover:text-white'}`}>
                                        {item.icon}
                                    </span>
                                    {item.name}
                                </div>
                                {item.name === 'Orders' && pendingOrders > 0 && (
                                    <span className="bg-red-500 text-white text-[9px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full font-bold px-1 shadow-sm">
                                        {pendingOrders > 99 ? '99+' : pendingOrders}
                                    </span>
                                )}
                            </Link>
                        )
                    })}
                </nav>

                {/* Bottom stamp */}
                <div className="px-3.5 py-3 border-t border-indigo-800/60 shrink-0">
                    <p className="text-indigo-500 text-[10px] font-medium">Ambajizon v1.0</p>
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
