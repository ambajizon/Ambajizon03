'use client'

import Image from 'next/image'
import Link from 'next/link'
import { type Product } from '@/app/actions/products'
import AddToCartButton from '@/components/storefront/AddToCartButton'
import WishlistButton from '@/components/storefront/WishlistButton'
import { Badge } from '@/components/ui/Badge'

interface ProductCardProps {
    product: Product
    storeSlug: string
}

const BADGE_COLORS: Record<string, 'primary' | 'success' | 'warning' | 'error' | 'neutral'> = {
    new: 'primary',
    hot: 'error',
    sale: 'warning',
    limited: 'error',
    bestseller: 'success',
    trending: 'warning',
    none: 'neutral'
}

export default function ProductCard({ product, storeSlug }: ProductCardProps) {
    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
    const badgeKey = product.badge?.toLowerCase() || 'none'
    const badgeType = BADGE_COLORS[badgeKey] || 'primary'

    return (
        <div className="bg-white rounded-xl overflow-hidden flex flex-col h-full group transition-all duration-300 shadow-sm hover:shadow-lg relative border border-transparent hover:border-gray-200">
            {/* Image Container */}
            <div className="relative aspect-square bg-slate-50 overflow-hidden shrink-0 group">
                {/* Discount Badge */}
                {discount > 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <span className="bg-error text-white text-[11px] font-bold px-2 py-0.5 rounded-sm shadow-sm">
                            -{discount}%
                        </span>
                    </div>
                )}
                {/* Custom Badge override */}
                {badgeKey !== 'none' && discount === 0 && (
                    <div className="absolute top-3 left-3 z-10">
                        <Badge variant={badgeType} size="sm" className="shadow-sm uppercase tracking-wider text-[10px]">
                            {product.badge}
                        </Badge>
                    </div>
                )}

                {/* Wishlist Button */}
                <div className="absolute top-3 right-3 z-20">
                    <div className="bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:bg-white transition-colors">
                        <WishlistButton storeId={product.store_id} productId={product.id} />
                    </div>
                </div>

                <Link href={`/${storeSlug}/shop/product/${product.id}`} className="block w-full h-full relative">
                    {product.images && product.images[0] ? (
                        <Image
                            src={product.images[0]}
                            alt={product.name}
                            fill
                            className="object-cover transition-transform duration-500 group-hover:scale-110"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs font-medium">No Image</div>
                    )}
                </Link>

                {/* Slide-Up CTA */}
                <div className="absolute bottom-0 left-0 right-0 w-full translate-y-full group-hover:translate-y-0 transition-transform duration-300 z-20 bg-white/95 backdrop-blur-sm px-4 py-3 border-t border-gray-100 shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
                    <AddToCartButton
                        storeSlug={storeSlug}
                        storeId={product.store_id}
                        productId={product.id}
                        stock={product.stock}
                        cardView={true}
                    />
                </div>
            </div>

            {/* Content Container */}
            <div className="p-4 lg:p-5 flex flex-col flex-1 relative bg-white z-10 transition-transform duration-300">
                <Link href={`/${storeSlug}/shop/product/${product.id}`} className="block mb-2 flex-1">
                    <h3 className="text-[14px] lg:text-[15px] font-bold text-gray-900 line-clamp-2 leading-tight">
                        {product.name}
                    </h3>
                    {product.description && (
                        <p className="text-[12px] text-gray-500 mt-1 line-clamp-1">{product.description}</p>
                    )}
                </Link>

                <div className="space-y-2 mt-auto">
                    {/* Price Row */}
                    <div className="flex flex-wrap items-end gap-2 shrink-0 pt-2 mt-1">
                        <span className="text-lg xl:text-[19px] font-bold text-primary leading-none">₹{product.price.toLocaleString()}</span>
                        {product.mrp && product.mrp > product.price && (
                            <span className="text-[13px] font-medium text-slate-400 line-through leading-none mb-0.5">₹{product.mrp.toLocaleString()}</span>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
