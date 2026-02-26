'use client'

import { useState, useEffect } from 'react'
import { Heart } from 'lucide-react'
import { addToWishlist, removeFromWishlist } from '@/app/actions/wishlist'
import { createClient } from '@/lib/supabase/client'
import toast from 'react-hot-toast'

export default function WishlistButton({ storeId, productId }: { storeId: string, productId: string }) {
    const [isWishlisted, setIsWishlisted] = useState(false)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function checkWishlist() {
            try {
                const supabase = createClient()
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) { setLoading(false); return }

                // Get customer ID
                const { data: cust } = await supabase
                    .from('customers')
                    .select('id')
                    .eq('auth_user_id', user.id)
                    .eq('store_id', storeId)
                    .single()

                if (!cust) { setLoading(false); return }

                const { data } = await supabase
                    .from('wishlists')
                    .select('id')
                    .eq('customer_id', cust.id)
                    .eq('product_id', productId)
                    .single()

                if (data) setIsWishlisted(true)
            } catch (err) {
                // Ignore
            } finally {
                setLoading(false)
            }
        }
        checkWishlist()
    }, [storeId, productId])

    const toggle = async (e: React.MouseEvent) => {
        e.preventDefault() // prevent navigating to product detail
        e.stopPropagation()

        if (loading) return

        const prev = isWishlisted
        setIsWishlisted(!prev)

        if (!prev) {
            const res = await addToWishlist(storeId, productId)
            if (res.error) {
                toast.error(res.error)
                setIsWishlisted(false)
            } else {
                toast.success('Added to wishlist')
            }
        } else {
            const res = await removeFromWishlist(storeId, productId)
            if (res.error) {
                toast.error(res.error)
                setIsWishlisted(true)
            } else {
                toast.success('Removed from wishlist')
            }
        }
    }

    if (loading) return null

    return (
        <button
            onClick={toggle}
            className="absolute top-2 right-2 z-10 p-2 bg-white/80 backdrop-blur-sm rounded-full shadow-sm hover:scale-110 active:scale-95 transition-all text-gray-500 hover:text-red-500"
        >
            <Heart
                size={18}
                className={isWishlisted ? "fill-red-500 text-red-500" : "fill-transparent"}
            />
        </button>
    )
}
