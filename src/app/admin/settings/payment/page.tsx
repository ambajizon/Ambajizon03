'use client'

import { useState, useEffect } from 'react'
import { getAdminSettings, saveAdminSettings } from '@/app/actions/admin'
import { Loader2, ShieldCheck, CreditCard, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminPaymentSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [settings, setSettings] = useState({
        razorpay_key_id: '',
        razorpay_key_secret: '',
        is_live: false,
    })
    const [hasSecret, setHasSecret] = useState(false)

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getAdminSettings()
        if (data) {
            setSettings({
                razorpay_key_id: data.razorpay_key_id || '',
                razorpay_key_secret: '', // Don't show existing secret, just indicator
                is_live: data.is_live_payments || false, // Renamed to denote platform-wide
            })
            setHasSecret(!!data.razorpay_key_secret)
        }
        setLoading(false)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const payload: any = {
            razorpay_key_id: settings.razorpay_key_id,
            is_live_payments: settings.is_live,
        }

        if (settings.razorpay_key_secret.trim() !== '') {
            payload.razorpay_key_secret = settings.razorpay_key_secret
        }

        const res = await saveAdminSettings(payload)

        setSaving(false)
        if (res.success) {
            toast.success('Payment Settings Saved')
            setSettings({ ...settings, razorpay_key_secret: '' })
            setHasSecret(true)
        } else {
            toast.error(res.error || 'Failed to save')
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-indigo-500 mx-auto" /></div>

    return (
        <div className="space-y-8 max-w-3xl">
            <div className="bg-white rounded-xl shadow-sm border p-6">
                <div className="flex items-center gap-3 border-b pb-4 mb-6">
                    <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><CreditCard size={24} /></div>
                    <div>
                        <h2 className="text-lg font-bold text-gray-900">Platform Payment Gateway</h2>
                        <p className="text-sm text-gray-500">Configure global Razorpay keys to collect subscription fees from shopkeepers on the root Pricing page.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-6">
                    <div className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Razorpay API Key ID</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm tracking-wide"
                                placeholder="rzp_live_xxxxxxxxxxx"
                                value={settings.razorpay_key_id}
                                onChange={e => setSettings({ ...settings, razorpay_key_id: e.target.value })}
                            />
                        </div>

                        <div>
                            <div className="flex justify-between items-end mb-1">
                                <label className="block text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                                {hasSecret && !settings.razorpay_key_secret && (
                                    <span className="text-xs flex items-center gap-1 text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded">
                                        <ShieldCheck size={12} /> Key Secret is currently saved securely.
                                    </span>
                                )}
                            </div>
                            <input
                                type={settings.razorpay_key_secret ? "text" : "password"}
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 font-mono text-sm tracking-wide"
                                placeholder={hasSecret ? "(Hidden. Enter new secret here to overwrite)" : "Enter API Key Secret"}
                                value={settings.razorpay_key_secret}
                                onChange={e => setSettings({ ...settings, razorpay_key_secret: e.target.value })}
                                required={!hasSecret}
                            />
                        </div>

                        <div className="pt-4 flex items-center justify-between bg-gray-50 p-4 rounded-lg border">
                            <div>
                                <h4 className="font-bold text-gray-900 text-sm">Enable Live Payment Engine</h4>
                                <p className="text-xs text-gray-500 mt-0.5">When checked, shopkeepers can subscribe and pay you via Razorpay on the Pricing page.</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.is_live}
                                    onChange={e => setSettings({ ...settings, is_live: e.target.checked })}
                                />
                                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>

                    <div className="border-t pt-6 flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-indigo-700 transition disabled:opacity-50"
                        >
                            {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                            {saving ? 'Saving Keys...' : 'Secure & Save Keys'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    )
}
