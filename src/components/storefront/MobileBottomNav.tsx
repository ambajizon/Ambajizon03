'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, Search, ShoppingBag, Heart, User } from 'lucide-react'
import { useEffect, useState } from 'react'
import { CountBadge } from '@/components/ui/Badge'

interface MobileBottomNavProps {
    storeSlug: string
}

export default function MobileBottomNav({ storeSlug }: MobileBottomNavProps) {
    const pathname = usePathname()
    const [cartCount, setCartCount] = useState(0)

    // Derived states
    const isHome = pathname === `/${storeSlug}/shop` || pathname === `/${storeSlug}`
    const isSearch = pathname === `/${storeSlug}/shop/search`
    const isCart = pathname === `/${storeSlug}/shop/cart`
    const isWishlist = pathname === `/${storeSlug}/shop/wishlist`
    const isProfile = pathname === `/${storeSlug}/shop/profile`

    useEffect(() => {
        const loadCartItems = () => {
            const items = localStorage.getItem(`cart_${storeSlug}`)
            if (items) {
                try {
                    const parsed = JSON.parse(items)
                    setCartCount(Array.isArray(parsed) ? parsed.length : 0)
                } catch (e) { }
            }
        }

        loadCartItems()
        window.addEventListener('storage', loadCartItems)

        const handleCartUpdate = () => loadCartItems()
        window.addEventListener('cart-updated', handleCartUpdate)

        return () => {
            window.removeEventListener('storage', loadCartItems)
            window.removeEventListener('cart-updated', handleCartUpdate)
        }
    }, [storeSlug])

    return (
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 pb-safe md:hidden shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.08)]">
            <div className="flex justify-around items-center h-[60px] px-2">
                <Link href={`/${storeSlug}/shop`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isHome ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Home size={22} className={isHome ? 'stroke-[2.5px] fill-primary/10' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>Home</span>
                </Link>

                <Link href={`/${storeSlug}/shop/search`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isSearch ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Search size={22} className={isSearch ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isSearch ? 'font-bold' : 'font-medium'}`}>Search</span>
                </Link>

                <Link href={`/${storeSlug}/shop/cart`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isCart ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <div className="relative">
                        <ShoppingBag size={22} className={isCart ? 'stroke-[2.5px] fill-primary/10' : 'stroke-[2px]'} />
                        <CountBadge count={cartCount} />
                    </div>
                    <span className={`text-[10px] ${isCart ? 'font-bold' : 'font-medium'}`}>Cart</span>
                </Link>

                <Link href={`/${storeSlug}/shop/wishlist`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isWishlist ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <Heart size={22} className={isWishlist ? 'stroke-[2.5px] fill-primary/10' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isWishlist ? 'font-bold' : 'font-medium'}`}>Wishlist</span>
                </Link>

                <Link href={`/${storeSlug}/shop/profile`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-95 transition-all ${isProfile ? 'text-primary' : 'text-gray-400 hover:text-gray-600'}`}>
                    <User size={22} className={isProfile ? 'stroke-[2.5px] fill-primary/10' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isProfile ? 'font-bold' : 'font-medium'}`}>Profile</span>
                </Link>
            </div>
        </div>
    )
}
