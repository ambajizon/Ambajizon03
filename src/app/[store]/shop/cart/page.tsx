'use client'

import { useEffect, useState } from 'react'
import { getCart, updateCartItemQty, removeFromCart } from '@/app/actions/cart'
import { getStoreBySlug } from '@/app/actions/storefront'
import StoreHeader from '@/components/storefront/StoreHeader'
import Link from 'next/link'
import Image from 'next/image'
import { Trash2, Plus, Minus, ArrowRight, ArrowLeft, ShoppingBag, ShieldCheck } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SwipeToDeleteItem from '@/components/storefront/SwipeToDeleteItem'

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
        <div className="bg-sf-bg min-h-screen pb-48">
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
                <div className="hidden md:flex items-center justify-between mb-8">
                    <h1 className="text-3xl font-black text-sf-dark font-display tracking-tight">Shopping Cart</h1>
                    <span className="bg-sf-accent/10 text-sf-accent font-bold px-4 py-1.5 rounded-full text-[13px] border border-sf-accent/10">
                        {cart?.cart_items?.length || 0} Items
                    </span>
                </div>

                {cart?.cart_items?.length > 0 ? (
                    <div className="flex flex-col lg:flex-row gap-6 lg:gap-8">
                        {/* Left Column: Cart Items */}
                        <div className="flex-1 space-y-3">
                            <div className="bg-white rounded-2xl border border-rt-border overflow-hidden divide-y divide-rt-border shadow-rt-card">
                                {cart.cart_items.map((item: any) => (
                                    <SwipeToDeleteItem key={item.id} onDelete={() => handleRemove(item.id)}>
                                        <div className="p-4 md:p-5 flex gap-4 bg-white items-center hover:bg-rt-surface/50 transition-colors">
                                            <Link href={`/${store.slug}/shop/product/${item.products.id}`} className="block h-[100px] w-[100px] relative bg-rt-surface rounded-xl overflow-hidden flex-shrink-0 border border-rt-border group">
                                                {item.products.images && item.products.images[0] ? (
                                                    <Image src={item.products.images[0]} alt={item.products.name} fill className="object-contain p-2 group-hover:scale-105 transition-transform duration-500" />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                                        <ShoppingBag size={24} />
                                                    </div>
                                                )}
                                            </Link>
                                            <div className="flex-1 flex flex-col justify-between min-w-0 py-1 h-[100px]">
                                                <Link href={`/${store.slug}/shop/product/${item.products.id}`}>
                                                    <h3 className="font-semibold text-rt-text text-[14px] line-clamp-2 leading-tight hover:text-rt-primary transition-colors">{item.products.name}</h3>
                                                </Link>
                                                <p className="font-bold text-rt-text text-[17px] leading-none tracking-tight">₹{item.products.price.toLocaleString()}</p>

                                                <div className="flex items-center justify-between">
                                                    <div className="flex items-center gap-3 h-10 bg-rt-surface rounded-[10px] px-1.5 border border-rt-border">
                                                        <button
                                                            onClick={() => handleQtyChange(item.id, item.quantity - 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-rt-muted hover:text-rt-text active:scale-90 transition-all border border-rt-border"
                                                        >
                                                            <Minus size={15} strokeWidth={2.5} />
                                                        </button>
                                                        <span className="text-[15px] font-semibold w-6 text-center text-rt-text">{item.quantity}</span>
                                                        <button
                                                            onClick={() => handleQtyChange(item.id, item.quantity + 1)}
                                                            className="w-8 h-8 flex items-center justify-center bg-white rounded-lg shadow-sm text-rt-muted hover:text-rt-text active:scale-90 transition-all border border-rt-border"
                                                        >
                                                            <Plus size={15} strokeWidth={2.5} />
                                                        </button>
                                                    </div>
                                                    <button
                                                        onClick={() => handleRemove(item.id)}
                                                        className="text-rt-sale/40 p-2 hover:bg-rt-sale/5 hover:text-rt-sale rounded-full transition-all active:scale-90"
                                                    >
                                                        <Trash2 size={18} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </SwipeToDeleteItem>
                                ))}
                            </div>
                        </div>

                        {/* Right Column: Checkout Summary (Sticky on Desktop) */}
                        <div className="lg:w-[380px] xl:w-[400px] shrink-0">
                            <div className="lg:sticky lg:top-24 space-y-4">

                                {/* Coupon Code Input */}
                                <div className="bg-white rounded-2xl border border-rt-border p-5 shadow-rt-card">
                                    <h4 className="text-[14px] font-semibold text-rt-text mb-3">Have a coupon?</h4>
                                    <div className="flex gap-2">
                                        <input
                                            type="text"
                                            placeholder="Enter coupon code"
                                            className="flex-1 h-11 px-4 rounded-[10px] border border-rt-border text-[14px] bg-rt-surface focus:outline-none focus:border-rt-primary transition-colors"
                                        />
                                        <button className="px-4 h-11 bg-rt-primary text-white text-[13px] font-semibold rounded-[10px] hover:bg-rt-primary-dark transition-colors active:scale-95">
                                            Apply
                                        </button>
                                    </div>
                                </div>

                                {/* Bill Details Summary Card */}
                                <div className="bg-white rounded-2xl border border-rt-border p-6 shadow-rt-card">
                                    <h3 className="font-bold text-[18px] text-rt-text mb-5 border-b border-rt-border pb-4">Order Summary</h3>
                                    <div className="space-y-4 text-[15px]">
                                        <div className="flex justify-between text-rt-muted">
                                            <span>Subtotal ({cart.cart_items.length} items)</span>
                                            <span className="text-rt-text font-semibold">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-rt-muted">
                                            <span>Delivery</span>
                                            <span className="text-rt-success font-bold">FREE</span>
                                        </div>

                                        <div className="w-full h-px bg-rt-border" />

                                        <div className="flex justify-between items-center bg-rt-surface px-4 py-3 rounded-[10px]">
                                            <span className="text-rt-text font-semibold text-[16px]">Total</span>
                                            <span className="text-rt-text font-bold text-[20px]">₹{subtotal.toLocaleString()}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Desktop Checkout Button */}
                                <div className="hidden lg:block">
                                    <Link href={`/${params.store}/shop/checkout`} className="block w-full">
                                        <button className="w-full h-[52px] bg-rt-primary text-white font-bold rounded-[10px] flex items-center justify-center gap-2 hover:bg-rt-primary-dark transition-all shadow-md active:scale-[0.98] text-[16px]">
                                            Proceed to Checkout <ArrowRight size={20} />
                                        </button>
                                    </Link>
                                    <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-rt-muted font-medium bg-[#F0FDF4] py-3 rounded-[10px] border border-[#BBF7D0]">
                                        <ShieldCheck size={18} className="text-rt-success" />
                                        Secured by 256-bit SSL Encryption
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Mobile Sticky Bottom */}
                        <div className="lg:hidden fixed bottom-[64px] md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-rt-border z-40 shadow-rt-card">
                            <div className="flex justify-between items-center mb-3 px-1">
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-semibold text-rt-success uppercase tracking-[0.1em] mb-0.5">Free Delivery applied</span>
                                    <span className="text-2xl font-bold text-rt-text tracking-tighter">₹{subtotal.toLocaleString()}</span>
                                </div>
                            </div>
                            <Link href={`/${params.store}/shop/checkout`} className="block w-full">
                                <button className="w-full h-[52px] bg-rt-primary text-white font-bold rounded-[10px] flex items-center justify-center gap-2 shadow-md active:scale-[0.98] transition-all text-[16px]">
                                    Proceed to Checkout <ArrowRight size={20} />
                                </button>
                            </Link>
                        </div>
                    </div>
                ) : (
                <div className="text-center py-24 bg-rt-surface rounded-2xl border border-dashed border-rt-border shadow-rt-card mt-6">
                    <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center mx-auto mb-6 text-rt-muted shadow-rt-card border border-rt-border">
                        <ShoppingBag size={40} className="stroke-[1.5px]" />
                    </div>
                    <h2 className="text-2xl font-bold text-rt-text mb-3">Your cart is empty</h2>
                    <p className="text-[14px] text-rt-muted mb-8 max-w-[260px] mx-auto leading-relaxed">
                        Looks like you haven&apos;t added anything yet. Discover our latest collections!
                    </p>
                    <Link href={`/${params.store}/shop`} className="inline-block">
                        <button className="bg-rt-primary text-white font-bold py-3.5 px-10 rounded-[10px] hover:bg-rt-primary-dark transition-all shadow-md active:scale-95">
                            Discover Products
                        </button>
                    </Link>
                </div>
                )}
            </main>
        </div>
    )
}
