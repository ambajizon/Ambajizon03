'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Download, Calendar, ArrowUpRight } from 'lucide-react'

// Basic Reports UI that fetches raw data and displays it
export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('sales')
    const [data, setData] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [dateFilter, setDateFilter] = useState('This Month')
    const [startDate, setStartDate] = useState('')
    const [endDate, setEndDate] = useState('')

    useEffect(() => {
        loadData()
    }, [activeTab])

    const getDates = () => {
        const end = new Date()
        const start = new Date()
        if (dateFilter === 'Today') {
            start.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'This Week') {
            start.setDate(end.getDate() - end.getDay())
            start.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'This Month') {
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'Last 3 Months') {
            start.setMonth(end.getMonth() - 2)
            start.setDate(1)
            start.setHours(0, 0, 0, 0)
        } else if (dateFilter === 'Custom' && startDate && endDate) {
            const customStart = new Date(startDate)
            const customEnd = new Date(endDate)
            customEnd.setHours(23, 59, 59, 999)
            return { s: customStart.toISOString(), e: customEnd.toISOString() }
        } else {
            start.setDate(1) // fallback roughly this month
        }
        return { s: start.toISOString(), e: end.toISOString() }
    }

    async function loadData() {
        setLoading(true)
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) return

        const { data: store } = await supabase.from('stores').select('id').eq('shopkeeper_id', user.id).single()
        if (!store) return

        let result;
        const { s, e } = getDates()

        if (activeTab === 'sales') {
            const { data: orders } = await supabase
                .from('orders')
                .select('id, created_at, total_amount, status, payment_method')
                .eq('store_id', store.id)
                .gte('created_at', s)
                .lte('created_at', e)
                .order('created_at', { ascending: false })
            result = orders
        } else if (activeTab === 'products') {
            const { data: products } = await supabase
                .from('products')
                .select('*')
                .eq('store_id', store.id)
                .gte('created_at', s)
                .lte('created_at', e)
            result = products;
        } else {
            const { data: customers } = await supabase
                .from('customers')
                .select('*, orders(total_amount)')
                .eq('store_id', store.id)
                .gte('created_at', s)
                .lte('created_at', e)
            result = customers
        }

        setData(result || [])
        setLoading(false)
    }

    const downloadCSV = () => {
        if (!data.length) return
        const headers = Object.keys(data[0]).join(',')
        const rows = data.map(row => JSON.stringify(row)).join('\n') // json stringify handles commas in content roughly
        const blob = new Blob([headers + '\n' + rows], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `report-${activeTab}-${new Date().toISOString()}.csv`
        a.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Reports Center</h1>
                <button
                    onClick={downloadCSV}
                    className="flex items-center gap-2 bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-black transition"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            <div className="flex flex-col md:flex-row gap-4 items-center bg-white p-4 rounded-xl shadow-sm border">
                <div className="flex gap-2 items-center overflow-x-auto hide-scrollbar w-full md:w-auto">
                    <Calendar className="text-gray-400 mr-2 flex-shrink-0" size={18} />
                    {['Today', 'This Week', 'This Month', 'Last 3 Months', 'Custom'].map(f => (
                        <button
                            key={f}
                            onClick={() => { setDateFilter(f); if (f !== 'Custom') setTimeout(loadData, 50); }}
                            className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-colors ${dateFilter === f ? 'bg-gray-900 text-white shadow-md' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                {dateFilter === 'Custom' && (
                    <div className="flex items-center gap-2 w-full md:w-auto">
                        <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} className="border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-primary outline-none" />
                        <span className="text-gray-500 text-sm">to</span>
                        <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} className="border border-gray-300 p-1.5 rounded text-sm focus:ring-2 focus:ring-primary outline-none" />
                    </div>
                )}
                <div className="flex-1"></div>
                {(dateFilter === 'Custom' || true) && (
                    <button onClick={loadData} className="px-6 py-1.5 bg-primary text-white text-sm font-bold rounded-lg shadow-sm hover:bg-primary/90 w-full md:w-auto transition-colors">
                        Apply Filter
                    </button>
                )}
            </div>

            <div className="flex gap-4 border-b">
                {['sales', 'products', 'customers'].map(tab => (
                    <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`pb-3 px-4 font-bold capitalize transition-all ${activeTab === tab
                            ? 'border-b-2 border-indigo-600 text-indigo-600'
                            : 'text-gray-500 hover:text-gray-800'
                            }`}
                    >
                        {tab} Report
                    </button>
                ))}
            </div>

            <div className="bg-white p-6 rounded-xl shadow-sm border min-h-[400px]">
                {loading ? <div className="text-center text-gray-400 mt-20">Loading data...</div> : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50">
                                <tr>
                                    {activeTab === 'sales' && (
                                        <>
                                            <th className="p-3">Order ID</th>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Status</th>
                                        </>
                                    )}
                                    {activeTab === 'products' && (
                                        <>
                                            <th className="p-3">Product Name</th>
                                            <th className="p-3">Price</th>
                                            <th className="p-3">Stock</th>
                                        </>
                                    )}
                                    {activeTab === 'customers' && (
                                        <>
                                            <th className="p-3">Name</th>
                                            <th className="p-3">Phone</th>
                                            <th className="p-3">Tag</th>
                                        </>
                                    )}
                                </tr>
                            </thead>
                            <tbody className="divide-y">
                                {data.map((row: any, i) => (
                                    <tr key={i}>
                                        {activeTab === 'sales' && (
                                            <>
                                                <td className="p-3 font-mono text-xs">{row.id.slice(0, 8)}...</td>
                                                <td className="p-3">{new Date(row.created_at).toLocaleDateString()}</td>
                                                <td className="p-3 font-bold">₹{row.total_amount}</td>
                                                <td className="p-3 capitalize">{row.status}</td>
                                            </>
                                        )}
                                        {activeTab === 'products' && (
                                            <>
                                                <td className="p-3 font-bold">{row.name}</td>
                                                <td className="p-3">₹{row.price}</td>
                                                <td className="p-3">{row.stock_quantity}</td>
                                            </>
                                        )}
                                        {activeTab === 'customers' && (
                                            <>
                                                <td className="p-3 font-bold">{row.name}</td>
                                                <td className="p-3">{row.phone}</td>
                                                <td className="p-3">{row.tag || 'New'}</td>
                                            </>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {data.length === 0 && <div className="text-center text-gray-400 py-10">No records found.</div>}
                    </div>
                )}
            </div>
        </div>
    )
}
