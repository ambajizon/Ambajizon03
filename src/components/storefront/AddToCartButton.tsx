'use client'

import { useState } from 'react'
import { addToCart } from '@/app/actions/cart'
import { ShoppingCart, Loader2, Check } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

interface AddToCartButtonProps {
    storeSlug: string
    storeId: string
    productId: string
    stock: number
    large?: boolean
    buyNow?: boolean
    cardView?: boolean
}

export default function AddToCartButton({ storeSlug, storeId, productId, stock, large = false, buyNow = false, cardView = false }: AddToCartButtonProps) {
    const [loading, setLoading] = useState(false)
    const [added, setAdded] = useState(false)
    const router = useRouter()

    const handleAdd = async (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()

        if (stock <= 0) return

        setLoading(true)
        const result = await addToCart(storeId, productId, 1)
        setLoading(false)

        if (result?.error) {
            if (result.error.includes('login')) {
                router.push(`/${storeSlug}/auth?redirect=/${storeSlug}/shop/product/${productId}`)
            } else {
                toast.error(result.error)
            }
        } else {
            if (buyNow) {
                router.push(`/${storeSlug}/shop/checkout`)
            } else {
                setAdded(true)
                setTimeout(() => setAdded(false), 1800)
                router.refresh()
            }
        }
    }

    if (large) {
        return (
            <button
                onClick={handleAdd}
                disabled={loading || stock <= 0}
                className={`flex-1 h-full font-bold px-6 rounded-[10px] transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-[15px] active:scale-95
                    ${buyNow
                        ? 'bg-rt-dark text-white hover:bg-rt-text/90'
                        : added
                            ? 'bg-emerald-500 text-white'
                            : 'bg-rt-primary text-white hover:bg-rt-primary-dark'
                    }`}
                style={{ height: buyNow ? '48px' : '52px' }}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : added && !buyNow ? <Check size={20} strokeWidth={3} /> : <ShoppingCart size={20} strokeWidth={2.5} />}
                {buyNow ? 'Buy Now' : added ? '✓ Added!' : 'Add to Cart'}
            </button>
        )
    }

    if (cardView) {
        return (
            <button
                onClick={handleAdd}
                disabled={loading || stock <= 0}
                className={`w-full py-3 text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95
                    ${added ? 'bg-emerald-500 text-white' : 'bg-rt-primary text-white hover:bg-rt-primary-dark'}
                `}
            >
                {loading ? <Loader2 className="animate-spin" size={16} /> : added ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
                {added ? '✓ Added!' : 'Add to Cart'}
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading || stock <= 0}
            className={`w-full mt-2 py-2.5 rounded-[10px] text-[13px] font-semibold transition-all flex items-center justify-center gap-1.5 active:scale-95
                ${added ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rt-surface text-rt-text border border-rt-border hover:bg-rt-primary hover:text-white hover:border-rt-primary'}
            `}
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : added ? <Check size={16} strokeWidth={3} /> : <ShoppingCart size={16} strokeWidth={2.5} />}
            {added ? '✓ Added' : 'Add'}
        </button>
    )
}
