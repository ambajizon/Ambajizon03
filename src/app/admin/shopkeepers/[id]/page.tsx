'use client'

import { useState, useEffect } from 'react'
import { getShopkeeperDetail, extendTrial, toggleStoreStatus, addAdminNote, activateSubscriptionManually } from '@/app/actions/admin'
import { Loader2, Calendar, Lock, Unlock, ShieldAlert, Key, MessageCircle, FileText, CheckCircle, ExternalLink } from 'lucide-react'
import Link from 'next/link'

export default function ShopkeeperDetailPage({ params }: { params: { id: string } }) {
    const [data, setData] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [extendDate, setExtendDate] = useState('')
    const [note, setNote] = useState('')
    const [isSavingNote, setIsSavingNote] = useState(false)

    useEffect(() => {
        load()
    }, [params.id])

    async function load() {
        setLoading(true)
        const d = await getShopkeeperDetail(params.id)
        setData(d)
        setLoading(false)
    }

    async function handleExtendTrial() {
        if (!extendDate) return alert('Select a date')
        const newReason = prompt('Reason for extension:')
        if (!newReason) return

        const res = await extendTrial(data.store.id, extendDate, newReason)
        if (res.success) {
            alert('Trial extended')
            load()
        } else {
            alert('Error: ' + res.error)
        }
    }

    async function handleToggleStatus() {
        const newState = !data.store.is_enabled
        if (!confirm(`Are you sure you want to ${newState ? 'ACTIVATE' : 'DISABLE'} this store?`)) return

        await toggleStoreStatus(data.store.id, newState)
        load()
    }

    async function handleAddNote() {
        if (!note.trim()) return
        setIsSavingNote(true)
        const res = await addAdminNote(data.store.shopkeeper_id, note)
        setIsSavingNote(false)
        if (res.success) {
            setNote('')
            load()
        } else {
            alert('Error adding note: ' + res.error)
        }
    }

    async function handleActivateSub() {
        if (!confirm('Manually activate subscription for 1 year?')) return
        const res = await activateSubscriptionManually(data.store.shopkeeper_id)
        if (res.success) {
            alert('Subscription Activated')
            load()
        } else {
            alert('Error activating subscription: ' + res.error)
        }
    }

    if (loading) return <div className="p-8 flex justify-center"><Loader2 className="animate-spin text-indigo-600" /></div>
    if (!data || !data.store) return <div className="p-8 text-center bg-white rounded-lg border">Shopkeeper not found</div>

    const sk = data.store.shopkeepers || {}
    const isTrial = sk.subscription_status === 'trial'
    const isExpired = sk.subscription_status === 'expired'
    const waNumber = data.store.phone_number?.replace(/[^0-9]/g, '') || ''

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">{data.store.name}</h1>
                    <p className="text-gray-500">Shopkeeper ID: {data.store.shopkeeper_id}</p>
                </div>
                <div className="flex gap-3">
                    <a
                        href={waNumber ? `https://wa.me/91${waNumber}` : '#'}
                        target="_blank"
                        rel="noreferrer"
                        className={`inline-flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 ${!waNumber && 'opacity-50 cursor-not-allowed'}`}
                    >
                        <MessageCircle size={18} /> WhatsApp
                    </a>
                    <Link
                        href={`/${data.store.slug}`}
                        target="_blank"
                        className="inline-flex items-center gap-2 px-4 py-2 border rounded-lg font-bold text-gray-700 hover:bg-gray-50"
                    >
                        <ExternalLink size={18} /> Visit Live Store
                    </Link>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Store & Profile Info */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2"><FileText size={18} /> Profile Details</h2>
                        <div className="grid grid-cols-2 gap-y-4 gap-x-6">
                            <div>
                                <label className="text-sm text-gray-500 block">Owner Name</label>
                                <p className="font-medium text-gray-900">{data.store.name}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Email Address</label>
                                <p className="font-medium text-gray-900">{sk.email || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Phone Number</label>
                                <p className="font-medium text-gray-900">{data.store.phone_number || 'N/A'}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block">Store URL Slug</label>
                                <p className="font-mono bg-gray-50 px-2 py-0.5 rounded text-sm w-fit inline-block">/{data.store.slug}</p>
                            </div>
                            <div>
                                <label className="text-sm text-gray-500 block mb-1">Store Engine Status</label>
                                <span className={`inline-block px-2 py-0.5 rounded text-xs font-bold uppercase ${data.store.is_enabled ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                    {data.store.is_enabled ? 'Live / Accessible' : 'Offline / Unavailable'}
                                </span>
                            </div>
                        </div>

                        <div className="pt-6 mt-4 border-t">
                            <button
                                onClick={handleToggleStatus}
                                className={`w-full sm:w-auto px-4 py-2 rounded font-bold transition flex justify-center items-center gap-2 ${data.store.is_enabled ? 'bg-red-50 text-red-600 hover:bg-red-100' : 'bg-green-50 text-green-600 hover:bg-green-100'}`}
                            >
                                {data.store.is_enabled ? <><Lock size={16} /> Deactivate Store</> : <><Unlock size={16} /> Reactivate Store</>}
                            </button>
                            <p className="text-xs text-gray-500 mt-2">Deactivating the store will block customers from visiting and ordering.</p>
                        </div>
                    </div>

                    {/* Store Health Diagnostics */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2"><ShieldAlert size={18} className="text-indigo-600" /> Store Health & Diagnostics</h2>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                <p className="text-xl font-bold text-gray-900">{data.health?.productsCount || 0}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Products</p>
                            </div>
                            <div className="bg-gray-50 p-4 rounded-lg text-center border">
                                <p className="text-xl font-bold text-gray-900">{data.health?.ordersCount || 0}</p>
                                <p className="text-xs text-gray-500 mt-1 uppercase tracking-wide">Total Orders</p>
                            </div>
                            <div className="bg-blue-50 p-4 rounded-lg text-center border border-blue-100 md:col-span-2">
                                <p className="text-sm font-bold text-blue-900">
                                    {data.health?.lastOrderDate ? new Date(data.health.lastOrderDate).toLocaleDateString() : 'No Orders Yet'}
                                </p>
                                <p className="text-xs text-blue-700 mt-1 uppercase tracking-wide">Last Recorded Order</p>
                            </div>
                        </div>
                    </div>

                    {/* Subscription History */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2"><Key size={18} /> Subscription & Payments</h2>
                        {data.subscriptions.length === 0 ? (
                            <p className="text-sm text-gray-500 text-center py-6 border-2 border-dashed rounded-lg bg-gray-50">No payments recorded on this account.</p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-left text-sm">
                                    <thead className="text-gray-500 bg-gray-50 border-b">
                                        <tr>
                                            <th className="p-3">Date</th>
                                            <th className="p-3">Amount</th>
                                            <th className="p-3">Status</th>
                                            <th className="p-3 text-right">Transaction ID</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {data.subscriptions.map((sub: any) => (
                                            <tr key={sub.id}>
                                                <td className="p-3">{new Date(sub.created_at).toLocaleDateString()}</td>
                                                <td className="p-3 font-bold text-gray-900">₹{sub.amount}</td>
                                                <td className="p-3 uppercase text-xs font-bold text-gray-500">{sub.status}</td>
                                                <td className="p-3 text-right font-mono text-xs text-gray-400">{sub.transaction_id || sub.razorpay_payment_id || 'N/A'}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    {/* Trial Extension History */}
                    {data.extensions.length > 0 && (
                        <div className="bg-white p-6 rounded-xl shadow-sm border">
                            <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2"><Calendar size={18} /> Trial Extensions</h2>
                            <ul className="space-y-3">
                                {data.extensions.map((ext: any) => (
                                    <li key={ext.id} className="text-sm bg-gray-50 p-3 rounded-lg border flex justify-between items-start">
                                        <div>
                                            <p className="font-medium text-gray-900">Extended to {new Date(ext.extended_to).toLocaleDateString()}</p>
                                            <p className="text-gray-500 mt-1 italic text-xs">Reason: {ext.reason}</p>
                                        </div>
                                        <span className="text-xs text-gray-400">{new Date(ext.created_at).toLocaleDateString()}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>
                    )}
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                    {/* Billing Actions */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border space-y-4">
                        <h2 className="font-bold text-lg mb-2 border-b pb-2">Account State</h2>

                        <div>
                            <span className="text-sm text-gray-500 block mb-1">Status</span>
                            <span className={`inline-block px-3 py-1 rounded text-sm font-bold uppercase ${sk.subscription_status === 'active' ? 'bg-green-100 text-green-700' : sk.subscription_status === 'trial' ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>
                                {sk.subscription_status || 'Trial'}
                            </span>
                        </div>

                        {sk.subscription_status === 'trial' && (
                            <div className="bg-blue-50 p-4 rounded-lg mt-4 border border-blue-100">
                                <label className="text-sm font-bold text-blue-900 block mb-2">Extend Trial Deadline</label>
                                <p className="text-xs text-blue-700 mb-3">Currently ends: {sk.trial_end_date ? new Date(sk.trial_end_date).toLocaleDateString() : 'N/A'}</p>
                                <input
                                    type="date"
                                    className="border p-2 rounded w-full mb-2 text-sm outline-none focus:ring-2 focus:ring-blue-500"
                                    value={extendDate}
                                    onChange={e => setExtendDate(e.target.value)}
                                />
                                <button
                                    onClick={handleExtendTrial}
                                    className="w-full bg-blue-600 text-white px-4 py-2 rounded text-sm font-bold hover:bg-blue-700"
                                >
                                    Confirm Extension
                                </button>
                            </div>
                        )}

                        <div className="pt-4 mt-4 border-t">
                            <button
                                onClick={handleActivateSub}
                                className="w-full border-2 border-indigo-600 text-indigo-700 px-4 py-2 rounded text-sm font-bold hover:bg-indigo-50 transition flex items-center justify-center gap-2"
                            >
                                <CheckCircle size={16} /> Manually Activate Sub
                            </button>
                            <p className="text-[10px] text-gray-500 mt-2 text-center text-balance">Bypasses payment gateway and instantly applies 1-year active status.</p>
                        </div>
                    </div>

                    {/* Admin Notes */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border flex flex-col h-[500px]">
                        <h2 className="font-bold text-lg mb-4 flex items-center gap-2 border-b pb-2"><FileText size={18} /> Internal Admin Notes</h2>

                        <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-2">
                            {data.notes.length === 0 ? (
                                <p className="text-xs text-gray-400 italic text-center py-4">No notes attached.</p>
                            ) : (
                                data.notes.map((n: any) => (
                                    <div key={n.id} className="bg-yellow-50 p-3 rounded-lg border border-yellow-100 relative">
                                        <p className="text-sm text-gray-800 whitespace-pre-wrap">{n.note}</p>
                                        <span className="text-[10px] text-gray-400 mt-2 block">{new Date(n.created_at).toLocaleString()}</span>
                                    </div>
                                ))
                            )}
                        </div>

                        <div className="mt-auto pt-4 border-t relative">
                            <textarea
                                className="w-full border rounded-lg p-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 bg-gray-50 resize-none h-24"
                                placeholder="Type a note here (only visible to admins)..."
                                value={note}
                                onChange={e => setNote(e.target.value)}
                            />
                            <button
                                onClick={handleAddNote}
                                disabled={isSavingNote || !note.trim()}
                                className="mt-2 w-full bg-indigo-600 text-white py-2 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition"
                            >
                                {isSavingNote ? 'Saving...' : 'Add Note'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
