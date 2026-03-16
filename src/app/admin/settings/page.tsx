'use client'

import { useState, useEffect } from 'react'
import { getAdminSettings, saveAdminSettings } from '@/app/actions/admin'
import { Loader2, Settings, Users, ShieldAlert, Save } from 'lucide-react'
import toast from 'react-hot-toast'

export default function AdminGeneralSettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('General')
    const [settings, setSettings] = useState({
        full_name: '',
        onboarding_price: 9999,
        yearly_price: 6999,
        maintenance_mode: false,
        terms_conditions: '',
        privacy_policy: '',
        returns_policy: '',
        refunds_policy: '',
        shipping_policy: '',
        disclaimer: ''
    })

    useEffect(() => {
        loadData()
    }, [])

    async function loadData() {
        setLoading(true)
        const data = await getAdminSettings()
        if (data) {
            setSettings({
                full_name: data.full_name || 'Admin',
                onboarding_price: data.onboarding_price || 9999,
                yearly_price: data.yearly_price || 6999,
                maintenance_mode: data.maintenance_mode || false,
                terms_conditions: data.terms_conditions || '',
                privacy_policy: data.privacy_policy || '',
                returns_policy: data.returns_policy || '',
                refunds_policy: data.refunds_policy || '',
                shipping_policy: data.shipping_policy || '',
                disclaimer: data.disclaimer || '',
            })
        }
        setLoading(false)
    }

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setSaving(true)

        const res = await saveAdminSettings(settings)

        setSaving(false)
        if (res.success) {
            toast.success('General Settings Saved')
        } else {
            toast.error(res.error || 'Failed to save')
        }
    }

    if (loading) return <div className="p-8"><Loader2 className="animate-spin text-indigo-500 mx-auto" /></div>

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex space-x-1 overflow-x-auto hide-scrollbar bg-gray-100 p-1 rounded-xl mb-6">
                {['General', 'Policies'].map(tab => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex-1 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <form onSubmit={handleSave} className="space-y-6">

                {/* General Tab */}
                <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'General' ? 'block' : 'hidden'}`}>

                    {/* Profile Settings */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 border-b pb-4 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Settings size={20} /></div>
                            <h2 className="text-lg font-bold text-gray-900">Admin Profile</h2>
                        </div>
                        <div className="max-w-md">
                            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                            <input
                                required
                                type="text"
                                className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm"
                                value={settings.full_name}
                                onChange={e => setSettings({ ...settings, full_name: e.target.value })}
                            />
                        </div>
                    </div>

                    {/* Team Members */}
                    <div className="bg-white rounded-xl shadow-sm border p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                        <div className="flex gap-4 items-center">
                            <div className="p-4 bg-gray-100 rounded-full text-gray-700 font-bold text-xl w-14 h-14 flex items-center justify-center">
                                {settings.full_name.charAt(0) || 'A'}
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900">{settings.full_name}</h3>
                                <p className="text-sm text-gray-500">Super Administrator</p>
                                <span className="inline-block px-2 py-0.5 mt-1 bg-green-100 text-green-700 text-[10px] font-bold uppercase rounded">Active</span>
                            </div>
                        </div>
                        <button type="button" onClick={() => alert('Invite flow in development')} className="px-4 py-2 bg-gray-100 font-bold text-sm rounded-lg hover:bg-gray-200 text-gray-700 flex items-center gap-2">
                            <Users size={16} /> Invite Member
                        </button>
                    </div>

                    {/* Pricing Rules */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 border-b pb-4 mb-6">
                            <div className="p-2 bg-green-50 text-green-600 rounded-lg">₹</div>
                            <h2 className="text-lg font-bold text-gray-900">Global Pricing Policy</h2>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-2xl">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Onboarding Setup Fee (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                                    value={settings.onboarding_price}
                                    onChange={e => setSettings({ ...settings, onboarding_price: Number(e.target.value) })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Yearly Renewal Fee (₹)</label>
                                <input
                                    required
                                    type="number"
                                    className="w-full px-4 py-2 border rounded-lg bg-gray-50 outline-none focus:ring-2 focus:ring-indigo-500 text-sm font-mono"
                                    value={settings.yearly_price}
                                    onChange={e => setSettings({ ...settings, yearly_price: Number(e.target.value) })}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Advanced / Maintenance */}
                    <div className="bg-red-50 rounded-xl border border-red-100 p-6">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 text-red-600 rounded-lg"><ShieldAlert size={20} /></div>
                                <div>
                                    <h2 className="text-lg font-bold text-red-900">Platform Maintenance Mode</h2>
                                    <p className="text-sm text-red-700 mt-1">If enabled, the public marketplace will display a "Down for Maintenance" page to visitors.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={settings.maintenance_mode}
                                    onChange={e => setSettings({ ...settings, maintenance_mode: e.target.checked })}
                                />
                                <div className="w-14 h-7 bg-red-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
                            </label>
                        </div>
                    </div>
                </div>

                {/* Policies Tab */}
                <div className={`space-y-6 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'Policies' ? 'block' : 'hidden'}`}>
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 border-b pb-4 mb-6">
                            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg"><Settings size={20} /></div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900">Platform Policies</h2>
                                <p className="text-sm text-gray-500 mt-1">Configure global legal pages required for SaaS compliance.</p>
                            </div>
                        </div>
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Terms & Conditions</label>
                                <textarea
                                    value={settings.terms_conditions}
                                    onChange={e => setSettings({ ...settings, terms_conditions: e.target.value })}
                                    placeholder="Enter platform terms of service..."
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Privacy Policy</label>
                                <textarea
                                    value={settings.privacy_policy}
                                    onChange={e => setSettings({ ...settings, privacy_policy: e.target.value })}
                                    placeholder="Explain how you handle platform data..."
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Returns & Cancellations</label>
                                <textarea
                                    value={settings.returns_policy}
                                    onChange={e => setSettings({ ...settings, returns_policy: e.target.value })}
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Refunds Policy</label>
                                <textarea
                                    value={settings.refunds_policy}
                                    onChange={e => setSettings({ ...settings, refunds_policy: e.target.value })}
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Shipping Policy</label>
                                <textarea
                                    value={settings.shipping_policy}
                                    onChange={e => setSettings({ ...settings, shipping_policy: e.target.value })}
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="block text-sm font-bold text-gray-700">Disclaimer</label>
                                <textarea
                                    value={settings.disclaimer}
                                    onChange={e => setSettings({ ...settings, disclaimer: e.target.value })}
                                    className="w-full rounded-md border p-3 text-sm min-h-[120px] outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-4 flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="bg-gray-900 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:bg-gray-800 transition disabled:opacity-50 shadow-md"
                    >
                        {saving ? <Loader2 className="animate-spin" size={18} /> : <Save size={18} />}
                        {saving ? 'Saving Framework...' : 'Save Changes'}
                    </button>
                </div>
            </form>
        </div>
    )
}
