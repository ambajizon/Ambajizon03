'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStoreContext } from '@/context/StoreContext'

// Navigation with section group labels
const navigationGroups = [
    {
        label: 'DASHBOARD',
        items: [
            { name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
        ]
    },
    {
        label: 'STORE',
        items: [
            { name: 'Orders', href: '/dashboard/orders', icon: 'local_mall' },
            { name: 'Payments', href: '/dashboard/payments', icon: 'payments' },
            { name: 'Products', href: '/dashboard/products', icon: 'inventory_2' },
            { name: 'Categories', href: '/dashboard/products/categories', icon: 'sell', indent: true },
            { name: 'Subcategories', href: '/dashboard/products/subcategories', icon: 'layers', indent: true },
            { name: 'Storefront', href: '/dashboard/storefront', icon: 'storefront' },
        ]
    },
    {
        label: 'MARKETING',
        items: [
            { name: 'Marketing', href: '/dashboard/marketing', icon: 'campaign' },
            { name: 'Coupons', href: '/dashboard/marketing/coupons', icon: 'local_offer', indent: true },
            { name: 'Offers', href: '/dashboard/marketing/offers', icon: 'sell', indent: true },
            { name: 'Share M.', href: '/dashboard/marketing/share', icon: 'share', indent: true },
            { name: 'Reminders', href: '/dashboard/marketing/reminders', icon: 'notifications', indent: true },
            { name: 'CRM', href: '/dashboard/crm', icon: 'group' },
        ]
    },
    {
        label: 'ANALYTICS',
        items: [
            { name: 'Reports', href: '/dashboard/reports', icon: 'bar_chart' },
            { name: 'Analytics', href: '/dashboard/analytics', icon: 'trending_up' },
        ]
    },
    {
        label: 'SYSTEM',
        items: [
            { name: 'Settings', href: '/dashboard/settings', icon: 'settings' },
        ]
    },
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
                className="fixed left-3 top-3.5 z-50 p-1.5 bg-white border border-dash-border rounded-lg lg:hidden flex items-center justify-center shadow-dash-topbar transition-colors hover:bg-dash-primary-light hover:border-dash-primary"
                onClick={() => setIsOpen(!isOpen)}
            >
                <span className="material-symbols-outlined text-[20px] text-dash-muted">
                    {isOpen ? 'close' : 'menu'}
                </span>
            </button>

            {/* Light Sidebar */}
            <div
                className={`fixed inset-y-0 left-0 z-40 w-[230px] bg-white border-r border-dash-border flex flex-col transform transition-transform duration-300 ease-in-out lg:static lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}
                style={{ boxShadow: '2px 0 8px rgba(0,0,0,0.04)' }}
            >
                {/* Brand area */}
                <div className="px-5 py-5 border-b border-dash-border shrink-0">
                    <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg bg-dash-primary-light flex items-center justify-center shrink-0">
                            <span className="material-symbols-outlined text-dash-primary text-[18px]">storefront</span>
                        </div>
                        <div className="min-w-0">
                            <p className="text-dash-text font-bold text-[14px] leading-tight truncate">
                                {storeInfo.name || 'Rupa Toys'}
                            </p>
                            <p className="text-[#9CA3AF] text-[11px] font-normal">Seller Dashboard</p>
                        </div>
                    </div>
                </div>

                {/* Nav Links */}
                <nav className="flex-1 overflow-y-auto py-3 hide-scrollbar">
                    {navigationGroups.map((group) => (
                        <div key={group.label}>
                            <p className="px-5 pt-4 pb-1.5 text-[10px] font-semibold tracking-[0.1em] uppercase text-[#C4C9D9]">
                                {group.label}
                            </p>
                            {group.items.map((item) => {
                                const isActive = pathname === item.href
                                return (
                                    <div
                                        key={item.name}
                                        className={`mx-2.5 my-0.5 ${isActive ? 'border-l-[3px] border-dash-primary rounded-[10px]' : 'border-l-[3px] border-transparent'}`}
                                    >
                                        <Link
                                            href={item.href}
                                            onClick={() => setIsOpen(false)}
                                            className={`group flex items-center justify-between px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all duration-150 ${item.indent ? 'pl-11' : ''} ${isActive
                                                ? 'bg-dash-primary-light text-dash-primary font-semibold'
                                                : 'text-dash-muted hover:bg-[#F8F8FF] hover:text-dash-primary'
                                            }`}
                                        >
                                            <div className="flex items-center gap-2.5">
                                                {item.indent ? (
                                                    <span className={`w-1.5 h-1.5 rounded-full shrink-0 transition-colors ${isActive ? 'bg-dash-primary' : 'bg-[#C4C9D9] group-hover:bg-dash-primary'}`} />
                                                ) : (
                                                    <span className={`material-symbols-outlined text-[18px] transition-colors shrink-0 ${isActive ? 'text-dash-primary' : 'text-dash-icon group-hover:text-dash-primary'}`}>
                                                        {item.icon}
                                                    </span>
                                                )}
                                                <span className="truncate">{item.name}</span>
                                            </div>
                                            {item.name === 'Orders' && pendingOrders > 0 && (
                                                <span className="bg-dash-danger text-white text-[9px] min-w-[17px] h-[17px] flex items-center justify-center rounded-full font-bold px-1">
                                                    {pendingOrders > 99 ? '99+' : pendingOrders}
                                                </span>
                                            )}
                                        </Link>
                                    </div>
                                )
                            })}
                        </div>
                    ))}
                </nav>

                {/* Bottom stamp */}
                <div className="px-5 py-4 border-t border-dash-border shrink-0 space-y-2">
                    <div className="flex items-center gap-2">
                        <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse shrink-0" />
                        <span className="text-[11px] font-medium text-[#15803D]">Store Live</span>
                    </div>
                    <p className="text-[#C4C9D9] text-[10px]">Ambajizon v1.0</p>
                </div>
            </div>

            {/* Mobile overlay */}
            {isOpen && (
                <div
                    className="fixed inset-0 z-30 bg-black/40 lg:hidden backdrop-blur-sm"
                    onClick={() => setIsOpen(false)}
                />
            )}
        </>
    )
}
