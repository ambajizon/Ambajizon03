'use client'

import { useState, useEffect } from 'react'
import { getBillingRecords, markPaymentPaid } from '@/app/actions/admin'
import { IndianRupee, Search, Download, Filter, CheckCircle } from 'lucide-react'

export default function AdminBillingPage() {
    const [records, setRecords] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    // Filters
    const [search, setSearch] = useState('')
    const [typeFilter, setTypeFilter] = useState('all')
    const [dateRange, setDateRange] = useState({ start: '', end: '' })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getBillingRecords()
        setRecords(data)
        setLoading(false)
    }

    async function handleMarkPaid(id: string) {
        if (!confirm('Mark this payment as manually PAID off-platform? This will activate the shopkeeper subscription.')) return
        const res = await markPaymentPaid(id)
        if (res.success) {
            alert('Payment marked as paid!')
            loadData()
        } else {
            alert('Error: ' + res.error)
        }
    }

    // Filter Logic
    const filtered = records.filter(r => {
        const matchesSearch =
            (r.stores?.name?.toLowerCase() || '').includes(search.toLowerCase()) ||
            (r.transaction_id || '').toLowerCase().includes(search.toLowerCase())

        const matchesType = typeFilter === 'all' || r.plan_type === typeFilter

        // Date range
        let matchesDate = true
        if (dateRange.start) {
            matchesDate = matchesDate && new Date(r.created_at) >= new Date(dateRange.start)
        }
        if (dateRange.end) {
            const endDate = new Date(dateRange.end)
            endDate.setHours(23, 59, 59, 999)
            matchesDate = matchesDate && new Date(r.created_at) <= endDate
        }

        return matchesSearch && matchesType && matchesDate
    })

    // Subtotals
    const totalCollected = filtered
        .filter(r => ['paid', 'success', 'completed', 'active'].includes((r.status || '').toLowerCase()))
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

    const totalPending = filtered
        .filter(r => ['pending', 'created', 'initiated'].includes((r.status || '').toLowerCase()))
        .reduce((sum, r) => sum + (Number(r.amount) || 0), 0)

    // CSV Export
    function handleExport() {
        if (filtered.length === 0) return alert('No data to export')

        const headers = ['Date', 'Store Name', 'Amount', 'Type', 'Status', 'Transaction ID']
        const csvRows = [headers.join(',')]

        for (const r of filtered) {
            const row = [
                new Date(r.created_at).toLocaleDateString(),
                `"${r.stores?.name || 'Unknown'}"`,
                r.amount,
                r.plan_type || 'yearly',
                r.status,
                r.transaction_id || ''
            ]
            csvRows.push(row.join(','))
        }

        const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' })
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.setAttribute('href', url)
        a.setAttribute('download', `ambajizon_billing_${new Date().toISOString().split('T')[0]}.csv`)
        a.click()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <h1 className="text-2xl font-bold text-gray-900">Billing & Subscriptions</h1>
                <button
                    onClick={handleExport}
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <Download size={18} /> Export CSV
                </button>
            </div>

            {/* Metric Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-green-500">
                    <p className="text-sm font-medium text-gray-500">Filtered Collected Revenue</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalCollected.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-l-4 border-l-orange-500">
                    <p className="text-sm font-medium text-gray-500">Filtered Pending/Processing</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">₹{totalPending.toLocaleString()}</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <p className="text-sm font-medium text-gray-500">Total Transactions Listed</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{filtered.length}</p>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-4 rounded-xl shadow-sm border space-y-4">
                <div className="flex items-center gap-2 border-b pb-2">
                    <Filter size={18} className="text-gray-500" />
                    <h3 className="font-bold text-gray-900">Filter Records</h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                        <input
                            className="w-full pl-9 pr-3 py-2 border rounded-lg bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Search store or TXN ID..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    <div>
                        <select
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                            value={typeFilter}
                            onChange={e => setTypeFilter(e.target.value)}
                        >
                            <option value="all">All Types</option>
                            <option value="setup">Setup Fee (Onboarding)</option>
                            <option value="yearly">Yearly Subscription</option>
                            <option value="renewal">Renewal</option>
                        </select>
                    </div>

                    <div className="md:col-span-2 flex items-center gap-2">
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm outline-none"
                            value={dateRange.start}
                            onChange={e => setDateRange({ ...dateRange, start: e.target.value })}
                        />
                        <span className="text-gray-400">to</span>
                        <input
                            type="date"
                            className="w-full px-3 py-2 border rounded-lg bg-gray-50 text-sm outline-none"
                            value={dateRange.end}
                            onChange={e => setDateRange({ ...dateRange, end: e.target.value })}
                        />
                    </div>
                </div>
            </div>

            {/* Table */}
            {loading ? (
                <div className="text-center p-8 text-gray-500">Loading records...</div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead className="bg-gray-50 font-medium text-gray-500 border-b">
                                <tr>
                                    <th className="p-4">Date & Store</th>
                                    <th className="p-4">Payment Type</th>
                                    <th className="p-4">Amount</th>
                                    <th className="p-4">Status & TXN ID</th>
                                    <th className="p-4 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {filtered.length === 0 ? (
                                    <tr>
                                        <td colSpan={5} className="p-8 text-center text-gray-500">No records strictly matching the filters.</td>
                                    </tr>
                                ) : filtered.map(r => {
                                    const isPaid = ['paid', 'success', 'completed', 'active'].includes((r.status || '').toLowerCase())
                                    const isPending = ['pending', 'created', 'initiated'].includes((r.status || '').toLowerCase())

                                    return (
                                        <tr key={r.id} className="hover:bg-gray-50 text-gray-900">
                                            <td className="p-4">
                                                <p className="font-bold">{r.stores?.name || 'Unknown Store'}</p>
                                                <p className="text-xs text-gray-500 mt-1">{new Date(r.created_at).toLocaleString()}</p>
                                            </td>
                                            <td className="p-4">
                                                <span className="capitalize">{r.plan_type || 'Yearly Subscription'}</span>
                                            </td>
                                            <td className="p-4 font-bold text-gray-900">
                                                ₹{r.amount}
                                            </td>
                                            <td className="p-4">
                                                <p className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase mb-1 ${isPaid ? 'bg-green-100 text-green-700' : isPending ? 'bg-orange-100 text-orange-700' : 'bg-red-100 text-red-700'}`}>
                                                    {r.status || 'unknown'}
                                                </p>
                                                <p className="font-mono text-[10px] text-gray-400 flex items-center max-w-[150px] truncate" title={r.transaction_id}>
                                                    TXN: {r.transaction_id || 'N/A'}
                                                </p>
                                            </td>
                                            <td className="p-4 text-right align-middle">
                                                {!isPaid && (
                                                    <button
                                                        onClick={() => handleMarkPaid(r.id)}
                                                        className="inline-flex items-center gap-1 bg-white border shadow-sm px-3 py-1.5 rounded-lg text-indigo-600 hover:text-indigo-800 font-medium text-xs hover:bg-indigo-50 transition"
                                                    >
                                                        <CheckCircle size={14} /> Mark as Paid
                                                    </button>
                                                )}
                                                {isPaid && (
                                                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Settled</span>
                                                )}
                                            </td>
                                        </tr>
                                    )
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    )
}
