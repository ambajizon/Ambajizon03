'use client'

import { useState, useEffect } from 'react'
import { savePaymentSettings, getPaymentSettings } from '@/app/actions/payment'
import { Loader2, Save, Wifi, WifiOff, Eye, EyeOff } from 'lucide-react'

export default function PaymentSettings({ storeId }: { storeId: string }) {
    const [keyId, setKeyId] = useState('')
    const [keySecret, setKeySecret] = useState('')
    const [isCodEnabled, setIsCodEnabled] = useState(true)
    const [loading, setLoading] = useState(false)
    const [fetching, setFetching] = useState(true)
    const [showSecret, setShowSecret] = useState(false)
    const [message, setMessage] = useState('')

    useEffect(() => {
        async function load() {
            setFetching(true)
            const data = await getPaymentSettings(storeId)
            if (data) {
                setKeyId(data.razorpay_key_id || '')
                setIsCodEnabled(data.is_cod_enabled)
            }
            setFetching(false)
        }
        load()
    }, [storeId])

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        const res = await savePaymentSettings(storeId, keyId, keySecret, isCodEnabled)

        if (res.error) {
            setMessage('Error: ' + res.error)
        } else {
            setMessage('Settings saved successfully!')
            setKeySecret('') // Clear secret input after save for security
        }
        setLoading(false)
    }

    if (fetching) return <div className="p-8 text-center text-gray-500">Loading settings...</div>

    return (
        <div className="max-w-2xl bg-white p-6 rounded-xl border shadow-sm">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Payment Configuration</h2>

            <form onSubmit={handleSave} className="space-y-6">

                {/* Razorpay Section */}
                <div className="space-y-4 border-b pb-6">
                    <h3 className="font-bold text-gray-800 flex items-center gap-2">
                        Online Payments (Razorpay)
                        {keyId ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full">Connected</span> : <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full">Not Configured</span>}
                    </h3>
                    <p className="text-sm text-gray-500">Enter your Razorpay API Keys to accept online payments directly to your account.</p>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key ID</label>
                        <input
                            type="text"
                            value={keyId}
                            onChange={e => setKeyId(e.target.value)}
                            className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm"
                            placeholder="rzp_test_..."
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Key Secret</label>
                        <div className="relative">
                            <input
                                type={showSecret ? "text" : "password"}
                                value={keySecret}
                                onChange={e => setKeySecret(e.target.value)}
                                className="w-full border rounded-lg p-2 focus:ring-2 focus:ring-primary outline-none font-mono text-sm pr-10"
                                placeholder={keyId ? "••••••••••••••••" : "Enter Key Secret"}
                            />
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                            >
                                {showSecret ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">Updates only if you enter a new value.</p>
                    </div>
                </div>

                {/* COD Section */}
                <div className="space-y-4 pb-2">
                    <div className="flex items-center justify-between">
                        <div>
                            <h3 className="font-bold text-gray-800">Cash on Delivery (COD)</h3>
                            <p className="text-sm text-gray-500">Allow customers to pay when they receive the order.</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => setIsCodEnabled(!isCodEnabled)}
                            className={`w-12 h-6 rounded-full transition-colors relative ${isCodEnabled ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform shadow-sm ${isCodEnabled ? 'left-7' : 'left-1'}`} />
                        </button>
                    </div>
                </div>

                {message && (
                    <div className={`p-3 rounded-lg text-sm font-medium text-center ${message.includes('Error') ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
                        {message}
                    </div>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full bg-black text-white py-3 rounded-lg font-bold hover:opacity-90 transition flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                    Save Settings
                </button>
            </form>
        </div>
    )
}
