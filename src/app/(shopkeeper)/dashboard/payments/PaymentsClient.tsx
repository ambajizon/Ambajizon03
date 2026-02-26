'use client'

import { useState } from 'react'
import { CheckCircle, Clock, Search, IndianRupee, Coins, Receipt, XCircle } from 'lucide-react'
import { markOrderAsPaid } from '@/app/actions/order'
import Link from 'next/link'

type ValidOrder = {
    id: string
    created_at: string
    total_amount: number
    payment_mode: string
    payment_status: string
    status: string
    customers?: {
        full_name: string | null
        email: string | null
        mobile: string | null
    } | null
}

export default function PaymentsClient({
    initialOrders,
    stats
}: {
    initialOrders: ValidOrder[]
    stats: {
        totalExpected: number
        totalCollected: number
        totalPending: number
    }
}) {
    const [orders, setOrders] = useState<ValidOrder[]>(initialOrders)
    const [searchTerm, setSearchTerm] = useState('')
    const [filterStatus, setFilterStatus] = useState('all')
    const [loadingAction, setLoadingAction] = useState<string | null>(null)
    const [toast, setToast] = useState<{ msg: string, type: 'success' | 'error' } | null>(null)

    // Filter Logic
    const filteredOrders = orders.filter(order => {
        const matchesSearch =
            order.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customers?.full_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
            (order.customers?.mobile || '').includes(searchTerm)

        const isCancelled = order.status.toLowerCase() === 'cancelled'

        if (filterStatus === 'all') return matchesSearch && !isCancelled
        if (filterStatus === 'pending') return matchesSearch && order.payment_status === 'pending' && !isCancelled
        if (filterStatus === 'collected') return matchesSearch && order.payment_status === 'paid' && !isCancelled

        return matchesSearch
    })

    const handleMarkAsPaid = async (orderId: string) => {
        if (!confirm('Are you sure you want to mark this payment as collected?')) return

        setLoadingAction(orderId)
        try {
            const res = await markOrderAsPaid(orderId)
            if (res.error) {
                setToast({ msg: res.error, type: 'error' })
            } else {
                setToast({ msg: 'Payment collected successfully!', type: 'success' })
                // Update local list
                setOrders(current => current.map(o => o.id === orderId ? { ...o, payment_status: 'paid' } : o))
            }
        } catch (e: any) {
            setToast({ msg: e.message || 'Error occurred', type: 'error' })
        } finally {
            setLoadingAction(null)
            setTimeout(() => setToast(null), 3000)
        }
    }

    return (
        <div className="space-y-6 max-w-6xl mx-auto pb-20">
            {toast && (
                <div className={`fixed bottom-24 right-6 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-xl text-white text-sm font-medium ${toast.type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
                    {toast.type === 'success' ? <CheckCircle size={18} /> : <XCircle size={18} />}
                    {toast.msg}
                </div>
            )}

            <div>
                <h1 className="text-2xl font-bold text-gray-900">Payments Dashboard</h1>
                <p className="text-gray-500 text-sm mt-1">Track collections, expected revenue, and pending COD payments.</p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full bg-blue-50 flex items-center justify-center shrink-0">
                        <Receipt className="text-blue-600 w-6 h-6" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-500">Total Expected</p>
                        <h3 className="text-2xl font-black text-gray-900">₹{stats.totalExpected.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-green-100 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-green-50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center shrink-0 relative z-10">
                        <IndianRupee className="text-green-600 w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-500">Total Collected</p>
                        <h3 className="text-2xl font-black text-green-700">₹{stats.totalCollected.toLocaleString()}</h3>
                    </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-orange-100 flex items-center gap-4 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-orange-50 rounded-full -mr-16 -mt-16 pointer-events-none"></div>
                    <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center shrink-0 relative z-10">
                        <Coins className="text-orange-600 w-6 h-6" />
                    </div>
                    <div className="relative z-10">
                        <p className="text-sm font-medium text-gray-500">Pending Collection</p>
                        <h3 className="text-2xl font-black text-orange-700">₹{stats.totalPending.toLocaleString()}</h3>
                    </div>
                </div>
            </div>

            {/* Main Data Table Area */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-4 border-b border-gray-100 flex flex-col sm:flex-row gap-4 justify-between bg-gray-50/50">
                    <div className="flex gap-2 bg-gray-100 p-1 rounded-lg self-start">
                        <button
                            onClick={() => setFilterStatus('all')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'all' ? 'bg-white shadow text-gray-900' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            All Active
                        </button>
                        <button
                            onClick={() => setFilterStatus('pending')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'pending' ? 'bg-white shadow text-orange-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Pending
                        </button>
                        <button
                            onClick={() => setFilterStatus('collected')}
                            className={`px-4 py-1.5 rounded-md text-sm font-medium transition-colors ${filterStatus === 'collected' ? 'bg-white shadow text-green-600' : 'text-gray-500 hover:text-gray-700'}`}
                        >
                            Collected
                        </button>
                    </div>

                    <div className="relative max-w-sm w-full">
                        <input
                            type="text"
                            placeholder="Order ID or Customer Name"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        <Search className="absolute left-3 top-2.5 text-gray-400" size={16} />
                    </div>
                </div>

                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/50 text-gray-500 font-medium border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4">Order Details</th>
                                <th className="px-6 py-4">Customer</th>
                                <th className="px-6 py-4">Amount</th>
                                <th className="px-6 py-4">Payment Info</th>
                                <th className="px-6 py-4 text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredOrders.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="px-6 py-12 text-center text-gray-500">
                                        No payments found matching your criteria.
                                    </td>
                                </tr>
                            ) : (
                                filteredOrders.map(order => (
                                    <tr key={order.id} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <Link href={`/dashboard/orders/${order.id}`} className="font-bold text-gray-900 hover:text-blue-600 transition-colors">
                                                #{order.id.slice(0, 8)}
                                            </Link>
                                            <div className="text-xs text-gray-400 mt-1">
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-medium text-gray-900">{order.customers?.full_name || 'Guest'}</div>
                                            <div className="text-xs text-gray-500">{order.customers?.mobile || 'No phone'}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="font-bold text-gray-900">₹{order.total_amount?.toLocaleString()}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1 items-start">
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                                                    ${order.payment_mode === 'cod' ? 'bg-purple-50 text-purple-700 border border-purple-200' : 'bg-blue-50 text-blue-700 border border-blue-200'}`}>
                                                    {order.payment_mode}
                                                </span>
                                                <span className={`px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider
                                                    ${order.payment_status === 'paid' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-orange-50 text-orange-700 border border-orange-200'}`}>
                                                    {order.payment_status}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-right">
                                            {order.payment_mode === 'cod' && order.payment_status === 'pending' ? (
                                                <button
                                                    onClick={() => handleMarkAsPaid(order.id)}
                                                    disabled={loadingAction === order.id}
                                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-green-50 text-green-700 hover:bg-green-100 border border-green-200 font-bold text-xs rounded-lg transition-colors disabled:opacity-50"
                                                >
                                                    {loadingAction === order.id ? (
                                                        <Clock className="w-3.5 h-3.5 animate-spin" />
                                                    ) : (
                                                        <CheckCircle className="w-3.5 h-3.5" />
                                                    )}
                                                    Collect Payment
                                                </button>
                                            ) : order.payment_status === 'paid' ? (
                                                <span className="inline-flex items-center gap-1 text-green-600 font-bold text-xs">
                                                    <CheckCircle className="w-4 h-4" /> Collected
                                                </span>
                                            ) : (
                                                <span className="text-xs text-gray-400 font-medium">Auto (Online)</span>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

        </div>
    )
}
