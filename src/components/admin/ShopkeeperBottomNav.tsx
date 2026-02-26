'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, ShoppingBag, Package, Megaphone, Settings, IndianRupee } from 'lucide-react'

export default function ShopkeeperBottomNav() {
    const pathname = usePathname()

    const isActive = (path: string) => {
        if (path === '/dashboard') {
            return pathname === '/dashboard' // exact match for dashboard
        }
        return pathname?.startsWith(path)
    }

    return (
        <div className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-gray-100 pb-safe md:hidden shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.06)]">
            <div className="flex justify-between items-center h-[68px] px-2">

                {/* Dashboard */}
                <Link
                    href={'/dashboard'}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${isActive('/dashboard') ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <LayoutDashboard size={24} className={isActive('/dashboard') ? 'stroke-[2.5px]' : 'stroke-2'} />
                    <span className={`text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive('/dashboard') ? 'font-black' : 'font-bold'}`}>Home</span>
                    {isActive('/dashboard') && <div className="absolute -bottom-[2px] w-1 h-1 bg-primary rounded-full shadow-sm" />}
                </Link>

                {/* Orders */}
                <Link
                    href={'/dashboard/orders'}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${isActive('/dashboard/orders') ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <ShoppingBag size={24} className={isActive('/dashboard/orders') ? 'stroke-[2.5px]' : 'stroke-2'} />
                    <span className={`text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive('/dashboard/orders') ? 'font-black' : 'font-bold'}`}>Orders</span>
                    {isActive('/dashboard/orders') && <div className="absolute -bottom-[2px] w-1 h-1 bg-primary rounded-full shadow-sm" />}
                </Link>

                {/* Products */}
                <Link
                    href={'/dashboard/products'}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${isActive('/dashboard/products') ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <Package size={24} className={isActive('/dashboard/products') ? 'stroke-[2.5px]' : 'stroke-2'} />
                    <span className={`text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive('/dashboard/products') ? 'font-black' : 'font-bold'}`}>Items</span>
                    {isActive('/dashboard/products') && <div className="absolute -bottom-[2px] w-1 h-1 bg-primary rounded-full shadow-sm" />}
                </Link>

                {/* Payments */}
                <Link
                    href={'/dashboard/payments'}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${isActive('/dashboard/payments') ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <IndianRupee size={24} className={isActive('/dashboard/payments') ? 'stroke-[2.5px]' : 'stroke-2'} />
                    <span className={`text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive('/dashboard/payments') ? 'font-black' : 'font-bold'}`}>Payments</span>
                    {isActive('/dashboard/payments') && <div className="absolute -bottom-[2px] w-1 h-1 bg-primary rounded-full shadow-sm" />}
                </Link>

                {/* Settings */}
                <Link
                    href={'/dashboard/settings'}
                    className={`relative flex flex-col items-center justify-center w-full h-full gap-1 active:scale-95 transition-transform ${isActive('/dashboard/settings') ? 'text-primary' : 'text-gray-400 hover:text-gray-900'}`}
                >
                    <Settings size={24} className={isActive('/dashboard/settings') ? 'stroke-[2.5px]' : 'stroke-2'} />
                    <span className={`text-[10px] uppercase tracking-wider transition-all duration-300 ${isActive('/dashboard/settings') ? 'font-black' : 'font-bold'}`}>Account</span>
                    {isActive('/dashboard/settings') && <div className="absolute -bottom-[2px] w-1 h-1 bg-primary rounded-full shadow-sm" />}
                </Link>

            </div>
        </div>
    )
}
