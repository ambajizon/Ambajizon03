'use client'

import { useState, useEffect } from 'react'
import { getAdminAnalytics } from '@/app/actions/admin'
import { Loader2, TrendingUp, Users } from 'lucide-react'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts'

export default function AdminAnalyticsPage() {
    const [loading, setLoading] = useState(true)
    const [data, setData] = useState<any[]>([])

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const res = await getAdminAnalytics()
        if (res && res.chartData) {
            setData(res.chartData)
        }
        setLoading(false)
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-500" /></div>

    const totalRevenue = data.reduce((sum, item) => sum + item.revenue, 0)
    const newStores = data.reduce((sum, item) => sum + item.newStores, 0)

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Platform Analytics (Last 6 Months)</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Revenue Overview */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">Collected Revenue</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">₹{totalRevenue.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-green-50 text-green-600 rounded-full">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                </div>

                {/* Shopkeeper Acquisitions */}
                <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-gray-500">New Stores Created</p>
                            <p className="text-3xl font-bold text-gray-900 mt-1">{newStores.toLocaleString()}</p>
                        </div>
                        <div className="p-4 bg-blue-50 text-blue-600 rounded-full">
                            <Users size={24} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">

                {/* Revenue Line Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                    <h3 className="font-bold text-gray-900 mb-6">Revenue Growth</h3>
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">No data available yet</div>
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} tickFormatter={(val: any) => `₹${val}`} />
                                    <Tooltip
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [`₹${value}`, 'Revenue']}
                                    />
                                    <Line type="monotone" dataKey="revenue" stroke="#4F46E5" strokeWidth={3} dot={{ r: 4, fill: '#4F46E5', strokeWidth: 2, stroke: '#fff' }} activeDot={{ r: 6 }} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

                {/* Shopkeeper Signups Bar Chart */}
                <div className="bg-white p-6 rounded-xl shadow-sm border h-96">
                    <h3 className="font-bold text-gray-900 mb-6">Store Onboarding</h3>
                    {data.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-400">No data available yet</div>
                    ) : (
                        <div className="h-72">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                                    <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12, fill: '#6B7280' }} allowDecimals={false} />
                                    <Tooltip
                                        cursor={{ fill: '#F3F4F6' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                        formatter={(value: any) => [value, 'New Stores']}
                                    />
                                    <Bar dataKey="newStores" fill="#3B82F6" radius={[4, 4, 0, 0]} barSize={40} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    )}
                </div>

            </div>
        </div>
    )
}
