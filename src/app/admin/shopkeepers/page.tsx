'use client'

import { useState, useEffect } from 'react'
import { getShopkeepers, toggleStoreStatus } from '@/app/actions/admin'
import { Search, Eye, MoreHorizontal, CheckCircle, XCircle, Store, Edit, ShieldAlert } from 'lucide-react'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function ShopkeepersListPage() {
    const [shopkeepers, setShopkeepers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [statusFilter, setStatusFilter] = useState('all')

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getShopkeepers()
        setShopkeepers(data || [])
        setLoading(false)
    }

    async function handleToggleSuspend(storeId: string, currentStatus: boolean) {
        if (!confirm(`Are you sure you want to ${currentStatus ? 'suspend' : 'activate'} this store?`)) return

        const res = await toggleStoreStatus(storeId, !currentStatus)
        if (res.error) {
            toast.error(res.error)
        } else {
            toast.success(`Store ${currentStatus ? 'suspended' : 'activated'} successfully`)
            loadData()
        }
    }

    const filtered = shopkeepers.filter(s => {
        const matchesSearch = s.name.toLowerCase().includes(search.toLowerCase()) ||
            s.slug.toLowerCase().includes(search.toLowerCase()) ||
            (s.email && s.email.toLowerCase().includes(search.toLowerCase()))

        let matchesStatus = true
        if (statusFilter !== 'all') {
            matchesStatus = s.subscription_status === statusFilter
        }

        return matchesSearch && matchesStatus
    })

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900">Shopkeeper Management</h1>
                <Link
                    href="/admin/shopkeepers/create"
                    className="bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-indigo-700 transition flex items-center gap-2"
                >
                    <span className="text-xl leading-none">+</span> Create Shopkeeper
                </Link>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border flex flex-col sm:flex-row gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                        placeholder="Search by name, email, or store..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                    />
                </div>
                <div className="sm:w-56 shrink-0">
                    <select
                        className="w-full px-4 py-2 border rounded-lg bg-gray-50 font-medium outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                        value={statusFilter}
                        onChange={e => setStatusFilter(e.target.value)}
                    >
                        <option value="all">All Statuses</option>
                        <option value="active">Active</option>
                        <option value="trial">Trial</option>
                        <option value="expired">Expired</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center p-12 bg-white rounded-xl shadow-sm border">
                    <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-4"></div>
                    <p className="text-gray-500 font-medium">Loading shopkeepers...</p>
                </div>
            ) : filtered.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border p-16 flex flex-col items-center text-center">
                    <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5 border border-gray-100 shadow-inner">
                        <Store size={36} className="text-gray-300" />
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">No shopkeepers found</h3>
                    <p className="text-gray-500 max-w-sm mx-auto mb-6">
                        {search || statusFilter !== 'all'
                            ? "Try adjusting your search or filters to find what you're looking for."
                            : "Your database is currently empty. Add your first shopkeeper to get started."}
                    </p>
                    {!(search || statusFilter !== 'all') && (
                        <Link
                            href="/admin/shopkeepers/create"
                            className="bg-indigo-50 text-indigo-700 px-6 py-2.5 rounded-lg font-bold hover:bg-indigo-100 transition"
                        >
                            Create First Shopkeeper
                        </Link>
                    )}
                </div>
            ) : (
                <div className="bg-white rounded-xl shadow-sm border overflow-x-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="bg-gray-50 text-gray-500 border-b">
                            <tr>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px]">Store Name & Contact</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px]">Lifecycle Status</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px]">Subscription End</th>
                                <th className="p-4 font-bold uppercase tracking-wider text-[11px] text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filtered.map(s => {
                                const isTrial = s.subscription_status === 'trial'
                                const isExpired = s.subscription_status === 'expired'
                                const isActive = s.subscription_status === 'active'

                                const statusColors: any = {
                                    active: 'bg-green-100 text-green-700 ring-1 ring-green-600/20',
                                    trial: 'bg-blue-100 text-blue-700 ring-1 ring-blue-600/20',
                                    expired: 'bg-red-100 text-red-700 ring-1 ring-red-600/20',
                                    cancelled: 'bg-gray-100 text-gray-700 ring-1 ring-gray-600/20'
                                }
                                const badgeColor = statusColors[s.subscription_status] || 'bg-gray-100 text-gray-700'

                                // Hydration-safe date string (YYYY-MM-DD format)
                                const rawEndDate = s.subscription_end_date || s.trial_end_date
                                const dateString = rawEndDate ? rawEndDate.toString().split('T')[0] : 'N/A'

                                return (
                                    <tr key={s.id} className="hover:bg-gray-50/80 transition-colors group">
                                        <td className="p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-lg bg-indigo-50 flex items-center justify-center text-indigo-600 font-bold shrink-0 border border-indigo-100">
                                                    {s.name ? s.name.charAt(0).toUpperCase() : 'S'}
                                                </div>
                                                <div>
                                                    <p className="font-bold text-gray-900 text-[14px]">{s.name || 'Unnamed Store'}</p>
                                                    <p className="text-[12px] text-indigo-600 font-medium mb-0.5">/{s.slug}</p>
                                                    <p className="text-[11px] text-gray-400 font-medium">{s.email}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-2 items-start">
                                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${badgeColor}`}>
                                                    {s.subscription_status}
                                                </span>
                                                {s.is_enabled ? (
                                                    <span className="inline-flex items-center gap-1 text-emerald-600 text-[11px] font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active Store
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 text-red-600 text-[11px] font-bold">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span> Suspended
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <div className="flex flex-col gap-1">
                                                <span className={`text-[13px] font-bold ${isExpired ? 'text-red-500' : 'text-gray-700'}`}>
                                                    {dateString}
                                                </span>
                                                <span className="text-[11px] text-gray-400 uppercase tracking-wider font-bold">
                                                    {isTrial ? 'Trial Expires' : 'Plan Renews'}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="p-4 align-middle">
                                            <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <Link
                                                    href={`/admin/shopkeepers/${s.shopkeeper_id}`}
                                                    className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors border border-transparent hover:border-indigo-100"
                                                    title="View Details"
                                                >
                                                    <Eye size={16} />
                                                </Link>
                                                <Link
                                                    href={`/admin/shopkeepers/${s.shopkeeper_id}?tab=edit`}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors border border-transparent hover:border-blue-100"
                                                    title="Edit Config"
                                                >
                                                    <Edit size={16} />
                                                </Link>
                                                <button
                                                    onClick={() => handleToggleSuspend(s.id, s.is_enabled)}
                                                    className={`p-2 rounded-lg transition-colors border border-transparent ${s.is_enabled
                                                            ? 'text-gray-400 hover:text-red-600 hover:bg-red-50 hover:border-red-100'
                                                            : 'text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 hover:border-emerald-100'
                                                        }`}
                                                    title={s.is_enabled ? "Suspend Store" : "Activate Store"}
                                                >
                                                    {s.is_enabled ? <ShieldAlert size={16} /> : <CheckCircle size={16} />}
                                                </button>
                                            </div>
                                            {/* Mobile fallback visible when not hovered */}
                                            <div className="md:hidden flex items-center justify-end">
                                                <Link
                                                    href={`/admin/shopkeepers/${s.shopkeeper_id}`}
                                                    className="text-[12px] font-bold text-indigo-600 px-3 py-1.5 bg-indigo-50 rounded-lg"
                                                >
                                                    Manage
                                                </Link>
                                            </div>
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}
