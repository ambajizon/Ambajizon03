'use client'

import Link from 'next/link'
import { ArrowLeft, Search, ShoppingBag, Menu, User, Heart, Package } from 'lucide-react'
import Image from 'next/image'
import { useState, useEffect } from 'react'
import { CountBadge } from '@/components/ui/Badge'
import { getStoreCategories } from '@/app/actions/storefront'

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
        <header className={`sticky top-0 z-40 w-full transition-all duration-300 ${scrolled ? 'bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100' : 'bg-white border-b border-gray-100'}`}>
            {/* MOBILE HEADER (56px) - unchanged */}
            <div className="md:hidden flex items-center justify-between h-[60px] px-4 w-full">
                {/* Left: Back + Logo + Name */}
                <div className="flex items-center gap-3 overflow-hidden">
                    {showBack ? (
                        <Link href={`/${storeSlug}/shop`} className="text-gray-700 hover:bg-gray-100 p-2 rounded-full shrink-0 transition-colors">
                            <ArrowLeft size={22} />
                        </Link>
                    ) : (
                        <div className="text-gray-700 hover:bg-gray-100 p-2 rounded-full shrink-0 cursor-pointer transition-colors">
                            <Menu size={22} />
                        </div>
                    )}

                    <Link href={`/${storeSlug}/shop`} className="flex items-center gap-2.5 overflow-hidden">
                        <div className="relative w-[34px] h-[34px] rounded-full overflow-hidden border border-gray-200 shrink-0 bg-gray-50 flex items-center justify-center shadow-sm">
                            {logoUrl ? (
                                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                            ) : (
                                <span className="text-[13px] font-black text-gray-500">{storeName[0]}</span>
                            )}
                        </div>
                        <span className="font-black text-[16px] text-gray-900 tracking-tight truncate">
                            {storeName}
                        </span>
                    </Link>
                </div>

                {/* Right: Search + Cart */}
                <div className="flex items-center gap-2 shrink-0">
                    <Link href={`/${storeSlug}/shop/search`} className="text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors active:scale-95">
                        <Search size={22} />
                    </Link>
                    <Link href={`/${storeSlug}/shop/cart`} className="relative text-gray-700 hover:bg-gray-100 p-2 rounded-full transition-colors active:scale-95">
                        <ShoppingBag size={22} />
                        <CountBadge count={cartCount} />
                    </Link>
                </div>
            </div>

            {/* DESKTOP HEADER */}
            <div className="hidden md:block w-full bg-white/80 backdrop-blur-md border-b border-[#EEEEEE] lg:shadow-[0_2px_8px_rgba(0,0,0,0.06)] relative z-40">
                <div className="flex items-center justify-between h-[80px] lg:h-[72px] max-w-[1400px] mx-auto px-6 lg:px-8 w-full gap-8">
                    {/* Logo + Name */}
                    <Link href={`/${storeSlug}/shop`} className="flex items-center gap-3 shrink-0 group">
                        <div className="relative w-12 h-12 lg:w-[40px] lg:h-[40px] rounded-full overflow-hidden shadow-sm bg-gray-50 flex items-center justify-center border border-gray-200 group-hover:border-primary transition-colors">
                            {logoUrl ? (
                                <Image src={logoUrl} alt={storeName} fill className="object-cover" />
                            ) : (
                                <span className="text-[18px] lg:text-[16px] font-bold text-gray-400 group-hover:text-primary transition-colors">{storeName[0]}</span>
                            )}
                        </div>
                        <span className="font-black text-[22px] lg:text-[18px] lg:font-semibold text-gray-900 tracking-tight">{storeName}</span>
                    </Link>

                    {/* Desktop Search Bar */}
                    <div className="flex-1 max-w-[600px] lg:max-w-[500px] mx-auto hidden md:block">
                        <div className="relative group flex items-center">
                            <input
                                type="text"
                                placeholder="Search products..."
                                className="w-full h-[52px] lg:h-[44px] bg-slate-100 border-none rounded-full pl-6 pr-[52px] text-[15px] lg:text-[14px] font-medium text-gray-900 placeholder:text-gray-500 outline-none transition-all focus:bg-white focus:ring-2 focus:ring-primary/20 hover:bg-slate-200/70"
                            />
                            <div className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 lg:w-9 lg:h-9 bg-primary text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-primary/90 transition-colors">
                                <Search size={18} strokeWidth={2.5} />
                            </div>
                        </div>
                    </div>

                    {/* Desktop Actions */}
                    <div className="flex items-center gap-2 lg:gap-4 shrink-0">
                        <Link href={`/${storeSlug}/shop/wishlist`} className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-full hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary group relative">
                            <Heart size={22} strokeWidth={2} />
                            {/* Wishlist count could be added here if available in props later */}
                        </Link>

                        <Link href={`/${storeSlug}/shop/profile`} className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-full hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary">
                            <User size={22} strokeWidth={2} />
                        </Link>

                        <Link href={`/${storeSlug}/shop/cart`} className="flex flex-col items-center justify-center w-[44px] h-[44px] rounded-full hover:bg-gray-50 transition-colors text-gray-600 hover:text-primary relative group">
                            <ShoppingBag size={22} strokeWidth={2} />
                            {cartCount > 0 && (
                                <span className="absolute top-0 right-0 bg-primary leading-none text-white text-[10px] font-bold w-[18px] h-[18px] rounded-full flex items-center justify-center border-2 border-white shadow-sm">
                                    {cartCount > 9 ? '9+' : cartCount}
                                </span>
                            )}
                        </Link>
                    </div>
                </div>
            </div>

            {/* DESKTOP CATEGORY NAV (Secondary Header) */}
            <div className="hidden md:block w-full bg-white lg:bg-[#FAFAFA] border-b border-[#EEEEEE] relative z-30 shadow-[0_1px_4px_rgba(0,0,0,0.02)]">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex items-center gap-6 lg:gap-8 h-[52px] lg:h-[48px] overflow-x-auto hide-scrollbar">
                        <Link
                            href={`/${storeSlug}/shop/search`}
                            className="text-[14px] font-bold text-gray-900 hover:text-primary transition-colors whitespace-nowrap shrink-0 py-3 border-b-2 border-transparent hover:border-primary capitalize tracking-normal"
                        >
                            All Categories
                        </Link>

                        {categories.slice(0, 6).map((cat: any) => (
                            <Link
                                key={cat.id}
                                href={`/${storeSlug}/shop/category/${cat.id}`}
                                className="text-[14px] font-medium text-gray-600 hover:text-primary whitespace-nowrap shrink-0 py-3 border-b-[2.5px] border-transparent transition-colors hover:border-primary capitalize"
                            >
                                {cat.name}
                            </Link>
                        ))}

                        {categories.length > 6 && (
                            <div className="relative group py-3 cursor-pointer">
                                <span className="text-[14px] font-medium text-gray-600 group-hover:text-primary flex items-center gap-1 transition-colors">
                                    More
                                    <svg width="10" height="6" viewBox="0 0 10 6" fill="none" xmlns="http://www.w3.org/2000/svg" className="group-hover:text-primary text-gray-400">
                                        <path d="M1 1L5 5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                </span>
                                <div className="absolute top-full left-0 w-48 bg-white border border-gray-100 shadow-lg rounded-lg py-2 hidden group-hover:block transition-all opacity-0 group-hover:opacity-100">
                                    {categories.slice(6).map((cat: any) => (
                                        <Link
                                            key={cat.id}
                                            href={`/${storeSlug}/shop/category/${cat.id}`}
                                            className="block px-4 py-2 text-[14px] text-gray-600 hover:bg-gray-50 hover:text-primary transition-colors"
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
