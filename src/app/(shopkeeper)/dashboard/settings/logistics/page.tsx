'use client'

import { useState } from 'react'
import { saveShippingSettings } from '@/app/actions/shipping'
import { Truck, Save } from 'lucide-react'

export default function LogisticsSettings() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)

    async function handleSave(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        const res = await saveShippingSettings(email, password)
        if (res.success) {
            alert('Settings saved!')
        } else {
            alert('Error: ' + res.error)
        }
        setLoading(false)
    }

    return (
        <div className="max-w-2xl mx-auto space-y-6">
            <h1 className="text-2xl font-bold text-gray-900">Logistics Integration</h1>

            <div className="bg-white p-6 rounded-xl shadow-sm border">
                <div className="flex items-center gap-4 mb-6">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-purple-600">
                        <Truck size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-lg">Shiprocket</h2>
                        <p className="text-sm text-gray-500">Automate your shipping by connecting Shiprocket.</p>
                    </div>
                </div>

                <form onSubmit={handleSave} className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shiprocket Email</label>
                        <input
                            type="email"
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Shiprocket Password</label>
                        <input
                            type="password"
                            required
                            className="w-full border rounded-lg p-2 outline-none focus:ring-2 focus:ring-purple-500"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                        />
                        <p className="text-xs text-gray-400 mt-1">Stored securely using AES-256 encryption.</p>
                    </div>

                    <div className="pt-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="flex items-center gap-2 bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 transition disabled:opacity-50"
                        >
                            <Save size={18} /> {loading ? 'Saving...' : 'Save Credentials'}
                        </button>
                    </div>
                </form>

                <div className="mt-6 border-t pt-4">
                    <p className="text-sm text-gray-500">
                        Don't have an account? <a href="https://www.shiprocket.in/" target="_blank" className="text-purple-600 hover:underline">Sign up for Shiprocket</a>.
                    </p>
                </div>
            </div>
        </div>
    )
}
