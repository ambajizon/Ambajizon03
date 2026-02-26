'use client'

import { useState, useEffect } from 'react'
import { getCoupons, createCoupon, deleteCoupon } from '@/app/actions/marketing'
import { Ticket, Trash2, Plus, Loader2 } from 'lucide-react'
import { toast } from 'react-hot-toast'

export default function CouponsPage() {
    const [coupons, setCoupons] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        code: '',
        discount_type: 'percent',
        value: '',
        min_order_amount: '0',
        max_uses: '',
        expiry_date: ''
    })

    useEffect(() => {
        loadCoupons()
    }, [])

    async function loadCoupons() {
        setLoading(true)
        const data = await getCoupons()
        setCoupons(data)
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setSubmitting(true)
        try {
            const res = await createCoupon(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Coupon created successfully')
                setShowForm(false)
                loadCoupons()
                setFormData({ code: '', discount_type: 'percent', value: '', min_order_amount: '0', max_uses: '', expiry_date: '' })
            }
        } catch (error) {
            toast.error('Failed to submit form')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this coupon?')) return
        await deleteCoupon(id)
        loadCoupons()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Coupons</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={18} /> New Coupon
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4">Create Coupon</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Coupon Code</label>
                            <input
                                className="w-full border p-2 rounded uppercase font-bold"
                                required
                                value={formData.code}
                                onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Discount Type</label>
                            <select
                                className="w-full border p-2 rounded"
                                value={formData.discount_type}
                                onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                            >
                                <option value="percent">Percentage (%)</option>
                                <option value="flat">Flat Amount (₹)</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Value ({formData.discount_type === 'percent' ? '%' : '₹'})</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                required
                                value={formData.value}
                                onChange={e => setFormData({ ...formData, value: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Min Order Amount (₹)</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                value={formData.min_order_amount}
                                onChange={e => setFormData({ ...formData, min_order_amount: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Max Uses (Optional)</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="number"
                                value={formData.max_uses}
                                onChange={e => setFormData({ ...formData, max_uses: e.target.value })}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-1">Expiry Date</label>
                            <input
                                className="w-full border p-2 rounded"
                                type="date"
                                required
                                value={formData.expiry_date}
                                onChange={e => setFormData({ ...formData, expiry_date: e.target.value })}
                            />
                        </div>
                        <div className="md:col-span-2 pt-2 flex gap-2">
                            <button type="submit" disabled={submitting} className="bg-black text-white px-6 py-2 rounded font-bold">
                                {submitting ? <Loader2 className="animate-spin" /> : 'Create Coupon'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-6 py-2 rounded font-bold">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {coupons.map((coupon) => (
                    <div key={coupon.id} className="bg-white p-4 rounded-xl shadow-sm border relative group">
                        <button
                            onClick={() => handleDelete(coupon.id)}
                            className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"
                        >
                            <Trash2 size={18} />
                        </button>

                        <div className="flex items-center gap-3 mb-3">
                            <div className="bg-purple-50 text-purple-600 p-2 rounded-lg">
                                <Ticket size={24} />
                            </div>
                            <div>
                                <h3 className="font-bold text-gray-900 border-2 border-dashed border-gray-300 px-2 rounded font-mono bg-gray-50">
                                    {coupon.code}
                                </h3>
                            </div>
                        </div>

                        <div className="space-y-1 text-sm text-gray-600">
                            <p className="flex justify-between">
                                <span>Discount:</span>
                                <span className="font-bold text-green-600">
                                    {coupon.discount_type === 'percent' ? `${coupon.value}% OFF` : `₹${coupon.value} OFF`}
                                </span>
                            </p>
                            <p className="flex justify-between">
                                <span>Min Order:</span>
                                <span className="font-medium">₹{coupon.min_order_amount}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Expiring:</span>
                                <span className="font-medium">{new Date(coupon.expiry_date).toLocaleDateString()}</span>
                            </p>
                            <p className="flex justify-between">
                                <span>Used:</span>
                                <span className="font-medium">{coupon.used_count || 0} times</span>
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
