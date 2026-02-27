'use client'

import { useEffect, useState, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import PullToRefresh from '@/components/PullToRefresh'
import { MetricCardSkeleton } from '@/components/Skeletons'
import { Button } from '@/components/ui/Button'

export default function ShopkeeperDashboard() {
    const [loading, setLoading] = useState(true)
    const [store, setStore] = useState<any>(null)
    const router = useRouter()
    const supabase = createClient()

    async function checkStore() {
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: storeData } = await supabase
            .from('stores')
            .select('*')
            .eq('shopkeeper_id', user.id)
            .single()

        if (!storeData || (storeData.name === 'Rajesh Store (Pending)' || !storeData.slug)) {
            router.push('/dashboard/setup')
            return
        }

        // Fetch basic stats and recent orders
        const [ordersRes, revRes, recentRes, pendingRes] = await Promise.all([
            supabase.from('orders').select('*', { count: 'exact', head: true }).eq('store_id', storeData.id),
            supabase.from('orders').select('total_amount').eq('store_id', storeData.id).in('status', ['confirmed', 'delivered']),
            supabase.from('orders').select('id, created_at, total_amount, status, delivery_address, order_items(id, quantity)').eq('store_id', storeData.id).order('created_at', { ascending: false }).limit(3),
            supabase.from('orders').select('id').eq('store_id', storeData.id).eq('status', 'confirmed')
        ])

        const totalOrders = ordersRes.count || 0;
        const totalRev = revRes.data?.reduce((acc: number, curr: any) => acc + (curr.total_amount || 0), 0) || 0;
        const recentOrders = recentRes.data || [];
        const pendingCount = pendingRes.data?.length || 0;

        setStore({ ...storeData, stats: { totalOrders, totalRev, pendingCount }, recentOrders })
        setLoading(false)
    }

    const handleRefresh = useCallback(async () => {
        setLoading(true)
        await checkStore()
    }, [])

    useEffect(() => {
        checkStore()
    }, [router, supabase])

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="h-8 w-48 bg-gray-200 animate-pulse rounded-lg" />
                <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                    <MetricCardSkeleton />
                </div>
            </div>
        )
    }

    return (
        <PullToRefresh onRefresh={handleRefresh}>
            <div className="space-y-6 max-w-[1400px] mx-auto pb-6 pt-4">

                {/* Setup/Pending Alert Banner */}
                {(!store?.is_setup_completed || store?.stats?.pendingCount > 0) && (
                    <div className="flex flex-col gap-3">
                        {!store?.is_setup_completed && (
                            <div className="bg-orange-50 p-4 rounded-xl border border-orange-200 flex items-center justify-between">
                                <div className="flex items-center gap-3 text-orange-800">
                                    <span className="material-symbols-outlined shrink-0 text-[24px]">schedule</span>
                                    <div>
                                        <h3 className="font-bold text-[15px]">Setup Incomplete</h3>
                                        <p className="text-[13px] opacity-90">14 Days left in free trial. Complete store setup.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/setup">
                                    <Button variant="primary" size="sm" className="h-10 px-4 rounded-lg bg-orange-600 hover:bg-orange-700 shadow-sm text-sm font-bold">
                                        Complete Setup
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {store?.stats?.pendingCount > 0 && (
                            <div className="bg-primary/10 text-primary p-4 rounded-xl border border-primary/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3">
                                    <span className="material-symbols-outlined shrink-0 text-[24px]">error</span>
                                    <div>
                                        <h3 className="font-bold text-[15px]">Action Required</h3>
                                        <p className="text-[13px] font-medium opacity-90">You have {store.stats.pendingCount} new order{store.stats.pendingCount > 1 ? 's' : ''} to process.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/orders" className="shrink-0 w-full md:w-auto">
                                    <Button variant="primary" size="sm" className="w-full h-10 px-6 rounded-lg shadow-[0_4px_14px_0_rgba(17,82,212,0.2)] text-sm font-bold">
                                        View Orders
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
                    {/* Total Orders - Blue */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-blue-600 text-[20px]">local_mall</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-black">+12%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Total Orders</p>
                        <p className="text-xl font-black text-slate-800">{store?.stats?.totalOrders || 0}</p>
                    </div>

                    {/* Revenue - Green */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-green-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-green-600 text-[20px]">payments</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-black">+8%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Revenue</p>
                        <p className="text-xl font-black text-slate-800">₹{(store?.stats?.totalRev || 0).toLocaleString()}</p>
                    </div>

                    {/* Store Views - Purple */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-purple-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-purple-600 text-[20px]">visibility</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-black">+24%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">Store Views</p>
                        <p className="text-xl font-black text-slate-800">{(store?.stats?.totalOrders || 0) * 14 + 120}</p>
                    </div>

                    {/* QR Scans - Orange */}
                    <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-md shadow-slate-200/50 hover:shadow-lg transition-shadow">
                        <div className="flex items-center justify-between mb-3">
                            <div className="w-9 h-9 rounded-xl bg-orange-50 flex items-center justify-center">
                                <span className="material-symbols-outlined text-orange-600 text-[20px]">qr_code_2</span>
                            </div>
                            <span className="bg-green-100 text-green-700 px-1.5 py-0.5 rounded-full text-[10px] font-black">+5%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-0.5">QR Scans</p>
                        <p className="text-xl font-black text-slate-800">{(store?.stats?.totalOrders || 0) * 8 + 45}</p>
                    </div>
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 lg:pb-0">

                    {/* Recent Orders List */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-[15px] font-black text-slate-800 tracking-tight">Recent Orders</h2>
                            <Link href="/dashboard/orders" className="text-[12px] font-bold text-primary hover:text-blue-700 flex items-center gap-1 group">
                                View All <span className="material-symbols-outlined text-[14px] group-hover:translate-x-1 transition-transform">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="bg-white border border-slate-100 rounded-2xl overflow-x-auto shadow-md shadow-slate-200/50">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500">
                                    <tr>
                                        <th className="px-4 py-2.5 font-medium uppercase tracking-widest text-[10px]">Order ID</th>
                                        <th className="px-4 py-2.5 font-medium uppercase tracking-widest text-[10px]">Customer</th>
                                        <th className="px-4 py-2.5 font-medium uppercase tracking-widest text-[10px]">Status</th>
                                        <th className="px-4 py-2.5 font-medium uppercase tracking-widest text-[10px] text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {store?.recentOrders?.length > 0 ? (
                                        store.recentOrders.map((order: any) => {
                                            let address = order.delivery_address;
                                            if (typeof address === 'string') {
                                                try { address = JSON.parse(address); } catch (e) { }
                                            }

                                            // Status badge mappings matching TechPremium
                                            let badgeClass = 'bg-slate-100 text-slate-600';
                                            let statusText = order.status;
                                            if (order.status === 'confirmed') badgeClass = 'bg-orange-100 text-orange-700';
                                            else if (order.status === 'delivered') badgeClass = 'bg-green-100 text-green-700';
                                            else if (order.status === 'cancelled') badgeClass = 'bg-red-100 text-red-700';

                                            return (
                                                <tr key={order.id} onClick={() => router.push(`/dashboard/orders/${order.id}`)} className="hover:bg-slate-50 transition-colors cursor-pointer group">
                                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                                        <span className="text-[12px] font-bold text-slate-700 block mb-0.5">#{order.id.slice(0, 6)}</span>
                                                        <span className="text-[10px] font-medium text-slate-400">{new Date(order.created_at).toLocaleDateString()}</span>
                                                    </td>
                                                    <td className="px-4 py-2.5">
                                                        <p className="font-bold text-slate-900 text-xs">{address?.full_name || 'Guest User'}</p>
                                                    </td>
                                                    <td className="px-4 py-2.5 whitespace-nowrap">
                                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block ${badgeClass}`}>
                                                            {statusText}
                                                        </span>
                                                    </td>
                                                    <td className="px-4 py-2.5 whitespace-nowrap text-right">
                                                        <p className="font-bold text-sm text-slate-900">₹{order.total_amount.toLocaleString()}</p>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-10 text-center text-slate-500">
                                                <div className="mx-auto w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                    <span className="material-symbols-outlined text-slate-300 text-[24px]">inbox</span>
                                                </div>
                                                <p className="text-[14px] font-bold text-slate-900">No recent orders</p>
                                                <p className="text-[13px] text-slate-500 mt-1">Your store is ready for business!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Tools & Info */}
                    <div className="space-y-6">
                        {/* Quick Action Grid */}
                        <div>
                            <h2 className="text-[15px] font-black text-slate-800 tracking-tight mb-3">Quick Tools</h2>
                            <div className="grid grid-cols-2 gap-2">
                                <Link href="/dashboard/products/create" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-primary transition-all group shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_box</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">Add Item</span>
                                </Link>
                                <Link href="/dashboard/marketing/offers" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-primary transition-all group shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">local_offer</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">New Offer</span>
                                </Link>
                                <Link href="/dashboard/qrcode" className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-primary transition-all group shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">qr_code_2</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">Store QR</span>
                                </Link>
                                <button onClick={() => { }} className="flex items-center gap-3 bg-white p-4 rounded-xl border border-slate-200 hover:border-primary transition-all group text-left shadow-sm">
                                    <div className="w-10 h-10 rounded-lg bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">share</span>
                                    </div>
                                    <span className="text-[13px] font-bold text-slate-700">Share Link</span>
                                </button>
                            </div>
                        </div>

                        {/* Store Promotion Banner */}
                        <div className="bg-gradient-to-r from-primary to-blue-600 rounded-xl p-6 text-white shadow-md relative overflow-hidden flex flex-col items-start justify-center min-h-[180px]">
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

                            <h3 className="text-[20px] font-bold mb-2 relative z-10 leading-tight">Grow your business with social commerce</h3>
                            <p className="text-[13px] text-white/80 font-medium mb-5 relative z-10 max-w-[90%] block">Connect directly on WhatsApp and boost sales heavily using integrated sharing tools.</p>

                            <Button variant="secondary" size="sm" className="bg-white text-primary border-none shadow-sm font-bold h-10 px-5 text-[13px] hover:bg-gray-50 active:scale-95 transition-transform flex items-center gap-2 relative z-10">
                                <span className="material-symbols-outlined text-[18px]">share</span> Share on WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PullToRefresh>
    )
}
