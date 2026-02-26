'use client'

import { useState, useEffect } from 'react'
import { getSegments, createSegment, deleteSegment, evaluateSegmentFilters, SegmentFilter } from '@/app/actions/crm_segments'
import { Plus, Users, Search, Filter, Trash2, Edit2, Play, Users2, Download, MessageCircle, X } from 'lucide-react'
import { useRouter } from 'next/navigation'
import toast from 'react-hot-toast'

export default function SegmentsPage() {
    const [segments, setSegments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [showCreate, setShowCreate] = useState(false)

    // Create Form State
    const [name, setName] = useState('')
    const [filterTags, setFilterTags] = useState<string[]>([])
    const [filterCity, setFilterCity] = useState('')
    const [filterSource, setFilterSource] = useState('')
    const [filterSpent, setFilterSpent] = useState('')
    const [filterDays, setFilterDays] = useState('')

    const [previewCount, setPreviewCount] = useState<number | null>(null)
    const [evaluating, setEvaluating] = useState(false)
    const [saving, setSaving] = useState(false)

    const router = useRouter()

    const TAG_OPTIONS = ['new', 'regular', 'vip', 'inactive', 'at-risk']
    const SOURCE_OPTIONS = ['tourist', 'referral', 'social', 'walk-in', 'other']

    useEffect(() => {
        loadSegments()
    }, [])

    async function loadSegments() {
        setLoading(true)
        const res = await getSegments()
        if (res.data) setSegments(res.data)
        setLoading(false)
    }

    // Evaluate live preview
    useEffect(() => {
        if (!showCreate) return

        const timer = setTimeout(async () => {
            setEvaluating(true)
            const filters: SegmentFilter = {
                tags: filterTags.length > 0 ? filterTags : undefined,
                city: filterCity || undefined,
                source: filterSource || undefined,
                minSpent: filterSpent ? Number(filterSpent) : undefined,
                daysSinceOrder: filterDays ? Number(filterDays) : undefined
            }

            const res = await evaluateSegmentFilters(filters)
            if (res.data) {
                setPreviewCount(res.data.length)
            } else {
                setPreviewCount(0)
            }
            setEvaluating(false)
        }, 800) // Debounce

        return () => clearTimeout(timer)
    }, [filterTags, filterCity, filterSource, filterSpent, filterDays, showCreate])

    const handleCreate = async () => {
        if (!name.trim()) return toast.error('Segment name is required')

        setSaving(true)
        const filters: SegmentFilter = {
            tags: filterTags.length > 0 ? filterTags : undefined,
            city: filterCity || undefined,
            source: filterSource || undefined,
            minSpent: filterSpent ? Number(filterSpent) : undefined,
            daysSinceOrder: filterDays ? Number(filterDays) : undefined
        }

        const res = await createSegment(name, filters)
        if (res.success) {
            toast.success('Segment created')
            setShowCreate(false)
            setName('')
            setFilterTags([])
            setFilterCity('')
            setFilterSource('')
            setFilterSpent('')
            setFilterDays('')
            loadSegments()
        } else {
            toast.error(res.error || 'Failed to create segment')
        }
        setSaving(false)
    }

    const handleDelete = async (id: string, e: React.MouseEvent) => {
        e.stopPropagation()
        if (!confirm('Are you sure you want to delete this segment?')) return
        const res = await deleteSegment(id)
        if (res.success) {
            toast.success('Segment deleted')
            setSegments(segments.filter(s => s.id !== id))
        } else {
            toast.error(res.error || 'Failed to delete segment')
        }
    }

    const toggleTag = (t: string) => {
        if (filterTags.includes(t)) setFilterTags(filterTags.filter(tg => tg !== t))
        else setFilterTags([...filterTags, t])
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading segments...</div>

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-2">
                        <Users2 className="text-primary" /> Customer Segments
                    </h1>
                    <p className="text-gray-500">Create targeted groups of customers for marketing campaigns.</p>
                </div>
                {!showCreate && (
                    <button onClick={() => setShowCreate(true)} className="bg-primary text-white px-6 py-2.5 rounded-full font-bold flex items-center gap-2 hover:bg-black transition shadow-lg shadow-primary/30">
                        <Plus size={18} /> Create Segment
                    </button>
                )}
            </div>

            {showCreate && (
                <div className="bg-white border rounded-2xl shadow-sm p-6 space-y-6 animate-in fade-in slide-in-from-top-4">
                    <div className="flex justify-between items-center border-b pb-4">
                        <h2 className="text-lg font-bold flex items-center gap-2"><Filter size={20} className="text-primary" /> New Segment Builder</h2>
                        <button onClick={() => setShowCreate(false)} className="p-2 hover:bg-gray-100 rounded-full text-gray-400 hover:text-gray-900 transition"><X size={20} /></button>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                        <div className="lg:col-span-2 space-y-6">
                            {/* Name */}
                            <div>
                                <label className="block text-sm font-bold text-gray-700 mb-1">Segment Name *</label>
                                <input placeholder="e.g. VIP Local Customers" value={name} onChange={e => setName(e.target.value)} className="w-full border p-2.5 rounded-lg outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition" />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-4 bg-gray-50 rounded-xl border border-gray-100">
                                {/* Tags */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Customer Tags</label>
                                    <div className="flex flex-wrap gap-2">
                                        {TAG_OPTIONS.map(t => (
                                            <button key={t} onClick={() => toggleTag(t)} className={`px-3 py-1 rounded-full text-xs font-bold uppercase transition ${filterTags.includes(t) ? 'bg-black text-white' : 'bg-white border text-gray-600 hover:border-black'}`}>
                                                {t.replace('-', ' ')}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Source */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Acquisition Source</label>
                                    <select value={filterSource} onChange={e => setFilterSource(e.target.value)} className="w-full border p-2 cursor-pointer rounded outline-none focus:border-primary text-sm bg-white">
                                        <option value="">Any Source</option>
                                        {SOURCE_OPTIONS.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                                    </select>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">City Contains</label>
                                    <input placeholder="e.g. Udaipur" value={filterCity} onChange={e => setFilterCity(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-primary text-sm bg-white" />
                                </div>

                                {/* Purchase Behavior */}
                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Total Spent More Than (₹)</label>
                                    <input type="number" placeholder="e.g. 5000" value={filterSpent} onChange={e => setFilterSpent(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-primary text-sm bg-white" />
                                </div>

                                <div>
                                    <label className="block text-sm font-bold text-gray-700 mb-2">Last Order Within (Days)</label>
                                    <input type="number" placeholder="e.g. 30" value={filterDays} onChange={e => setFilterDays(e.target.value)} className="w-full border p-2 rounded outline-none focus:border-primary text-sm bg-white" />
                                </div>
                            </div>
                        </div>

                        {/* Live Preview Pane */}
                        <div className="bg-blue-50 border border-blue-100 rounded-xl p-6 flex flex-col justify-between h-full">
                            <div>
                                <h3 className="font-bold text-blue-900 mb-2 flex items-center gap-2"><Play size={16} /> Live Preview</h3>
                                <p className="text-sm text-blue-800/80 mb-6">As you adjust the filters above, we will calculate how many customers currently match your criteria.</p>

                                <div className="bg-white p-6 rounded-xl shadow-sm text-center border border-blue-100">
                                    {evaluating ? (
                                        <div className="animate-pulse flex flex-col items-center py-4">
                                            <div className="h-8 w-16 bg-blue-100 rounded mb-2"></div>
                                            <div className="h-4 w-32 bg-blue-50 rounded"></div>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="text-5xl font-black text-blue-600 mb-2">{previewCount !== null ? previewCount : 0}</div>
                                            <div className="text-sm font-bold text-gray-500 uppercase">Customers Match</div>
                                        </>
                                    )}
                                </div>
                            </div>

                            <button
                                onClick={handleCreate}
                                disabled={saving || !name.trim()}
                                className="w-full bg-black text-white p-3 rounded-lg font-bold hover:bg-gray-800 transition disabled:opacity-50 mt-6"
                            >
                                {saving ? 'Saving...' : 'Save Segment'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Segments List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {segments.length === 0 && !showCreate ? (
                    <div className="col-span-full bg-white border border-dashed border-gray-300 p-12 rounded-2xl text-center">
                        <Users className="mx-auto text-gray-300 mb-4" size={48} />
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No segments created</h3>
                        <p className="text-gray-500 mb-4 max-w-sm mx-auto">Group your customers by their order history, location, or tags to send targeted WhatsApp campaigns.</p>
                        <button onClick={() => setShowCreate(true)} className="bg-black text-white px-6 py-2 rounded-full font-bold">Create First Segment</button>
                    </div>
                ) : segments.map(seg => (
                    <div key={seg.id} onClick={() => router.push(`/dashboard/crm/segments/${seg.id}`)} className="bg-white border rounded-xl p-5 shadow-sm hover:shadow-md hover:border-primary transition cursor-pointer group relative">

                        <div className="flex justify-between items-start mb-4">
                            <h3 className="font-bold text-lg text-gray-900 pr-8">{seg.name}</h3>
                            <button onClick={(e) => handleDelete(seg.id, e)} className="absolute top-4 right-4 p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition opacity-0 group-hover:opacity-100">
                                <Trash2 size={16} />
                            </button>
                        </div>

                        <div className="flex flex-wrap gap-2 mb-6">
                            {seg.filters?.tags?.map((t: string) => <span key={t} className="bg-gray-100 text-gray-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">{t}</span>)}
                            {seg.filters?.city && <span className="bg-blue-50 text-blue-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">City: {seg.filters.city}</span>}
                            {seg.filters?.minSpent && <span className="bg-green-50 text-green-700 text-[10px] font-bold uppercase px-2 py-0.5 rounded">&gt; ₹{seg.filters.minSpent}</span>}
                        </div>

                        <div className="pt-4 border-t flex justify-between items-center">
                            <div className="text-xs text-gray-500">{new Date(seg.created_at).toLocaleDateString()}</div>
                            <div className="flex items-center gap-1 text-primary font-bold text-sm">
                                View Customers &rarr;
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
