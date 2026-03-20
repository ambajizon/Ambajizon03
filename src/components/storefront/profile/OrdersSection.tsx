'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { Package, ShoppingBag, ChevronRight } from 'lucide-react'

type OrderStatus = 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
    pending:   { bg: '#FEF3C7', color: '#92400E', label: '⏳ Pending' },
    confirmed: { bg: '#DCFCE7', color: '#15803D', label: '✓ Confirmed' },
    shipped:   { bg: '#DBEAFE', color: '#1D40AF', label: '🚚 Shipped' },
    delivered: { bg: '#DCFCE7', color: '#15803D', label: '✓ Delivered' },
    cancelled: { bg: '#FEE2E2', color: '#DC2626', label: '✕ Cancelled' },
}

const TAB_FILTERS = ['All', 'Active', 'Delivered', 'Cancelled', 'Returns'] as const
type TabFilter = typeof TAB_FILTERS[number]

function filterOrders(orders: any[], tab: TabFilter) {
    if (tab === 'All') return orders
    if (tab === 'Active') return orders.filter(o => ['pending', 'confirmed', 'shipped'].includes(o.status))
    if (tab === 'Delivered') return orders.filter(o => o.status === 'delivered')
    if (tab === 'Cancelled') return orders.filter(o => o.status === 'cancelled')
    return []
}

interface OrdersSectionProps {
    orders: any[]
    storeSlug: string
    preview?: boolean
}

