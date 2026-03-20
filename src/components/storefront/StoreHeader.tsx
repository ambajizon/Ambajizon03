'use client'

import Link from 'next/link'
import { ArrowLeft, Search, ShoppingBag, User, Heart } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { CountBadge } from '@/components/ui/Badge'
import { getStoreCategories } from '@/app/actions/storefront'
import { usePathname } from 'next/navigation'

interface StoreHeaderProps {
    storeName: string
    storeSlug: string
    logoUrl: string | null
    storeId?: string
    showBack?: boolean
    cartCount?: number
}

export default function StoreHeader({ storeName, storeSlug, logoUrl, storeId, showBack = false, cartCount = 0 }: StoreHeaderProps) {
    const [scrolled, setScrolled] = useState(false)
    const [categories, setCategories] = useState<any[]>([])
    const pathname = usePathname()

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 10)
        window.addEventListener('scroll', handleScroll)
        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    useEffect(() => {
        async function fetchCategories() {
            if (storeId) {
                const cats = await getStoreCategories(storeId)
                setCategories(cats)
            }
        }
        fetchCategories()
    }, [storeId])

    return (
        <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'shadow-md' : ''}`}>
            {/* ── MOBILE HEADER ─────────────────────────────────── */}
            <div className={`md:hidden flex items-center justify-between h-[60px] px-4 w-full bg-white border-b border-rt-border transition-all duration-300 ${scrolled ? 'shadow-sm' : ''}`}>
                {/* Left: Back / Menu + Logo + Name */}
                <div className="flex items-center gap-2.5 overflow-hidden">
                    {showBack ? (
                        <Link href={`/${storeSlug}/shop`} className="text-rt-text hover:bg-rt-surface p-2 rounded-full shrink-0 transition-colors">
                            <ArrowLeft size={22} />
                        </Link>
                    ) : null}

                    <Link href={`/${storeSlug}/shop`} className="flex items-center gap-2 overflow-hidden">
                        <div className="relative w-9 h-9 rounded-full overflow-hidden border-2 border-rt-border shrink-0 bg-rt-surface flex items-center justify-center shadow-sm">
                            {logoUrl ? (
                                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                            ) : (
                                <span className="text-[13px] font-black text-rt-primary">{storeName[0]}</span>
                            )}
                        </div>
                        <span className="font-bold text-[17px] text-rt-text tracking-tight truncate">
                            {storeName}
                        </span>
                    </Link>
                </div>

                {/* Right: Search + Cart */}
                <div className="flex items-center gap-1.5 shrink-0">
                    <Link href={`/${storeSlug}/shop/search`} className="w-10 h-10 flex items-center justify-center text-rt-text hover:bg-rt-surface rounded-full transition-colors active:scale-95">
                        <Search size={22} />
                    </Link>
                    <Link href={`/${storeSlug}/shop/cart`} className="w-10 h-10 flex items-center justify-center text-rt-text hover:bg-rt-surface rounded-full transition-colors active:scale-95 relative">
                        <ShoppingBag size={22} />
                        {cartCount > 0 && (
                            <span className="absolute -top-0.5 -right-0.5 bg-rt-primary text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                                {cartCount > 9 ? '9+' : cartCount}
                            </span>
                        )}
                    </Link>
                </div>
            </div>

            {/* ── DESKTOP HEADER ──────────────────────────────────── */}
            <div className={`hidden md:block w-full bg-white border-b border-rt-border transition-all duration-300`}>
                <div className={`flex items-center h-[68px] max-w-[1280px] mx-auto px-6 lg:px-8 gap-6 transition-all duration-300 ${scrolled ? 'h-[60px]' : 'h-[68px]'}`}>

                    {/* Logo + Name */}
                    <Link href={`/${storeSlug}/shop`} className="flex items-center gap-3 shrink-0 group">
                        <div className={`relative overflow-hidden rounded-full shadow-sm bg-rt-surface flex items-center justify-center border-2 border-rt-border group-hover:border-rt-primary transition-all duration-300 ${scrolled ? 'w-9 h-9' : 'w-10 h-10'}`}>
                            {logoUrl ? (
                                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                            ) : (
                                <span className="text-lg font-black text-rt-primary">{storeName[0]}</span>
                            )}
                        </div>
                        <span className={`font-black text-rt-text tracking-tight transition-all duration-300 ${scrolled ? 'text-[18px]' : 'text-[20px]'}`}>{storeName}</span>
                    </Link>

                    {/* Search Bar */}
                    <div className="flex-1 max-w-[480px] mx-auto">
                        <Link href={`/${storeSlug}/shop/search`} className="block relative group">
                            <div className="w-full h-11 bg-rt-surface border-2 border-rt-border rounded-full pl-5 pr-12 flex items-center hover:border-rt-primary/40 transition-colors cursor-pointer shadow-inner">
                                <span className="text-[14px] font-medium text-rt-muted">Search for toys, brands &amp; more…</span>
                            </div>
                            <div className="absolute right-1.5 top-1/2 -translate-y-1/2 w-8 h-8 bg-rt-primary text-white rounded-full flex items-center justify-center group-hover:bg-rt-primary-dark transition-colors">
                                <Search size={16} strokeWidth={2.5} />
                            </div>
                        </Link>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-1 shrink-0">
                        <Link href={`/${storeSlug}/shop/wishlist`} className="w-11 h-11 flex flex-col items-center justify-center rounded-full hover:bg-rt-surface transition-colors text-rt-muted hover:text-rt-primary group">
                            <Heart size={22} strokeWidth={2} />
                        </Link>
                        <Link href={`/${storeSlug}/shop/profile`} className="w-11 h-11 flex flex-col items-center justify-center rounded-full hover:bg-rt-surface transition-colors text-rt-muted hover:text-rt-primary">
                            <User size={22} strokeWidth={2} />
                        </Link>
                        <Link href={`/${storeSlug}/shop/cart`} className="w-11 h-11 flex flex-col items-center justify-center rounded-full hover:bg-rt-surface transition-colors text-rt-muted hover:text-rt-primary relative group">
                            <ShoppingBag size={22} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="absolute top-0.5 right-0.5 bg-rt-primary text-white text-[10px] font-black w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* ── DESKTOP CATEGORY NAV ──────────────────────────── */}
            <div className={`hidden md:block w-full bg-white border-b border-rt-border ${scrolled ? 'shadow-sm' : ''}`}>
                <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
                    <div className="flex items-center gap-6 lg:gap-8 h-[44px] overflow-x-auto hide-scrollbar">
                        {/* All Categories */}
                        <Link
                            href={`/${storeSlug}/shop/search`}
                            className={`text-[13px] font-semibold whitespace-nowrap shrink-0 py-3 border-b-2 transition-all uppercase tracking-[0.05em] ${
                                pathname === `/${storeSlug}/shop`
                                    ? 'text-rt-primary border-rt-primary'
                                    : 'text-[#374151] border-transparent hover:text-rt-primary hover:border-rt-primary'
                            }`}
                        >
                            All
                        </Link>

                        {categories.slice(0, 10).map((cat: any) => {
                            const isActive = pathname.includes(`/category/${cat.id}`)
                            return (
                                <Link
                                    key={cat.id}
                                    href={`/${storeSlug}/shop/category/${cat.id}`}
                                    className={`text-[13px] font-semibold whitespace-nowrap shrink-0 py-3 border-b-2 transition-all uppercase tracking-[0.05em] ${
                                        isActive
                                            ? 'text-rt-primary border-rt-primary'
                                            : 'text-[#374151] border-transparent hover:text-rt-primary hover:border-rt-primary'
                                    }`}
                                >
                                    {cat.name}
                                </Link>
                            )
                        })}

                        {categories.length > 10 && (
                            <div className="relative group py-3 cursor-pointer shrink-0">
                                <span className="text-[13px] font-semibold text-[#374151] group-hover:text-rt-primary flex items-center gap-1 transition-colors tracking-[0.05em]">
                                    More ▾
                                </span>
                                <div className="absolute top-full left-0 w-56 bg-white border border-rt-border shadow-rt-card-hover rounded-2xl py-3 hidden group-hover:block z-50">
                                    {categories.slice(10).map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/${storeSlug}/shop/category/${cat.id}`}
                                            className="block px-5 py-2.5 text-[14px] font-medium text-rt-muted hover:bg-rt-surface hover:text-rt-primary transition-colors"
                                        >
                                            {cat.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    )
}
