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
        e.preventDefault() // Prevent link navigation if inside a link
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
                setTimeout(() => setAdded(false), 2000)
                router.refresh() // Update cart count in header if we had one
            }
        }
    }

    if (large) {
        return (
            <button
                onClick={handleAdd}
                disabled={loading || stock <= 0}
                className={`flex-1 btn-press font-bold py-3 rounded-xl transition flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed text-sm md:text-base ${buyNow
                    ? 'bg-primary border border-primary text-white hover:bg-primary/90 shadow-sm'
                    : 'bg-white border-2 border-primary text-primary hover:bg-blue-50'
                    } ${added && !buyNow ? 'bg-green-50 border-green-500 text-green-700 scale-105' : ''}`}
            >
                {loading ? <Loader2 className="animate-spin" size={20} /> : added && !buyNow ? <Check size={20} /> : <ShoppingCart size={20} />}
                {buyNow ? 'Buy Now' : added ? 'Added' : 'Add to Cart'}
            </button>
        )
    }

    if (cardView) {
        return (
            <button
                onClick={handleAdd}
                disabled={loading || stock <= 0}
                className={`w-full py-2.5 rounded-xl text-[14px] font-bold transition flex items-center justify-center gap-1.5 btn-press shadow-sm
                    ${added ? 'bg-green-500 text-white hover:bg-green-600 border border-green-600' : 'bg-primary text-white hover:bg-primary/90 border border-transparent'}
                `}
            >
                {loading ? <Loader2 className="animate-spin" size={18} /> : added ? <Check size={18} /> : <ShoppingCart size={18} />}
                {added ? 'Added to Cart' : 'Add to Cart'}
            </button>
        )
    }

    return (
        <button
            onClick={handleAdd}
            disabled={loading || stock <= 0}
            className={`w-full mt-2 py-1.5 rounded-md text-sm font-medium transition flex items-center justify-center gap-1 btn-press
                ${added ? 'bg-green-100 text-green-700 scale-105' : 'bg-primary/10 text-primary hover:bg-primary hover:text-white'}
            `}
        >
            {loading ? <Loader2 className="animate-spin" size={16} /> : added ? <Check size={16} /> : <ShoppingCart size={16} />}
            {added ? 'Added' : 'Add'}
        </button>
    )
}
