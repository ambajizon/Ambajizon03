'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart, Star } from 'lucide-react'
import { type Product } from '@/app/actions/products'
import AddToCartButton from '@/components/storefront/AddToCartButton'
import WishlistButton from '@/components/storefront/WishlistButton'

interface ProductCardProps {
    product: Product
    storeSlug: string
    index?: number
}

function isNewProduct(createdAt: string | undefined): boolean {
    if (!createdAt) return false
    const diff = Date.now() - new Date(createdAt).getTime()
    return diff < 7 * 24 * 60 * 60 * 1000
}

export default function ProductCard({ product, storeSlug, index = 0 }: ProductCardProps) {
    const discount = product.mrp && product.mrp > product.price
        ? Math.round(((product.mrp - product.price) / product.mrp) * 100)
        : 0

    const showNewBadge = !discount && isNewProduct((product as any).created_at)

    // Stable synthetic rating/review count seeded from product ID
    const stringSum = (product.id || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)
    const rating = (4.2 + (stringSum % 8) / 10).toFixed(1)
    const reviews = 24 + (stringSum % 120)

    const animDelay = Math.min(index * 50, 400)

    return (
        <div
            className="group relative bg-white rounded-[14px] overflow-hidden flex flex-col h-full border border-rt-border transition-all duration-200 ease-out hover:-translate-y-1 hover:shadow-rt-card-hover"
            style={{ animationDelay: `${animDelay}ms` }}
        >
            {/* ── Image ──────────────────────────────────────────────── */}
            <div className="relative bg-rt-surface overflow-hidden shrink-0" style={{ aspectRatio: '220/200' }}>

                {/* Discount badge */}
                {discount > 0 && (
                    <div className="absolute top-2.5 left-2.5 z-20">
                        <span className="bg-[#FEE2E2] text-rt-sale text-[11px] font-bold px-2.5 py-1 rounded-full">
                            {discount}% OFF
                        </span>
                    </div>
                )}
                {showNewBadge && (
                    <div className="absolute top-2.5 left-2.5 z-20">
                        <span className="bg-blue-100 text-rt-accent text-[11px] font-bold px-2.5 py-1 rounded-full">
                            NEW
                        </span>
                    </div>
                )}

                {/* Wishlist */}
                <div className="absolute top-2.5 right-2.5 z-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm">
                        <WishlistButton storeId={product.store_id} productId={product.id} />
                    </div>
                </div>

                {/* Product image */}
                <Link href={`/${storeSlug}/shop/product/${product.id}`} className="block w-full h-full relative p-4 bg-rt-surface">
                    {product.images && product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-contain transition-transform duration-300 group-hover:scale-105"
                            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-rt-surface">
                            <ShoppingCart size={32} className="text-gray-300" />
                        </div>
                    )}
                </Link>

                {/* Slide-up Add to Cart on hover */}
                <div className="absolute bottom-0 left-0 right-0 translate-y-full group-hover:translate-y-0 transition-transform duration-200 ease-out z-20">
                    <AddToCartButton
                        storeSlug={storeSlug}
                        storeId={product.store_id}
                        productId={product.id}
                        stock={product.stock}
                        cardView={true}
                    />
                </div>
            </div>

            {/* ── Card body ──────────────────────────────────────────── */}
            <div className="p-3.5 flex flex-col flex-1">
                {/* Product name */}
                <Link href={`/${storeSlug}/shop/product/${product.id}`} className="block mb-1.5">
                    <h3 className="text-[14px] font-semibold text-rt-text leading-snug line-clamp-2">
                        {product.name}
                    </h3>
                </Link>

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-2.5">
                    <div className="flex items-center text-amber-400">
                        {[1, 2, 3, 4, 5].map(s => (
                            <Star
                                key={s}
                                size={11}
                                fill={s <= 4 ? 'currentColor' : 'none'}
                                strokeWidth={2}
                            />
                        ))}
                    </div>
                    <span className="text-[12px] text-rt-muted">({reviews})</span>
                </div>

                {/* Price row */}
                <div className="flex items-center gap-2 mt-auto">
                    <span className="text-[18px] font-bold text-rt-text leading-none">
                        ₹{product.price.toLocaleString()}
                    </span>
                    {product.mrp && product.mrp > product.price && (
                        <span className="text-[13px] text-gray-400 line-through font-normal leading-none">
                            ₹{product.mrp.toLocaleString()}
                        </span>
                    )}
                </div>

                {/* Mobile-only Add to Cart (no hover on touch) */}
                <div className="md:hidden mt-2.5">
                    <AddToCartButton
                        storeSlug={storeSlug}
                        storeId={product.store_id}
                        productId={product.id}
                        stock={product.stock}
                        cardView={true}
                    />
                </div>
            </div>
        </div>
    )
}
