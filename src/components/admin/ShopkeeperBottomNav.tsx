'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Megaphone, Settings, IndianRupee, Users, BarChart2 } from 'lucide-react'

const navItems = [
    { href: '/dashboard', label: 'Home', icon: LayoutDashboard, exact: true },
    { href: '/dashboard/orders', label: 'Orders', icon: ShoppingBag },
    { href: '/dashboard/products', label: 'Items', icon: Package },
    { href: '/dashboard/payments', label: 'Payments', icon: IndianRupee },
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
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe md:hidden shadow-[0_-8px_24px_-8px_rgba(0,0,0,0.08)]">
            {/* Scrollable row — hide scrollbar, snap-x for native feel */}
            <div className="relative">
                <div className="flex overflow-x-auto overflow-y-hidden snap-x scroll-smooth h-[60px] px-1 hide-scrollbar">
                    {navItems.map(({ href, label, icon: Icon, exact }) => {
                        const active = isActive(href, exact)
                        return (
                            <Link
                                key={href}
                                href={href}
                                className={`relative flex flex-col items-center justify-center flex-shrink-0 min-w-[68px] h-full gap-0.5 snap-center active:scale-95 transition-transform px-1 ${active ? 'text-primary' : 'text-gray-400 hover:text-gray-700'}`}
                            >
                                <Icon
                                    size={20}
                                    className={active ? 'stroke-[2.5px]' : 'stroke-[1.75px]'}
                                />
                                <span className={`text-[9.5px] uppercase tracking-wider leading-none ${active ? 'font-black' : 'font-semibold'}`}>
                                    {label}
                                </span>
                                {active && (
                                    <div className="absolute -bottom-px w-4 h-[2.5px] bg-primary rounded-full shadow-sm" />
                                )}
                            </Link>
                        )
                    })}
                </div>

                {/* Right-edge fade gradient — signals more items exist */}
                <div className="absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-white via-white/60 to-transparent pointer-events-none" />
            </div>
        </div>
    )
}
