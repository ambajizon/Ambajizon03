'use client'

import { useState, useEffect } from 'react'
import { getWishlist, removeFromWishlist } from '@/app/actions/wishlist'
import { getStoreBySlug } from '@/app/actions/storefront'
import ProductCard from '@/components/storefront/ProductCard'
import Link from 'next/link'
import { ArrowLeft, HeartOff } from 'lucide-react'

export default function WishlistPage({ params }: { params: { store: string } }) {
    const [products, setProducts] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [storeId, setStoreId] = useState('')

    useEffect(() => {
        loadWithStore()
    }, [])

    async function loadWithStore() {
        const store = await getStoreBySlug(params.store)
        if (!store) return
        setStoreId(store.id)

        await load(store.id)
    }

    async function load(sId: string) {
        setLoading(true)
        const items = await getWishlist(sId)
        setProducts(items)
        setLoading(false)
    }

    async function handleRemove(pId: string) {
        await removeFromWishlist(storeId, pId)
        load(storeId)
    }

    if (loading) return (
        <div className="p-4 md:p-8 min-h-screen">
            <div className="animate-pulse space-y-4">
                <div className="h-8 bg-gray-200 w-1/4 rounded"></div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-gray-200 rounded-xl"></div>)}
                </div>
            </div>
        </div>
    )

    return (
        <div className="p-4 md:p-8 min-h-screen max-w-7xl mx-auto">
            <div className="flex items-center gap-4 mb-8">
                <Link href={`/${params.store}/shop`} className="p-2 bg-white rounded-full shadow-sm hover:shadow-md transition">
                    <ArrowLeft size={20} />
                </Link>
                <h1 className="text-2xl font-bold text-gray-900">My Wishlist</h1>
                <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-bold">{products.length} Items</span>
            </div>

            {products.length === 0 ? (
                <div className="text-center py-20 flex flex-col items-center">
                    <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <HeartOff size={32} />
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-2">Your wishlist is empty</h2>
                    <p className="text-gray-500 mb-6">Save items you love to buy later.</p>
                    <Link href={`/${params.store}/shop`} className="bg-black text-white px-6 py-3 rounded-xl font-bold hover:opacity-80 transition">
                        Start Shopping
                    </Link>
                </div>
            ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {products.map(p => (
                        <div key={p.id} className="relative group">
                            <ProductCard product={p} storeSlug={params.store} />
                            <button
                                onClick={(e) => {
                                    e.preventDefault()
                                    handleRemove(p.id)
                                }}
                                className="absolute top-2 right-2 p-2 bg-white/90 text-red-500 rounded-full shadow-sm z-10 hover:bg-red-50"
                            >
                                <HeartOff size={16} />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
