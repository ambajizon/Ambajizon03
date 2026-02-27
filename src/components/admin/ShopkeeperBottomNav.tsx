'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Megaphone, Settings, IndianRupee, Users, BarChart2 } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/products', label: 'Items', icon: Package },
    { href: '/dashboard/payments', label: 'Pay', icon: IndianRupee },
    { href: '/dashboard/crm', label: 'CRM', icon: Users },
    { href: '/dashboard/marketing', label: 'Market', icon: Megaphone },
    { href: '/dashboard/reports', label: 'Reports', icon: BarChart2 },
    { href: '/dashboard/settings', label: 'Account', icon: Settings },
]

export default function ShopkeeperBottomNav() {
    const pathname = usePathname()

    const isActive = (href: string, exact?: boolean) => {
        if (exact) return pathname === href
        return pathname?.startsWith(href)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 pb-safe md:hidden shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
            {/* Scrollable row */}
            <div className="relative">
                <div className="flex overflow-x-auto overflow-y-hidden snap-x scroll-smooth h-[56px] hide-scrollbar">
                    {navItems.map(({ href, label, icon: Icon, exact }) => {
                        const active = isActive(href, exact)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-col items-center justify-center flex-shrink-0 min-w-[62px] h-full gap-0.5 snap-center active:scale-95 transition-all px-1 ${active
                                    ? 'text-indigo-600'
                                    : 'text-slate-400 hover:text-slate-600'
                                    }`}
                            >
                                {/* Active background pill */}
                                {active && (
                                    <span className="absolute top-1.5 inset-x-2 h-6 rounded-lg bg-indigo-50" />
                                )}
                                <Icon
                                    size={18}
                                    className={`relative z-10 transition-all ${active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}`}
                                />
                                <span className={`relative z-10 text-[9px] leading-none ${active ? 'font-black' : 'font-semibold'}`}>
                                    {label}
                                </span>
                                {/* Active underline */}
                                {active && (
                                    <span className="absolute bottom-0 left-1/2 -translate-x-1/2 w-5 h-[2.5px] bg-indigo-600 rounded-full" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Right-edge fade */}
                <div className="absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white via-white/70 to-transparent pointer-events-none" />
            </div>
        </div>
    )
}
