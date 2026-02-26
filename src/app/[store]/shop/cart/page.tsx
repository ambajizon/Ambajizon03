'use client'

import { useEffect, useState } from 'react'
import { getCart, updateCartItemQty, removeFromCart } from '@/app/actions/cart'
import { getStoreBySlug } from '@/app/actions/storefront'
import StoreHeader from '@/components/storefront/StoreHeader'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SwipeToDeleteItem from '@/components/storefront/SwipeToDeleteItem'
import { Button } from '@/components/ui/Button'

export default function CartPage({ params }: { params: { store: string } }) {
    const [cart, setCart] = useState<any>(null)
    const [store, setStore] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const router = useRouter()

    useEffect(() => {
        async function loadData() {
            setLoading(true)
            const storeData = await getStoreBySlug(params.store)
            setStore(storeData)

            if (storeData) {
                const cartData = await getCart(storeData.id)
                if (cartData === null) {
                    router.push(`/${params.store}/auth?redirect=/${params.store}/shop/cart`)
                    return
                }
                setCart(cartData)
            }
            setLoading(false)
        }
        loadData()
    }, [params.store, router])

    const handleQtyChange = async (itemId: string, newQty: number) => {
        await updateCartItemQty(itemId, newQty, params.store)
        const updatedCart = await getCart(store.id)
        setCart(updatedCart)
    }

    const handleRemove = async (itemId: string) => {
        await removeFromCart(itemId, params.store)
        const updatedCart = await getCart(store.id)
        setCart(updatedCart)
    }

    if (loading) {
        return <div className="min-h-screen bg-gray-50 flex items-center justify-center font-medium text-gray-400">Loading your cart...</div>
    }

    if (!store) return <div className="min-h-screen flex items-center justify-center font-bold text-gray-500">Store not found</div>

    const subtotal = cart?.cart_items?.reduce((acc: number, item: any) => {
        return acc + (item.products.price * item.quantity)
    }, 0) || 0

    return (
        <div className="bg-gray-50 min-h-screen pb-48">
            {/* Desktop Header */}
            <div className="hidden md:block">
                <StoreHeader storeId={store.id} storeName={store.name} storeSlug={store.slug} logoUrl={store.logo_url} showBack={true} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 h-14 flex items-center">
                <Link href={`/${store.slug}/shop`} className="p-1.5 -ml-1 text-gray-700 hover:bg-gray-100 rounded-full transition active:scale-95">
                    <ArrowLeft size={22} />
                </Link>
                <span className="font-bold text-[17px] text-gray-900 ml-2">My Cart</span>
            </div>

            <main className="p-4 md:p-6 max-w-2xl lg:max-w-[1200px] mx-auto w-full lg:px-8">
                <div className="hidden md:flex items-center justify-between mb-6">
                    <h1 className="text-2xl font-black text-gray-900">Shopping Cart</h1>
                    <span className="bg-primary/10 text-primary font-bold px-3 py-1 rounded-full text-sm">
                        {cart?.cart_items?.length || 0} Items
                    </span>
                </div>

                {cart?.cart_items?.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Left Column: Cart Items */}
                        <div className="flex-1 space-y-4 lg:space-y-6">
                            <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden divide-y divide-gray-100">
                                {cart.cart_items.map((item: any) => (
                                    <SwipeToDeleteItem key={item.id} onDelete={() => handleRemove(item.id)}>
                                        <div className="p-4 md:p-6 flex gap-4 md:gap-6 bg-white items-center hover:bg-gray-50/50 transition-colors">
                                            <Link href={`/${store.slug}/shop/product/${item.products.id}`} className="block h-24 w-24 md:h-28 md:w-28 relative bg-gray-50 rounded-2xl overflow-hidden flex-shrink-0 border border-gray-100 group">
                                                {item.products.images && item.products.images[0] ? (
                                                    <Image src={item.products.images[0]} alt={item.products.name} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ShoppingBag size={24} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 flex flex-col justify-center min-w-0 py-1">
                                                <Link href={`/${store.slug}/shop/product/${item.products.id}`}>
                                                    <h3 className="font-bold text-gray-900 text-[15px] md:text-[17px] line-clamp-2 leading-tight pr-6 mb-1.5 md:mb-2 hover:text-primary transition-colors">{item.products.name}</h3>
                                                </Link>
                                                <p className="font-black text-gray-900 text-[16px] md:text-[18px] leading-none mb-3 md:mb-4">₹{item.products.price.toLocaleString()}</p>

                                                <div className="flex items-center justify-between mt-auto">
                                                    <div className="flex items-center gap-4 bg-gray-50 rounded-full px-1.5 py-1 border border-gray-200 shadow-inner w-max">
                                                        <button
                                                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-700 hover:text-gray-900 hover:shadow-md active:scale-90 transition-all border border-gray-100"
                                                        >
                                                            <Minus size={16} strokeWidth={2.5} />
                                                        </button>
                                                        <span className="text-[14px] md:text-[15px] font-bold w-5 md:w-6 text-center">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 md:w-9 md:h-9 flex items-center justify-center bg-white rounded-full shadow-sm text-gray-700 hover:text-gray-900 hover:shadow-md active:scale-90 transition-all border border-gray-100"
                                                        >
                                                            <Plus size={16} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                    {/* Fallback delete for Desktop */}
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="hidden md:flex text-gray-400 p-2.5 hover:bg-red-50 hover:text-error rounded-full transition-colors"
                                                    >
                                                        <Trash2 size={20} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SwipeToDeleteItem>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Checkout Summary (Sticky on Desktop) */}
                        <div className="lg:w-[380px] xl:w-[420px] shrink-0">
                            <div className="lg:sticky lg:top-24 space-y-4 lg:space-y-6">
                                {/* Bill Details Summary Card */}
                                <div className="bg-white rounded-[24px] shadow-sm border border-gray-100 p-6">
                                    <h3 className="font-black text-[17px] text-gray-900 mb-5 border-b border-gray-100 pb-3">Order Summary</h3>
                                    <div className="space-y-4 text-[14px]">
                                        <div className="flex justify-between text-gray-600 font-medium">
                                            <span>Item Total ({cart.cart_items.length} items)</span>
                                            <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-gray-600 font-medium">
                                            <span>Delivery Fee</span>
                                            <span className="text-success font-bold flex items-center gap-1">
                                                FREE
                                            </span>
                                        </div>

                                        <div className="w-full h-px bg-gray-100 my-2" />

                                        <div className="flex justify-between items-end pt-2">
                                            <div>
                                                <span className="block text-gray-900 font-black text-[18px]">Total Amount</span>
                                                <span className="block text-xs text-gray-500 font-medium mt-0.5">Including all taxes</span>
                                            </div>
                                            <span className="text-gray-900 font-black text-[22px]">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Checkout Button */}
                                <div className="hidden lg:block">
                                    <Link href={`/${params.store}/shop/checkout`} className="block w-full">
                                        <Button fullWidth variant="primary" size="lg" className="h-14 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)] rounded-2xl">
                                            Proceed to Checkout <ArrowRight size={20} className="ml-2" />
                                        </Button>
                                    </Link>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 font-medium bg-gray-50/50 py-3 rounded-xl border border-gray-100">
                                        <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                        Safe and Secure Checkout
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sticky Bottom Actions */}
                        <div className="lg:hidden fixed bottom-[64px] md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] pb-safe md:max-w-2xl md:mx-auto md:relative md:rounded-2xl md:shadow-sm md:border md:mt-6 md:bg-white">
                            <div className="flex justify-between items-end mb-3 px-1">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-success uppercase tracking-wider mb-0.5 mt-0.5">Free Delivery</span>
                                    <span className="text-2xl font-black text-gray-900 leading-none tracking-tight">₹{subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <Link href={`/${params.store}/shop/checkout`} className="block w-full">
                                <Button fullWidth variant="primary" size="lg" className="h-14 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                                    Proceed to Checkout <ArrowRight size={18} className="ml-1" />
                                </Button>
                            </Link>
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 bg-white rounded-[24px] border border-gray-100 shadow-sm mt-4">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-5 text-gray-300">
                            <ShoppingBag size={40} className="stroke-[1.5px]" />
                        </div>
                        <h2 className="text-[18px] font-bold text-gray-900 mb-2">Your cart is empty</h2>
                        <p className="text-[13px] text-gray-500 mb-8 max-w-[250px] mx-auto leading-relaxed">
                            Looks like you haven't added anything yet. Discover our latest products!
                        </p>
                        <Link href={`/${params.store}/shop`} className="inline-block">
                            <Button variant="primary" size="md">
                                Start Shopping
                            </Button>
                        </Link>
                    </div>
                )}
            </main>
        </div>
    )
}
