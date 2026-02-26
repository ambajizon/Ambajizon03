'use client'

import { useState, useEffect } from 'react'
import { getOffers, createOffer, deleteOffer } from '@/app/actions/marketing'
import { Megaphone, Trash2, Plus, Loader2, Calendar } from 'lucide-react'
import ImageCropUpload from '@/components/ImageCropUpload'
import Image from 'next/image'
import { toast } from 'react-hot-toast'

export default function OffersPage() {
    const [offers, setOffers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showForm, setShowForm] = useState(false)
    const [submitting, setSubmitting] = useState(false)

    // Form State
    const [formData, setFormData] = useState({
        name: '',
        banner_url: '',
        discount_type: 'percent',
        discount_value: '',
        applicable_to: 'all',
        start_date: '',
        end_date: '',
        is_enabled: true
    })

    useEffect(() => {
        loadOffers()
    }, [])

    async function loadOffers() {
        setLoading(true)
        const data = await getOffers()
        setOffers(data)
        setLoading(false)
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()

        setSubmitting(true)
        try {
            const res = await createOffer(formData)
            if (res.error) {
                toast.error(res.error)
            } else {
                toast.success('Offer created successfully')
                setShowForm(false)
                loadOffers()
                setFormData({ name: '', banner_url: '', discount_type: 'percent', discount_value: '', applicable_to: 'all', start_date: '', end_date: '', is_enabled: true })
            }
        } catch (error) {
            toast.error('Failed to submit offer')
        } finally {
            setSubmitting(false)
        }
    }

    async function handleDelete(id: string) {
        if (!confirm('Delete this offer?')) return
        await deleteOffer(id)
        loadOffers()
    }

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-gray-800">Festival Offers</h2>
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="bg-primary text-white px-4 py-2 rounded-lg font-bold flex items-center gap-2"
                >
                    <Plus size={18} /> New Offer
                </button>
            </div>

            {showForm && (
                <div className="bg-white p-6 rounded-xl border shadow-sm">
                    <h3 className="font-bold mb-4">Create Activity/Offer</h3>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="block text-sm font-medium mb-1">Offer Title</label>
                            <input
                                className="w-full border p-2 rounded"
                                required
                                value={formData.name}
                                onChange={e => setFormData({ ...formData, name: e.target.value })}
                                placeholder="e.g. Diwali Flash Sale"
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Applicable To</label>
                                <select
                                    className="w-full border p-2 rounded"
                                    value={formData.applicable_to}
                                    onChange={e => setFormData({ ...formData, applicable_to: e.target.value })}
                                >
                                    <option value="all">All Products</option>
                                    <option value="category">Specific Category</option>
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <label className="block text-sm font-medium mb-1">Discount</label>
                                    <input
                                        className="w-full border p-2 rounded"
                                        required
                                        type="number"
                                        value={formData.discount_value}
                                        onChange={e => setFormData({ ...formData, discount_value: e.target.value })}
                                        placeholder="Value"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-1">Type</label>
                                    <select
                                        className="w-full border p-2 rounded"
                                        value={formData.discount_type}
                                        onChange={e => setFormData({ ...formData, discount_type: e.target.value })}
                                    >
                                        <option value="percent">% Off</option>
                                        <option value="flat">₹ Off</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium mb-1">Banner Image</label>
                            <div className="h-40 w-full relative border-2 border-dashed border-gray-300 rounded-xl overflow-hidden bg-gray-50">
                                <ImageCropUpload
                                    label=""
                                    aspectRatio={3}
                                    recommendedSize="1200x400px"
                                    value={formData.banner_url}
                                    onChange={(url) => setFormData({ ...formData, banner_url: url })}
                                    folder="ambajizon/offers"
                                />
                                {formData.banner_url && (
                                    <Image src={formData.banner_url} alt="Available" fill className="object-cover" />
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-1">Start Date</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    type="date"
                                    required
                                    value={formData.start_date}
                                    onChange={e => setFormData({ ...formData, start_date: e.target.value })}
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-1">End Date</label>
                                <input
                                    className="w-full border p-2 rounded"
                                    type="date"
                                    required
                                    value={formData.end_date}
                                    onChange={e => setFormData({ ...formData, end_date: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="pt-2 flex gap-2">
                            <button type="submit" disabled={submitting} className="bg-black text-white px-6 py-2 rounded font-bold">
                                {submitting ? <Loader2 className="animate-spin" /> : 'Create Offer'}
                            </button>
                            <button type="button" onClick={() => setShowForm(false)} className="bg-gray-100 px-6 py-2 rounded font-bold">
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {offers.map((offer) => (
                    <div key={offer.id} className="bg-white rounded-xl shadow-sm border overflow-hidden relative group">
                        <div className="h-48 w-full relative bg-gray-100">
                            <Image src={offer.banner_url} alt={offer.name} fill className="object-cover" />
                            {/* Overlay for actions */}
                            <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition">
                                <button
                                    onClick={() => handleDelete(offer.id)}
                                    className="bg-white p-2 rounded-full text-red-500 hover:bg-red-50 shadow-sm"
                                >
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        </div>
                        <div className="p-4">
                            <h3 className="font-bold text-lg text-gray-900">{offer.name}</h3>
                            <div className="flex items-center gap-2 text-sm text-gray-500 mt-2">
                                <Calendar size={14} />
                                <span>{new Date(offer.start_date).toLocaleDateString()} - {new Date(offer.end_date).toLocaleDateString()}</span>
                            </div>
                            <div className={`mt-3 inline-block px-2 py-1 rounded text-xs font-bold uppercase
                                ${offer.is_enabled ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'}
                            `}>
                                {offer.is_enabled ? 'Active' : 'Disabled'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
