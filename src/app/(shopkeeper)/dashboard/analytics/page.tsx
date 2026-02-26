'use client'

import { useState, useEffect } from 'react'
import { getAnalyticsData } from '@/app/actions/analytics'
import { TrendingUp, Users, ShoppingBag } from 'lucide-react'

// Simple SVG Line Chart Component
function SimpleLineChart({ data, dataKey, color }: any) {
    if (!data || data.length === 0) return <div className="h-40 flex items-center justify-center text-gray-400">No data yet. Share your store!</div>

    const max = Math.max(...data.map((d: any) => Number(d[dataKey]) || 0)) || 10
    const points = data.map((d: any, i: number) => {
        const x = (i / (Math.max(data.length - 1, 1))) * 100
        const val = Number(d[dataKey]) || 0
        const y = 100 - (val / max) * 100
        return `${x},${y}`
    }).join(' ')

    return (
        <div className="h-40 w-full relative">
            <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                />
            </svg>
            <div className="absolute bottom-0 w-full flex justify-between text-[10px] text-gray-400 mt-2">
                <span>{data[0]?.date ? new Date(data[0].date).toLocaleDateString() : 'N/A'}</span>
                <span>{data[data.length - 1]?.date ? new Date(data[data.length - 1].date).toLocaleDateString() : 'N/A'}</span>
            </div>
        </div>
    )
}

export default function AnalyticsPage() {
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [user, setUser] = useState<any>(null)
    const [storeId, setStoreId] = useState<string | null>(null)

    useEffect(() => {
        // We need store ID. In a real app we'd pass it from layout or context.
        // For now, fetch via client-side auth/store check or assume a wrapper does it.
        // Let's rely on a helper or just fetch store first.
        import('@/lib/supabase/client').then(({ createClient }) => {
            const supabase = createClient()
            supabase.auth.getUser().then(async ({ data: { user } }) => {
                if (user) {
                    setUser(user)
                    const { data: store } = await supabase.from('stores').select('id').eq('shopkeeper_id', user.id).single()
                    if (store) {
                        setStoreId(store.id)
                        const analytics = await getAnalyticsData(store.id)
                        setData(analytics)
                    }
                }
                setLoading(false)
            })
        })
    }, [])

    if (loading) return <div>Loading analytics...</div>

    return (
        <div className="space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Store Analytics</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-green-100 rounded text-green-600">
                            <TrendingUp size={20} />
                        </div>
                        <h3 className="font-bold">Revenue Trend</h3>
                    </div>
                    <SimpleLineChart data={data} dataKey="revenue" color="#16a34a" />
                </div>

                {/* Orders Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-blue-100 rounded text-blue-600">
                            <ShoppingBag size={20} />
                        </div>
                        <h3 className="font-bold">Order Volume</h3>
                    </div>
                    <SimpleLineChart data={data} dataKey="order_count" color="#2563eb" />
                </div>

                {/* Visitors Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <div className="flex items-center gap-2 mb-4">
                        <div className="p-2 bg-purple-100 rounded text-purple-600">
                            <Users size={20} />
                        </div>
                        <h3 className="font-bold">Visitor Traffic</h3>
                    </div>
                    <SimpleLineChart data={data} dataKey="visitor_count" color="#9333ea" />
                </div>
            </div>

            <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                <h3 className="font-bold text-lg p-6 border-b">Daily Breakdown</h3>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 text-gray-500">
                            <tr>
                                <th className="p-4">Date</th>
                                <th className="p-4">Visitors</th>
                                <th className="p-4">Orders</th>
                                <th className="p-4">Revenue</th>
                                <th className="p-4">Conversion Rate</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y">
                            {!data || data.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="p-8 text-center text-gray-500">
                                        No data yet. Share your store!
                                    </td>
                                </tr>
                            ) : (
                                data.map((day: any, idx: number) => {
                                    const visitors = Number(day.visitor_count) || 0
                                    const orders = Number(day.order_count) || 0
                                    const revenue = Number(day.revenue) || 0
                                    const conversion = visitors > 0 ? ((orders / visitors) * 100).toFixed(1) + '%' : '0%'
                                    const dateStr = day.date ? new Date(day.date).toLocaleDateString() : `Day ${idx + 1}`
                                    return (
                                        <tr key={day.id || idx}>
                                            <td className="p-4">{dateStr}</td>
                                            <td className="p-4">{visitors}</td>
                                            <td className="p-4">{orders}</td>
                                            <td className="p-4 font-bold text-green-600">₹{revenue}</td>
                                            <td className="p-4">{conversion}</td>
                                        </tr>
                                    )
                                })
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
