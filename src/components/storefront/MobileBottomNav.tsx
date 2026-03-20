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
        <div className="fixed bottom-0 left-0 right-0 z-50 bg-sf-surface/95 backdrop-blur-md border-t border-sf-border pb-safe md:hidden shadow-card">
            <div className="flex justify-around items-center h-[64px] px-2">
                <Link href={`/${storeSlug}/shop`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-all ${isHome ? 'text-sf-accent' : 'text-sf-muted hover:text-sf-dark'}`}>
                    <Home size={22} className={isHome ? 'stroke-[2.5px] fill-sf-accent/5' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isHome ? 'font-bold' : 'font-medium'}`}>Home</span>
                </Link>

                <Link href={`/${storeSlug}/shop/search`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-all ${isSearch ? 'text-sf-accent' : 'text-sf-muted hover:text-sf-dark'}`}>
                    <Search size={22} className={isSearch ? 'stroke-[2.5px]' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isSearch ? 'font-bold' : 'font-medium'}`}>Search</span>
                </Link>

                <Link href={`/${storeSlug}/shop/cart`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-all ${isCart ? 'text-sf-accent' : 'text-sf-muted hover:text-sf-dark'}`}>
                    <div className="relative">
                        <ShoppingBag size={22} className={isCart ? 'stroke-[2.5px] fill-sf-accent/5' : 'stroke-[2px]'} />
                        {cartCount > 0 && (
                            <span className="absolute -top-1.5 -right-1.5 bg-sf-accent text-white text-[10px] font-bold min-w-[16px] h-[16px] px-1 rounded-full flex items-center justify-center border border-white shadow-sm scale-90">
                                {cartCount}
                            </span>
                        )}
                    </div>
                    <span className={`text-[10px] ${isCart ? 'font-bold' : 'font-medium'}`}>Cart</span>
                </Link>

                <Link href={`/${storeSlug}/shop/wishlist`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-all ${isWishlist ? 'text-sf-accent' : 'text-sf-muted hover:text-sf-dark'}`}>
                    <Heart size={22} className={isWishlist ? 'stroke-[2.5px] fill-sf-accent/5' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isWishlist ? 'font-bold' : 'font-medium'}`}>Wishlist</span>
                </Link>

                <Link href={`/${storeSlug}/shop/profile`} className={`flex flex-col items-center justify-center w-full h-full space-y-1 active:scale-90 transition-all ${isProfile ? 'text-sf-accent' : 'text-sf-muted hover:text-sf-dark'}`}>
                    <User size={22} className={isProfile ? 'stroke-[2.5px] fill-sf-accent/5' : 'stroke-[2px]'} />
                    <span className={`text-[10px] ${isProfile ? 'font-bold' : 'font-medium'}`}>Profile</span>
                </Link>
            </div>
        </div>
    )
}

