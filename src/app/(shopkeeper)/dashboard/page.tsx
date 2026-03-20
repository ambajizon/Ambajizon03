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
            <div className="space-y-6 pt-4">
                <div className="h-7 w-52 bg-dash-surface animate-pulse rounded-xl" />
                <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
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
            <div className="space-y-6 max-w-[1400px] mx-auto pb-6 pt-2">

                {/* Page title */}
                <div>
                    <h1 className="text-[22px] font-bold text-dash-text">Dashboard</h1>
                    <p className="text-[13px] text-dash-muted mt-0.5">Welcome back! Here's what's happening with your store.</p>
                </div>

                {/* Setup/Pending Alert Banner */}
                {(!store?.is_setup_completed || store?.stats?.pendingCount > 0) && (
                    <div className="flex flex-col gap-3">
                        {!store?.is_setup_completed && (
                            <div className="bg-[#FFF7ED] p-4 rounded-2xl border border-[#FED7AA] flex items-center justify-between">
                                <div className="flex items-center gap-3 text-[#9A3412]">
                                    <span className="material-symbols-outlined shrink-0 text-[24px]">schedule</span>
                                    <div>
                                        <h3 className="font-bold text-[15px]">Setup Incomplete</h3>
                                        <p className="text-[13px] opacity-90">14 Days left in free trial. Complete store setup.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/setup">
                                    <Button variant="primary" size="sm" className="h-10 px-4 rounded-[9px] bg-[#EA580C] hover:bg-[#C2410C] shadow-sm text-sm font-bold">
                                        Complete Setup
                                    </Button>
                                </Link>
                            </div>
                        )}
                        {store?.stats?.pendingCount > 0 && (
                            <div className="bg-dash-primary-light p-4 rounded-2xl border border-[#C7C4F5] flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <div className="flex items-center gap-3 text-dash-primary">
                                    <span className="material-symbols-outlined shrink-0 text-[24px]">error</span>
                                    <div>
                                        <h3 className="font-bold text-[15px]">Action Required</h3>
                                        <p className="text-[13px] font-medium opacity-90">You have {store.stats.pendingCount} new order{store.stats.pendingCount > 1 ? 's' : ''} to process.</p>
                                    </div>
                                </div>
                                <Link href="/dashboard/orders" className="shrink-0 w-full md:w-auto">
                                    <Button variant="primary" size="sm" className="w-full h-10 px-6 rounded-[9px] bg-dash-primary hover:bg-dash-primary-dark shadow-sm text-sm font-bold">
                                        View Orders
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </div>
                )}

                {/* Adminty Gradient Stat Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                    {[{
                        label: 'Total Orders',
                        value: store?.stats?.totalOrders || 0,
                        trend: '+12%',
                        icon: 'local_mall',
                        gradient: 'linear-gradient(135deg, #FF8C42 0%, #FF5F15 100%)',
                        shadow: '0 4px 20px rgba(255,95,21,0.3)',
                    }, {
                        label: 'Total Revenue',
                        value: `₹${(store?.stats?.totalRev || 0).toLocaleString()}`,
                        trend: '+8%',
                        icon: 'payments',
                        gradient: 'linear-gradient(135deg, #2ECC9A 0%, #17A87A 100%)',
                        shadow: '0 4px 20px rgba(23,168,122,0.3)',
                    }, {
                        label: 'Store Views',
                        value: (store?.stats?.totalOrders || 0) * 14 + 120,
                        trend: '+24%',
                        icon: 'visibility',
                        gradient: 'linear-gradient(135deg, #7C6FE0 0%, #5A4FCF 100%)',
                        shadow: '0 4px 20px rgba(90,79,207,0.3)',
                    }, {
                        label: 'QR Scans',
                        value: (store?.stats?.totalOrders || 0) * 8 + 45,
                        trend: '+5%',
                        icon: 'qr_code_2',
                        gradient: 'linear-gradient(135deg, #F76B8A 0%, #E8436A 100%)',
                        shadow: '0 4px 20px rgba(232,67,106,0.3)',
                    }].map(({ label, value, trend, icon, gradient, shadow }) => (
                        <div
                            key={label}
                            className="relative rounded-2xl p-5 overflow-hidden cursor-default transition-all duration-200 hover:-translate-y-1"
                            style={{ background: gradient, boxShadow: shadow }}
                        >
                            {/* Faded decorative icon */}
                            <span
                                className="material-symbols-outlined absolute -bottom-2 -right-2 text-[80px] pointer-events-none select-none"
                                style={{ color: 'rgba(255,255,255,0.08)' }}
                            >{icon}</span>

                            {/* Label + icon row */}
                            <div className="flex items-center justify-between mb-3">
                                <p className="text-[11px] font-semibold uppercase tracking-[0.06em] text-white/75">{label}</p>
                                <span className="material-symbols-outlined text-white/60 text-[24px]">{icon}</span>
                            </div>

                            {/* Big number */}
                            <p className="text-[32px] font-extrabold text-white leading-none mb-2">{value}</p>

                            {/* Trend + sparkline */}
                            <div className="flex items-end justify-between">
                                <p className="text-[12px] text-white/70">↑ {trend} vs last week</p>
                                <div className="flex items-end gap-[3px]">
                                    {[40, 60, 80, 55, 100].map((h, i) => (
                                        <div key={i} className="w-1 rounded-sm bg-white/60" style={{ height: `${h * 0.2}px` }} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main Content Layout */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pb-20 lg:pb-0">

                    {/* Recent Orders List */}
                    <div className="lg:col-span-2">
                        <div className="flex justify-between items-center mb-3">
                            <h2 className="text-[15px] font-semibold text-dash-text">Recent Orders</h2>
                            <Link href="/dashboard/orders" className="text-[12px] font-semibold text-dash-primary hover:underline flex items-center gap-1 group">
                                View All <span className="material-symbols-outlined text-[14px] group-hover:translate-x-0.5 transition-transform">arrow_forward</span>
                            </Link>
                        </div>

                        <div className="bg-dash-card border border-dash-border rounded-2xl overflow-x-auto shadow-dash-card">
                            <table className="w-full text-left border-collapse min-w-[500px]">
                                <thead className="bg-dash-surface border-b-2 border-dash-border">
                                    <tr>
                                        <th className="px-5 py-3.5 font-bold uppercase tracking-[0.07em] text-[11px] text-dash-muted">Order ID</th>
                                        <th className="px-5 py-3.5 font-bold uppercase tracking-[0.07em] text-[11px] text-dash-muted">Customer</th>
                                        <th className="px-5 py-3.5 font-bold uppercase tracking-[0.07em] text-[11px] text-dash-muted">Status</th>
                                        <th className="px-5 py-3.5 font-bold uppercase tracking-[0.07em] text-[11px] text-dash-muted text-right">Amount</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-dash-bg">
                                    {store?.recentOrders?.length > 0 ? (
                                        store.recentOrders.map((order: any) => {
                                            let address = order.delivery_address;
                                            if (typeof address === 'string') {
                                                try { address = JSON.parse(address); } catch (e) { }
                                            }

                                            // Adminty status badge mappings
                                            let badgeStyle = { bg: '#FEF3C7', color: '#92400E' };
                                            if (order.status === 'confirmed') badgeStyle = { bg: '#DBEAFE', color: '#1D40AF' };
                                            else if (order.status === 'shipped') badgeStyle = { bg: '#E0F2FE', color: '#0369A1' };
                                            else if (order.status === 'delivered') badgeStyle = { bg: '#DCFCE7', color: '#15803D' };
                                            else if (order.status === 'cancelled') badgeStyle = { bg: '#FEE2E2', color: '#DC2626' };

                                            return (
                                                <tr key={order.id} onClick={() => router.push(`/dashboard/orders/${order.id}`)} className="hover:bg-[#FAFBFF] transition-colors cursor-pointer">
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <span className="text-[13px] font-semibold text-dash-text block">#{order.id.slice(0, 6).toUpperCase()}</span>
                                                        <span className="text-[11px] text-dash-muted">{new Date(order.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                                    </td>
                                                    <td className="px-5 py-3.5">
                                                        <p className="font-semibold text-dash-text text-[14px]">{address?.full_name || 'Guest User'}</p>
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap">
                                                        <span
                                                            className="px-3 py-1 rounded-full text-[11px] font-semibold uppercase tracking-wide inline-block capitalize"
                                                            style={{ background: badgeStyle.bg, color: badgeStyle.color }}
                                                        >
                                                            {order.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-5 py-3.5 whitespace-nowrap text-right">
                                                        <p className="font-bold text-[14px] text-dash-text">₹{order.total_amount.toLocaleString()}</p>
                                                    </td>
                                                </tr>
                                            )
                                        })
                                    ) : (
                                        <tr>
                                            <td colSpan={4} className="px-5 py-12 text-center">
                                                <div className="mx-auto w-12 h-12 bg-dash-surface rounded-full flex items-center justify-center mb-3">
                                                    <span className="material-symbols-outlined text-dash-icon text-[24px]">inbox</span>
                                                </div>
                                                <p className="text-[14px] font-semibold text-dash-text">No recent orders</p>
                                                <p className="text-[13px] text-dash-muted mt-1">Your store is ready for business!</p>
                                            </td>
                                        </tr>
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {/* Quick Tools & Info */}
                    <div className="space-y-5">
                        {/* Quick Action Grid */}
                        <div>
                            <h2 className="text-[15px] font-semibold text-dash-text mb-3">Quick Tools</h2>
                            <div className="grid grid-cols-2 gap-3">
                                <Link href="/dashboard/products/create" className="flex items-center gap-3 bg-dash-card p-4 rounded-xl border border-dash-border hover:border-dash-primary hover:shadow-dash-card transition-all group">
                                    <div className="w-10 h-10 rounded-[10px] bg-dash-primary-light text-dash-primary flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">add_box</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-dash-text">Add Item</span>
                                </Link>
                                <Link href="/dashboard/marketing/offers" className="flex items-center gap-3 bg-dash-card p-4 rounded-xl border border-dash-border hover:border-dash-primary hover:shadow-dash-card transition-all group">
                                    <div className="w-10 h-10 rounded-[10px] bg-orange-50 text-orange-500 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">local_offer</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-dash-text">New Offer</span>
                                </Link>
                                <Link href="/dashboard/qrcode" className="flex items-center gap-3 bg-dash-card p-4 rounded-xl border border-dash-border hover:border-dash-primary hover:shadow-dash-card transition-all group">
                                    <div className="w-10 h-10 rounded-[10px] bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">qr_code_2</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-dash-text">Store QR</span>
                                </Link>
                                <button onClick={() => { }} className="flex items-center gap-3 bg-dash-card p-4 rounded-xl border border-dash-border hover:border-dash-primary hover:shadow-dash-card transition-all group text-left">
                                    <div className="w-10 h-10 rounded-[10px] bg-green-50 text-green-600 flex items-center justify-center shrink-0">
                                        <span className="material-symbols-outlined text-[20px] group-hover:scale-110 transition-transform">share</span>
                                    </div>
                                    <span className="text-[13px] font-semibold text-dash-text">Share Link</span>
                                </button>
                            </div>
                        </div>

                        {/* Store Promotion Banner */}
                        <div
                            className="rounded-2xl p-6 text-white relative overflow-hidden flex flex-col items-start justify-center min-h-[180px]"
                            style={{ background: 'linear-gradient(135deg, #4B44D6 0%, #7C6FE0 100%)', boxShadow: '0 4px 20px rgba(75,68,214,0.25)' }}
                        >
                            <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
                            <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-1/2 -translate-x-1/4 blur-2xl pointer-events-none" />

                            <h3 className="text-[20px] font-bold mb-2 relative z-10 leading-tight">Grow your business with social commerce</h3>
                            <p className="text-[13px] text-white/80 font-medium mb-5 relative z-10 max-w-[90%] block">Connect directly on WhatsApp and boost sales using integrated sharing tools.</p>

                            <Button variant="secondary" size="sm" className="bg-white text-dash-primary border-none shadow-sm font-bold h-10 px-5 text-[13px] hover:bg-gray-50 active:scale-95 transition-transform flex items-center gap-2 relative z-10 rounded-[9px]">
                                <span className="material-symbols-outlined text-[18px]">share</span> Share on WhatsApp
                            </Button>
                        </div>
                    </div>
                </div>
            </div>
        </PullToRefresh>
    )
}
