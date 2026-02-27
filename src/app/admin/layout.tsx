'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Users, CreditCard, Settings, BarChart3, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import ShopkeeperBottomNav from '@/components/admin/ShopkeeperBottomNav'

const navigation = [
    { name: 'Overview', href: '/admin', icon: LayoutDashboard },
    { name: 'Shopkeepers', href: '/admin/shopkeepers', icon: Users },
    { name: 'Billing & Subscriptions', href: '/admin/billing', icon: CreditCard },
    { name: 'Platform Analytics', href: '/admin/analytics', icon: BarChart3 },
    { name: 'Admin Settings', href: '/admin/settings', icon: Settings },
]

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()
    const router = useRouter()

    const handleSignOut = async () => {
        const supabase = createClient()
        await supabase.auth.signOut()
        router.push('/login')
    }

    return (
        <div className="flex min-h-screen bg-slate-100">
            {/* Sidebar (Desktop Only) */}
            <div className="hidden md:flex fixed inset-y-0 z-50 w-64 flex-col">
                <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-indigo-900 px-4 pb-4 shadow-2xl shadow-indigo-900/30">
                    <div className="flex h-16 shrink-0 items-center gap-3 border-b border-indigo-800/60">
                        <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                            <LayoutDashboard className="h-4 w-4 text-white" />
                        </div>
                        <span className="text-[15px] font-black text-white tracking-wide">AMBAJIZON ADMIN</span>
                    </div>

                    <nav className="flex flex-1 flex-col">
                        <ul role="list" className="flex flex-1 flex-col gap-y-7">
                            <li>
                                <ul role="list" className="-mx-2 space-y-1">
                                    {navigation.map((item) => {
                                        const isActive = pathname === item.href
                                        return (
                                            <li key={item.name}>
                                                <Link
                                                    href={item.href}
                                                    className={`
                                                        group flex gap-x-3 rounded-lg p-2.5 text-[13px] leading-6 font-bold transition-all
                                                        ${isActive ? 'bg-white text-indigo-900 shadow-sm' : 'text-indigo-200 hover:bg-white/10 hover:text-white'}
                                                    `}
                                                >
                                                    <item.icon className={`h-5 w-5 shrink-0 ${isActive ? 'text-indigo-700' : 'text-indigo-300 group-hover:text-white'}`} aria-hidden="true" />
                                                    {item.name}
                                                </Link>
                                            </li>
                                        )
                                    })}
                                </ul>
                            </li>
                            <li className="mt-auto">
                                <button
                                    onClick={handleSignOut}
                                    className="group -mx-2 flex gap-x-3 rounded-lg p-2.5 text-[13px] leading-6 font-bold text-indigo-200 hover:bg-white/10 hover:text-white w-full text-left transition-all"
                                >
                                    <LogOut className="h-6 w-6 shrink-0" aria-hidden="true" />
                                    Sign out
                                </button>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>

            {/* Main Content */}
            <main className="md:pl-64 w-full pb-20 md:pb-0 bg-slate-100 min-h-screen">
                <div className="px-4 py-6 md:py-8 sm:px-6 lg:px-8 max-w-7xl mx-auto">
                    {children}
                </div>
            </main>

            {/* Mobile Bottom Navigation */}
            <ShopkeeperBottomNav />
        </div>
    )
}
