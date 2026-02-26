'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { getSegment, evaluateSegmentFilters } from '@/app/actions/crm_segments'
import { ArrowLeft, Download, MessageCircle, Users, Mail, MapPin, Tag, Smartphone, User } from 'lucide-react'
import toast from 'react-hot-toast'

export default function SegmentDetailPage() {
    const { id } = useParams()
    const router = useRouter()

    const [segment, setSegment] = useState<any>(null)
    const [customers, setCustomers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadData()
    }, [id])

    async function loadData() {
        setLoading(true)
        const segRes = await getSegment(id as string)
        if (segRes.error) {
            toast.error(segRes.error)
            router.push('/dashboard/crm/segments')
            return
        }

        setSegment(segRes.data)

        const custRes = await evaluateSegmentFilters(segRes.data.filters)
        if (custRes.data) {
            setCustomers(custRes.data)
        }
        setLoading(false)
    }

    function handleBulkWhatsApp() {
        if (customers.length === 0) return toast.error('No customers in this segment')
        const phones = customers.map(c => c.mobile || c.phone).filter(Boolean)
        if (phones.length === 0) return toast.error('No valid phone numbers found')

        const text = encodeURIComponent(`Hello from Ambajizon! We have a special offer for you.`)
        // Just demonstrating the intent, normally would use a real API like WATI or Interakt
        window.open(`https://wa.me/?text=${text}`, '_blank')
        toast.success(`Prepared WhatsApp broadcast for ${phones.length} customers.`)
    }

    function handleExportCSV() {
        if (customers.length === 0) return toast.error('No customers to export')

        const headers = ["Name", "Mobile", "Email", "City", "Tag", "Total Orders", "Total Spent"]
        const rows = customers.map(c => [
            `"${c.full_name || c.name || ''}"`,
            `"${c.mobile || c.phone || ''}"`,
            `"${c.email || ''}"`,
            `"${c.city || ''}"`,
            `"${c.tag || ''}"`,
            c.order_count || 0,
            c.total_spent || 0
        ])

        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", `segment_${segment.name.toLowerCase().replace(/\s+/g, '_')}_${new Date().toISOString().split('T')[0]}.csv`)
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
        toast.success('Segment exported to CSV')
    }

    function getTagStyle(tag: string) {
        if (!tag) return 'bg-gray-100 text-gray-700'
        const t = tag.toLowerCase()
        if (t === 'new') return 'bg-blue-100 text-blue-700'
        if (t === 'regular') return 'bg-green-100 text-green-700'
        if (t === 'vip') return 'bg-yellow-100 text-yellow-700'
        if (t === 'at-risk' || t === 'at risk') return 'bg-orange-100 text-orange-700'
        if (t === 'inactive') return 'bg-gray-200 text-gray-700'
        return 'bg-gray-100 text-gray-700'
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading segment criteria and matching customers...</div>
    if (!segment) return null

    return (
        <div className="max-w-7xl mx-auto space-y-6">
            <button onClick={() => router.push('/dashboard/crm/segments')} className="text-gray-500 hover:text-black flex items-center gap-2 mb-4 font-bold text-sm transition">
                <ArrowLeft size={16} /> Back to Segments
            </button>

            {/* Segment Header */}
            <div className="bg-white p-6 rounded-2xl shadow-sm border flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 mb-2">{segment.name}</h1>
                    <div className="flex flex-wrap gap-2 text-sm">
                        {segment.filters?.tags?.map((t: string) => <span key={t} className="bg-gray-100 text-gray-700 px-2 py-0.5 rounded uppercase font-bold text-[10px]">{t}</span>)}
                        {segment.filters?.city && <span className="bg-blue-50 text-blue-700 px-2 py-0.5 rounded uppercase font-bold text-[10px]">City: {segment.filters.city}</span>}
                        {segment.filters?.source && <span className="bg-purple-50 text-purple-700 px-2 py-0.5 rounded uppercase font-bold text-[10px]">Source: {segment.filters.source}</span>}
                        {segment.filters?.minSpent && <span className="bg-green-50 text-green-700 px-2 py-0.5 rounded uppercase font-bold text-[10px]">Spent &gt; ₹{segment.filters.minSpent}</span>}
                        {segment.filters?.daysSinceOrder && <span className="bg-orange-50 text-orange-700 px-2 py-0.5 rounded uppercase font-bold text-[10px]">Ordered in last {segment.filters.daysSinceOrder} days</span>}
                    </div>
                </div>

                <div className="flex bg-gray-50 p-3 rounded-xl gap-6 border">
                    <div className="text-center">
                        <div className="text-sm font-bold text-gray-500 mb-1">Total Matches</div>
                        <div className="text-3xl font-black text-primary">{customers.length}</div>
                    </div>
                </div>
            </div>

            {/* Actions Bar */}
            <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={handleBulkWhatsApp} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-[#25D366] text-white px-6 py-3 rounded-xl font-bold hover:bg-[#1da851] transition shadow-sm">
                    <MessageCircle size={20} /> Bulk WhatsApp Broadcast
                </button>
                <button onClick={handleExportCSV} className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white border-2 border-gray-200 text-gray-800 px-6 py-3 rounded-xl font-bold hover:border-black hover:text-black transition shadow-sm">
                    <Download size={20} /> Export CSV List
                </button>
            </div>

            {/* Customers Grid */}
            <div className="bg-white border rounded-2xl shadow-sm overflow-hidden">
                <div className="p-4 bg-gray-50 border-b flex justify-between items-center">
                    <h3 className="font-bold text-gray-900 flex items-center gap-2"><Users size={18} /> Customers in this Segment</h3>
                </div>

                {customers.length === 0 ? (
                    <div className="p-12 text-center text-gray-500">
                        No customers currently match the exact criteria of this segment.
                    </div>
                ) : (
                    <div className="divide-y">
                        {customers.map(c => (
                            <div key={c.id} className="p-4 hover:bg-blue-50/50 transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center font-bold text-gray-500 text-xl overflow-hidden shadow-inner border border-white">
                                        {c.full_name ? c.full_name.charAt(0).toUpperCase() : <User size={24} />}
                                    </div>
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <h4 className="font-bold text-gray-900 leading-none">{c.full_name || 'Unnamed Customer'}</h4>
                                            {c.tag && <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${getTagStyle(c.tag)}`}>{c.tag}</span>}
                                        </div>
                                        <div className="flex items-center gap-3 text-xs font-medium text-gray-500">
                                            {c.mobile && <span className="flex items-center gap-1"><Smartphone size={12} />{c.mobile}</span>}
                                            {c.city && <span className="flex items-center gap-1"><MapPin size={12} />{c.city}</span>}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4 items-center">
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-gray-900">₹{c.total_spent?.toLocaleString() || 0}</div>
                                        <div className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">{c.order_count || 0} Orders</div>
                                    </div>
                                    <button onClick={() => router.push(`/dashboard/crm/${c.id}`)} className="p-2 border rounded-lg hover:border-primary hover:text-primary transition bg-white ml-2 shadow-sm font-bold text-sm px-4">
                                        View Profile
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
