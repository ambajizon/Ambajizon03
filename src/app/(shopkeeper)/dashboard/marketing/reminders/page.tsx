'use client'

import { useState, useEffect } from 'react'
import { getReminders, createReminder, updateReminder, deleteReminder, getCustomersForReminder } from '@/app/actions/marketing'
import { BellRing, Save, Loader2, Trash2, Edit2, Plus, X } from 'lucide-react'

export default function RemindersPage() {
    const [reminders, setReminders] = useState<any[]>([])
    const [customerCounts, setCustomerCounts] = useState<Record<string, number>>({})
    const [loading, setLoading] = useState(true)

    // Create Form State
    const [showCreate, setShowCreate] = useState(false)
    const [newReminder, setNewReminder] = useState({ trigger_after_days: 30, message_template: 'Hi {customer_name}, we miss you! Check out our latest products at {store_name}.', is_enabled: true })
    const [creating, setCreating] = useState(false)

    // Edit State
    const [editingId, setEditingId] = useState<string | null>(null)
    const [editData, setEditData] = useState<any>(null)
    const [savingId, setSavingId] = useState<string | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const list = await getReminders()
        setReminders(list)

        const counts: Record<string, number> = {}
        for (const r of list) {
            const custs = await getCustomersForReminder(r.trigger_after_days)
            counts[r.id] = custs.length
        }
        setCustomerCounts(counts)
        setLoading(false)
    }

    async function handleCreate() {
        setCreating(true)
        await createReminder(newReminder)
        await loadData()
        setShowCreate(false)
        setCreating(false)
    }

    async function handleUpdate(id: string) {
        setSavingId(id)
        await updateReminder(id, editData)
        await loadData()
        setEditingId(null)
        setSavingId(null)
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this reminder rule?')) return
        await deleteReminder(id)
        await loadData()
    }

    const startEdit = (rem: any) => {
        setEditingId(rem.id)
        // Set it, handling fallback for missing is_enabled
        setEditData({ ...rem, is_enabled: rem.is_enabled ?? true })
    }

    return (
        <div className="space-y-8">
            <div className="flex justify-between items-center">
                <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <BellRing className="text-primary" /> Automated Reminders
                </h1>
                {!showCreate && (
                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Plus size={18} /> New Rule
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showCreate && (
                <div className="bg-white p-6 rounded-xl shadow-sm border animate-in fade-in slide-in-from-top-2">
                    <div className="flex justify-between items-center mb-4 border-b pb-2">
                        <h3 className="font-bold text-lg">Create Reminder Rule</h3>
                        <button onClick={() => setShowCreate(false)} className="text-gray-400 hover:text-gray-600">
                            <X size={20} />
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium mb-1">Trigger after (days of inactivity)</label>
                            <input
                                type="number"
                                className="w-full border p-2 rounded focus:ring-2 focus:ring-primary outline-none"
                                value={newReminder.trigger_after_days}
                                onChange={e => setNewReminder({ ...newReminder, trigger_after_days: parseInt(e.target.value) || 0 })}
                            />
                        </div>
                        <div className="flex items-center pt-6">
                            <label className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={newReminder.is_enabled}
                                    onChange={e => setNewReminder({ ...newReminder, is_enabled: e.target.checked })}
                                    className="w-5 h-5 rounded border-gray-300 text-primary focus:ring-primary"
                                />
                                <span className="text-sm font-medium">Enable Rule</span>
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-1">Message Template</label>
                            <textarea
                                className="w-full border p-2 rounded h-24 focus:ring-2 focus:ring-primary outline-none"
                                value={newReminder.message_template}
                                onChange={e => setNewReminder({ ...newReminder, message_template: e.target.value })}
                            />
                            <p className="text-xs text-gray-500 mt-1">Available variables: {'{customer_name}, {store_name}'}</p>
                        </div>
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                        <button
                            onClick={() => setShowCreate(false)}
                            className="px-4 py-2 text-gray-600 font-medium hover:bg-gray-50 rounded"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleCreate}
                            disabled={creating}
                            className="bg-primary text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-primary/90"
                        >
                            {creating ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />} Create
                        </button>
                    </div>
                </div>
            )}

            {/* List of Rules */}
            {loading ? (
                <div className="flex justify-center py-12"><Loader2 className="animate-spin text-gray-400 h-8 w-8" /></div>
            ) : reminders.length === 0 && !showCreate ? (
                <div className="bg-white rounded-xl shadow-sm border p-12 text-center text-gray-500">
                    <BellRing className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                    <h3 className="text-lg font-bold text-gray-900 mb-1">No reminders set up</h3>
                    <p className="mb-4">Create automated WhatsApp reminders to bring back inactive customers.</p>
                    <button
                        onClick={() => setShowCreate(true)}
                        className="bg-black text-white px-4 py-2 rounded-lg font-bold inline-flex items-center gap-2 hover:bg-gray-800"
                    >
                        <Plus size={18} /> Create Rule
                    </button>
                </div>
            ) : (
                <div className="grid gap-4">
                    {reminders.map(rem => (
                        <div key={rem.id} className="bg-white rounded-xl shadow-sm border p-5">
                            {editingId === rem.id ? (
                                <div className="space-y-4 animate-in fade-in">
                                    <div className="flex justify-between border-b pb-2">
                                        <h4 className="font-bold">Edit Rule</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium mb-1 text-gray-500">Trigger after (days)</label>
                                            <input
                                                type="number"
                                                className="w-full border p-2 rounded text-sm"
                                                value={editData.trigger_after_days}
                                                onChange={e => setEditData({ ...editData, trigger_after_days: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                        <div className="flex items-center pt-5">
                                            <label className="flex items-center gap-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    checked={editData.is_enabled}
                                                    onChange={e => setEditData({ ...editData, is_enabled: e.target.checked })}
                                                    className="w-4 h-4 rounded border-gray-300 text-primary"
                                                />
                                                <span className="text-sm font-medium">Enable Rule</span>
                                            </label>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="block text-xs font-medium mb-1 text-gray-500">Message Template</label>
                                            <textarea
                                                className="w-full border p-2 rounded h-20 text-sm"
                                                value={editData.message_template}
                                                onChange={e => setEditData({ ...editData, message_template: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="flex justify-end gap-2 pt-2">
                                        <button
                                            onClick={() => setEditingId(null)}
                                            className="px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-100 rounded"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            onClick={() => handleUpdate(rem.id)}
                                            disabled={savingId === rem.id}
                                            className="bg-black text-white px-4 py-1.5 rounded text-sm font-bold flex items-center gap-2"
                                        >
                                            {savingId === rem.id ? <Loader2 className="animate-spin h-4 w-4" /> : <Save size={14} />} Save
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row gap-4 items-start md:items-center justify-between">
                                    <div className="flex-1 space-y-1">
                                        <div className="flex items-center gap-3">
                                            <span className="font-bold text-gray-900 border-b border-dashed border-gray-300 pb-0.5">
                                                After {rem.trigger_after_days} days
                                            </span>
                                            <span className={`px-2 py-0.5 rounded-full text-xs font-bold uppercase ${rem.is_enabled !== false ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                                                {rem.is_enabled !== false ? 'Active' : 'Disabled'}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600 italic line-clamp-2">
                                            "{rem.message_template}"
                                        </p>
                                    </div>

                                    <div className="flex items-center gap-6">
                                        <div className="text-center bg-gray-50 p-2 rounded-lg border min-w-[100px]">
                                            <div className="text-2xl font-bold text-primary leading-none">
                                                {customerCounts[rem.id] || 0}
                                            </div>
                                            <div className="text-[10px] uppercase font-bold text-gray-500 mt-1">Qualify Today</div>
                                        </div>

                                        <div className="flex items-center gap-2 border-l pl-6">
                                            <button
                                                onClick={() => startEdit(rem)}
                                                className="p-2 text-gray-400 hover:text-primary hover:bg-gray-100 rounded-lg transition"
                                                title="Edit Rule"
                                            >
                                                <Edit2 size={18} />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(rem.id)}
                                                className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition"
                                                title="Delete Rule"
                                            >
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