export default function OrdersSection({ orders, storeSlug, preview = false }: OrdersSectionProps) {
    const [activeTab, setActiveTab] = useState<TabFilter>('All')
    const filtered = filterOrders(orders, activeTab)
    const displayOrders = preview ? filtered.slice(0, 3) : filtered

    return (
        <div className="bg-white rounded-2xl border border-rt-border overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
            {/* Header */}
            <div className="flex items-center justify-between px-5 pt-5 pb-0">
                <div className="flex items-center gap-2">
                    <Package size={18} className="text-rt-primary" />
                    <h2 className="text-[17px] font-bold text-rt-text">My Orders</h2>
                </div>
                {preview && orders.length > 3 && (
                    <Link
                        href={`/${storeSlug}/shop/orders`}
                        className="text-[13px] text-rt-primary font-semibold flex items-center gap-1 hover:underline"
                    >
                        View All <ChevronRight size={14} />
                    </Link>
                )}
            </div>

            {/* Filter tabs */}
            {!preview && (
                <div className="flex overflow-x-auto scrollbar-hide border-b border-rt-border px-5 mt-4">
                    {TAB_FILTERS.map(tab => {
                        const count = filterOrders(orders, tab).length
                        const isActive = activeTab === tab
                        return (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`flex items-center gap-1.5 whitespace-nowrap pb-3 mr-6 text-[14px] font-medium border-b-2 transition-all
                                    ${isActive
                                        ? 'border-rt-primary text-rt-primary'
                                        : 'border-transparent text-rt-muted hover:text-rt-text'
                                    }`}
                            >
                                {tab}
                                <span className={`text-[11px] ${isActive ? 'text-rt-primary' : 'text-rt-muted'}`}>({count})</span>
                            </button>
                        )
                    })}
                </div>
            )}

            {/* Order list or empty state */}
            <div className="p-5">
                {displayOrders.length === 0 ? (
                    <EmptyOrders storeSlug={storeSlug} activeTab={activeTab} />
                ) : (
                    <div className="space-y-3">
                        {displayOrders.map((order: any) => (
                            <OrderCard key={order.id} order={order} storeSlug={storeSlug} />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

function EmptyOrders({ storeSlug, activeTab }: { storeSlug: string; activeTab: TabFilter }) {
    const isFiltered = activeTab !== 'All'
    return (
        <div className="flex flex-col items-center py-10 text-center">
            <div className="text-[80px] mb-4 select-none">🛍️</div>
            <h3 className="text-[20px] font-bold text-rt-text mb-2">
                {isFiltered ? `No ${activeTab.toLowerCase()} orders` : 'No orders yet!'}
            </h3>
            <p className="text-[15px] text-rt-muted mb-6 max-w-[260px] leading-relaxed">
                {isFiltered
                    ? `You have no ${activeTab.toLowerCase()} orders at the moment.`
                    : "Looks like you haven't ordered anything yet. Let's change that!"
                }
            </p>
            {!isFiltered && (
                <>
                    <Link
                        href={`/${storeSlug}/shop`}
                        className="inline-flex items-center gap-2 bg-rt-primary text-white font-semibold text-[15px] px-7 py-3 rounded-[10px] hover:bg-rt-primary-dark transition-colors active:scale-95 mb-3"
                    >
                        <ShoppingBag size={18} /> Browse Toys
                    </Link>
                    <Link href={`/${storeSlug}/shop/wishlist`} className="text-[13px] text-rt-accent font-medium hover:underline">
                        View Wishlist →
                    </Link>
                </>
            )}
        </div>
    )
}

function OrderCard({ order, storeSlug }: { order: any; storeSlug: string }) {
    const statusInfo = STATUS_STYLE[order.status] ?? STATUS_STYLE.pending
    const firstItem = order.order_items?.[0]
    const itemCount = order.order_items?.length ?? 0
    const isActive = ['pending', 'confirmed', 'shipped'].includes(order.status)

    return (
        <div className="border border-rt-border rounded-[14px] p-4 hover:border-rt-primary/30 transition-colors">
            <div className="flex gap-3 items-start">
                {/* Thumbnail */}
                <div className="w-[68px] h-[68px] bg-rt-surface rounded-xl border border-rt-border overflow-hidden shrink-0 flex items-center justify-center">
                    {firstItem?.products?.images?.[0] ? (
                        <Image
                            src={firstItem.products.images[0]}
                            alt={firstItem.products?.name || 'Product'}
                            width={68} height={68}
                            className="object-contain p-1"
                        />
                    ) : (
                        <Package size={24} className="text-gray-300" />
                    )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                        <div>
                            <p className="text-[12px] text-rt-muted font-medium">#{order.id.slice(0, 8).toUpperCase()}</p>
                            <p className="text-[15px] font-semibold text-rt-text leading-tight mt-0.5 line-clamp-1">
                                {firstItem?.products?.name || 'Unknown product'}
                                {itemCount > 1 && <span className="text-rt-muted font-normal"> +{itemCount - 1} more</span>}
                            </p>
                            <p className="text-[13px] text-rt-muted mt-0.5">
                                Placed on {new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                            </p>
                        </div>
                        <div>
                            <span
                                className={`inline-block px-2.5 py-1 rounded-full text-[11px] font-semibold ${isActive ? 'animate-pulse' : ''}`}
                                style={{ background: statusInfo.bg, color: statusInfo.color }}
                            >
                                {statusInfo.label}
                            </span>
                        </div>
                    </div>

                    <div className="flex items-center justify-between mt-3 pt-3 border-t border-rt-border/60">
                        <span className="text-[16px] font-bold text-rt-text">₹{order.total_amount?.toLocaleString()}</span>
                        <div className="flex items-center gap-2">
                            {isActive && (
                                <Link
                                    href={`/${storeSlug}/shop/order/success/${order.id}`}
                                    className="text-[12px] font-semibold border border-rt-primary text-rt-primary px-3 py-1.5 rounded-[8px] hover:bg-[#FFF5F0] transition-colors"
                                >
                                    Track Order
                                </Link>
                            )}
                            {firstItem?.product_id && (
                                <Link
                                    href={`/${storeSlug}/shop/product/${firstItem.product_id}`}
                                    className="text-[12px] font-semibold border border-rt-border text-rt-muted px-3 py-1.5 rounded-[8px] hover:bg-rt-surface transition-colors"
                                >
                                    Reorder
                                </Link>
                            )}
                            {order.status === 'delivered' && (
                                <button className="text-[12px] font-semibold border border-amber-400 text-amber-600 px-3 py-1.5 rounded-[8px] hover:bg-amber-50 transition-colors">
                                    ★ Rate
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
