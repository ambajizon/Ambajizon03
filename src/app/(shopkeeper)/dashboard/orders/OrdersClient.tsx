'use client'

import { useState, useCallback } from 'react'
import Link from 'next/link'
import PullToRefresh from '@/components/PullToRefresh'
import { OrderCardSkeleton } from '@/components/Skeletons'
import { useRouter } from 'next/navigation'

const STATUSES = ['All', 'pending', 'confirmed', 'packed', 'shipped', 'delivered', 'cancelled']

const getStatusIcon = (status: string) => {
    switch (status) {
        case 'pending': return <span className="material-symbols-outlined text-[14px] text-yellow-600">schedule</span>
        case 'confirmed': return <span className="material-symbols-outlined text-[14px] text-blue-600">check_circle</span>
        case 'packed': return <span className="material-symbols-outlined text-[14px] text-indigo-600">package</span>
        case 'shipped': return <span className="material-symbols-outlined text-[14px] text-purple-600">local_shipping</span>
        case 'delivered': return <span className="material-symbols-outlined text-[14px] text-success">check_circle</span>
        case 'cancelled': return <span className="material-symbols-outlined text-[14px] text-error">cancel</span>
        default: return null
    }
}

export default function OrdersClient({ initialOrders }: { initialOrders: any[] }) {
    const router = useRouter()
    const [filter, setFilter] = useState('All')
    const [searchQuery, setSearchQuery] = useState('')
    const [isRefreshing, setIsRefreshing] = useState(false)

    const counts = STATUSES.reduce((acc, status) => {
        if (status === 'All') acc[status] = initialOrders.length
        else acc[status] = initialOrders.filter(o => o.status === status).length
        return acc
    }, {} as Record<string, number>)

    const filteredOrders = initialOrders.filter(o => {
        const matchesStatus = filter === 'All' || o.status === filter
        const searchStr = `${o.id} ${o.customers?.full_name} ${o.customers?.mobile}`.toLowerCase()
        const matchesSearch = searchStr.includes(searchQuery.toLowerCase())
        return matchesStatus && matchesSearch
    })

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true)
        router.refresh()
        // Simulate network delay so pull indicator doesn't instantly vanish
        await new Promise(r => setTimeout(r, 800))
        setIsRefreshing(false)
    }, [router])

    return (
        <PullToRefresh onRefresh={handleRefresh} className="space-y-5 pb-24">
            <div className="flex items-center justify-between px-1">
                <h1 className="text-[28px] font-black text-gray-900 tracking-tight">Orders</h1>
            </div>

            {/* Filter Pill Scroller */}
            <div className="flex overflow-x-auto hide-scrollbar gap-2.5 pb-2 -mx-4 px-4 sm:mx-0 sm:px-0">
                {STATUSES.map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`px-4 py-2.5 rounded-full text-[14px] font-bold flex items-center gap-2 whitespace-nowrap transition-all border shrink-0
                            ${filter === status
                                ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                                : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'
                            }`}
                    >
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className={`px-2 py-0.5 rounded-full text-[11px] font-black
                            ${filter === status ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-500'}`}
                        >
                            {counts[status] || 0}
                        </span>
                    </button>
                ))}
            </div>

            {/* Search Bar */}
            <div className="relative mb-2">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">search</span>
                <input
                    placeholder="Search by order ID, name or phone..."
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 h-[52px] bg-white border border-gray-200 rounded-[16px] text-[15px] font-medium focus:ring-4 focus:ring-primary/10 focus:border-primary outline-none transition-all shadow-sm"
                />
            </div>

            {/* Orders List & Table */}
            <div className="pt-2">
                {isRefreshing ? (
                    <div className="space-y-4">
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                        <OrderCardSkeleton />
                    </div>
                ) : filteredOrders && filteredOrders.length > 0 ? (
                    <>
                        {/* Mobile View: Cards */}
                        <div className="space-y-4 lg:hidden">
                            {filteredOrders.map((order: any) => {
                                const borderColors: any = {
                                    delivered: 'border-l-success',
                                    cancelled: 'border-l-error',
                                    pending: 'border-l-yellow-400',
                                    confirmed: 'border-l-blue-500',
                                    packed: 'border-l-indigo-500',
                                    shipped: 'border-l-purple-500'
                                };
                                const bgColors: any = {
                                    delivered: 'bg-success-light/20 text-success border-success/20',
                                    cancelled: 'bg-error-light/20 text-error border-error/20',
                                    pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                    confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                                    packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                                    shipped: 'bg-purple-50 text-purple-700 border-purple-200'
                                }
                                const edgeClass = borderColors[order.status] || 'border-l-gray-300';
                                const badgeClass = bgColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200';

                                return (
                                    <Link
                                        href={`/dashboard/orders/${order.id}`}
                                        key={order.id}
                                        className={`block bg-white border border-gray-100 border-l-[5px] ${edgeClass} rounded-[20px] p-5 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] hover:shadow-md transition-all active:scale-[0.98] relative overflow-hidden group`}
                                    >
                                        <div className="absolute top-1/2 right-4 -translate-y-1/2 text-gray-300 group-hover:text-primary transition-transform group-hover:translate-x-1">
                                            <span className="material-symbols-outlined text-[20px]">chevron_right</span>
                                        </div>

                                        {/* Top Row: ID & Status */}
                                        <div className="flex justify-between items-start mb-4 pr-6 border-b border-gray-50 pb-3">
                                            <div>
                                                <p className="font-mono font-black tracking-wide text-gray-900 text-[15px] mb-0.5">#{order.id.slice(0, 8).toUpperCase()}</p>
                                                <p className="text-[12px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.created_at).toLocaleString()}</p>
                                            </div>
                                            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-[8px] text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                                                {getStatusIcon(order.status)}
                                                {order.status}
                                            </span>
                                        </div>

                                        {/* Customer Info */}
                                        <div className="mb-4 pr-6">
                                            <p className="font-bold text-[16px] text-gray-900 mb-0.5">{order.customers?.full_name || 'Guest Customer'}</p>
                                            <p className="text-[13px] font-medium text-gray-500">{order.customers?.mobile}</p>
                                        </div>

                                        {/* Bottom Row: Payment & Total */}
                                        <div className="flex justify-between items-center pr-6 bg-gray-50/50 -mx-5 px-5 -mb-5 pt-3 pb-3 mt-4 border-t border-gray-100">
                                            <div className="flex items-center gap-2">
                                                <span className={`text-[10px] px-2 py-1 rounded-[6px] uppercase font-black border
                                                ${order.payment_status === 'paid' ? 'bg-success-light/30 text-success border-success/20' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                                                >
                                                    {order.payment_status}
                                                </span>
                                                <span className="text-[13px] font-bold text-gray-600 border-l border-gray-300 pl-2">
                                                    {order.payment_mode === 'cod' ? 'COD' : 'Online'}
                                                </span>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[18px] font-black text-gray-900 tracking-tight">₹{order.total_amount.toLocaleString()}</p>
                                            </div>
                                        </div>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Desktop View: Data Table */}
                        <div className="hidden lg:block bg-white rounded-[24px] shadow-sm border border-gray-100 overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead>
                                    <tr className="bg-gray-50 border-b border-gray-100 text-[12px] text-gray-500 font-bold uppercase tracking-widest">
                                        <th className="p-4 pl-6 font-bold">Order ID</th>
                                        <th className="p-4 font-bold">Date</th>
                                        <th className="p-4 font-bold">Customer</th>
                                        <th className="p-4 font-bold">Status</th>
                                        <th className="p-4 font-bold">Payment</th>
                                        <th className="p-4 text-right pr-6 font-bold">Total</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-gray-100">
                                    {filteredOrders.map((order: any) => {
                                        const bgColors: any = {
                                            delivered: 'bg-success-light/20 text-success border-success/20',
                                            cancelled: 'bg-error-light/20 text-error border-error/20',
                                            pending: 'bg-yellow-50 text-yellow-700 border-yellow-200',
                                            confirmed: 'bg-blue-50 text-blue-700 border-blue-200',
                                            packed: 'bg-indigo-50 text-indigo-700 border-indigo-200',
                                            shipped: 'bg-purple-50 text-purple-700 border-purple-200'
                                        };
                                        const badgeClass = bgColors[order.status] || 'bg-gray-100 text-gray-700 border-gray-200';

                                        return (
                                            <tr key={order.id} className="hover:bg-gray-50 transition-colors group cursor-pointer" onClick={() => router.push(`/dashboard/orders/${order.id}`)}>
                                                <td className="p-4 pl-6 align-middle">
                                                    <span className="font-mono font-black text-gray-900 text-[14px]">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className="text-[13px] font-medium text-gray-600">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    <p className="text-[11px] font-bold text-gray-400 mt-0.5">{new Date(order.created_at).toLocaleTimeString()}</p>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <p className="font-bold text-[14px] text-gray-900">{order.customers?.full_name || 'Guest'}</p>
                                                    <p className="text-[12px] text-gray-500 mt-0.5">{order.customers?.mobile}</p>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-[6px] text-[10px] font-black uppercase tracking-wider border ${badgeClass}`}>
                                                        {getStatusIcon(order.status)}
                                                        {order.status}
                                                    </span>
                                                </td>
                                                <td className="p-4 align-middle">
                                                    <div className="flex flex-col items-start gap-1">
                                                        <span className={`text-[10px] px-2 py-0.5 rounded-[4px] uppercase font-black border whitespace-nowrap
                                                            ${order.payment_status === 'paid' ? 'bg-success-light/30 text-success border-success/20' : 'bg-orange-50 text-orange-700 border-orange-200'}`}
                                                        >
                                                            {order.payment_status}
                                                        </span>
                                                        <span className="text-[11px] font-bold text-gray-500 uppercase tracking-widest pl-1">
                                                            {order.payment_mode === 'cod' ? 'COD' : 'Online'}
                                                        </span>
                                                    </div>
                                                </td>
                                                <td className="p-4 text-right pr-6 align-middle">
                                                    <div className="flex items-center justify-end gap-3">
                                                        <span className="text-[16px] font-black text-gray-900 tracking-tight">₹{order.total_amount.toLocaleString()}</span>
                                                        <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 group-hover:bg-primary group-hover:text-white transition-colors">
                                                            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
                                                        </div>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="p-10 text-center bg-white rounded-[24px] border border-dashed border-gray-200 shadow-sm mt-8">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-100">
                            <span className="material-symbols-outlined text-[24px] text-gray-300">search</span>
                        </div>
                        <p className="text-gray-900 font-bold text-[18px]">No orders found</p>
                        <p className="text-[14px] text-gray-500 mt-1 font-medium">Try a different filter or search term.</p>
                    </div>
                )}
            </div>
        </PullToRefresh>
    )
}
