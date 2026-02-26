'use client'

import { useState, useEffect } from 'react'
import { Plus, Package, Tag, ArrowUpRight } from 'lucide-react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function QuickAddFab() {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    // Lock body scroll when menu is open
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = 'hidden'
        } else {
            document.body.style.overflow = ''
        }
        return () => { document.body.style.overflow = '' }
    }, [isOpen])

    // Don't show on setup screens or auth
    if (pathname.includes('/setup') || pathname.includes('/auth') || pathname.includes('/admin')) return null

    return (
        <div className="fixed bottom-[88px] lg:bottom-12 right-4 lg:right-8 z-50 flex flex-col items-end gap-3">
            {/* Backdrop */}
            {isOpen && (
                <div
                    className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[-1] animate-in fade-in duration-200"
                    onClick={() => setIsOpen(false)}
                />
            )}

            {isOpen && (
                <div className="flex flex-col items-end gap-3 mb-2 animate-in slide-in-from-bottom-8 fade-in duration-300">
                    <Link
                        href="/dashboard/products/create"
                        className="flex items-center gap-3 bg-white pl-5 pr-2 py-2 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100 text-[15px] font-bold text-gray-800 hover:text-primary transition hover:shadow-xl active:scale-95 group"
                        onClick={() => setIsOpen(false)}
                    >
                        <span>Add Product</span>
                        <div className="bg-primary/10 text-primary w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-primary group-hover:text-white">
                            <Package size={20} strokeWidth={2.5} />
                        </div>
                    </Link>
                    <Link
                        href="/dashboard/marketing/offers"
                        className="flex items-center gap-3 bg-white pl-5 pr-2 py-2 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100 text-[15px] font-bold text-gray-800 hover:text-orange-600 transition hover:shadow-xl active:scale-95 group"
                        onClick={() => setIsOpen(false)}
                    >
                        <span>Create Offer</span>
                        <div className="bg-orange-50 text-orange-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-orange-600 group-hover:text-white">
                            <Tag size={20} strokeWidth={2.5} />
                        </div>
                    </Link>
                    <Link
                        href="/dashboard/storefront"
                        className="flex items-center gap-3 bg-white pl-5 pr-2 py-2 rounded-full shadow-[0_8px_20px_rgba(0,0,0,0.08)] border border-gray-100 text-[15px] font-bold text-gray-800 hover:text-green-600 transition hover:shadow-xl active:scale-95 group"
                        onClick={() => setIsOpen(false)}
                    >
                        <span>Edit Store</span>
                        <div className="bg-green-50 text-green-600 w-10 h-10 rounded-full flex items-center justify-center transition-colors group-hover:bg-green-600 group-hover:text-white">
                            <ArrowUpRight size={20} strokeWidth={2.5} />
                        </div>
                    </Link>
                </div>
            )}

            <button
                onClick={() => setIsOpen(!isOpen)}
                className={`w-14 h-14 rounded-full flex items-center justify-center text-white shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:scale-105 active:scale-95 ${isOpen ? 'bg-gray-900 rotate-45 shadow-[0_8px_30px_rgba(0,0,0,0.2)]' : 'bg-primary'
                    }`}
            >
                <Plus size={28} strokeWidth={2.5} />
            </button>
        </div>
    )
}
