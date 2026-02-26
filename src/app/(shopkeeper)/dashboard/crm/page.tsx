'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { autoTagCustomers, bulkUpdateTag, bulkUpdateBanStatus, bulkUpdateCODStatus, bulkImportCustomers } from '@/app/actions/crm'
import toast from 'react-hot-toast'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Papa from 'papaparse'
import CustomerDetailClient from './CustomerDetailClient'

// Extended Customer Type
type Customer = {
    id: string
    name: string
    phone: string
    mobile?: string
    email: string | null
    city?: string
    source?: string
    loyalty_points?: number
    is_banned?: boolean
    cod_blocked?: boolean
    star_rating?: number
    created_at: string
    tag: string
    auto_tag: string
    total_spent: number
    order_count: number
    last_order_date: string | null
}

export default function CRMDashboard() {
    const router = useRouter()
    const [customers, setCustomers] = useState<Customer[]>([])
    const [loading, setLoading] = useState(true)

    // Filters UI
    const [search, setSearch] = useState('')
    const [filterTag, setFilterTag] = useState('')
    const [filterCity, setFilterCity] = useState('')
    const [filterSource, setFilterSource] = useState('')
    const [filterSpend, setFilterSpend] = useState('')
    const [filterLastOrder, setFilterLastOrder] = useState('')

    // Derived distinct values for dropdowns
    const [cities, setCities] = useState<string[]>([])

    // Bulk Select
    const [selectedIds, setSelectedIds] = useState<string[]>([])
    const [bulkAction, setBulkAction] = useState('')
    const [isApplyingBulk, setIsApplyingBulk] = useState(false)

    // CSV Import State
    const [showImport, setShowImport] = useState(false)
    const [importFile, setImportFile] = useState<File | null>(null)
    const [importPreview, setImportPreview] = useState<any[]>([])
    const [importing, setImporting] = useState(false)

    // Split View Selection
    const [selectedCustomerId, setSelectedCustomerId] = useState<string | null>(null)

    useEffect(() => {
        initData()
    }, [])

    async function initData() {
        setLoading(true)
        // Auto tag logic
        await autoTagCustomers()
        await loadCustomers()
    }

    async function loadCustomers() {
        try {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) return

            const { data: store } = await supabase.from('stores').select('id').eq('shopkeeper_id', user.id).maybeSingle()
            if (!store) return

            // Fetch customers
            const { data: customersData, error: customersError } = await supabase
                .from('customers')
                .select('*')
                .eq('store_id', store.id)
                .order('created_at', { ascending: false })

            if (customersData && customersData.length > 0) {
                const customerIds = customersData.map(c => c.id)

                // Fetch orders for these customers
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('customer_id, total_amount, created_at')
                    .in('customer_id', customerIds)

                const processed = customersData.map((c: any) => {
                    const customerOrders = ordersData && !ordersError ? ordersData.filter((o: any) => o.customer_id === c.id) : []
                    const totalSpent = customerOrders.reduce((sum: number, o: any) => sum + (Number(o.total_amount) || 0), 0) || 0
                    const orderCount = customerOrders.length || 0
                    const lastOrder = customerOrders.length > 0
                        ? new Date(Math.max(...customerOrders.map((o: any) => new Date(o.created_at).getTime()))).toISOString()
                        : null

                    return {
                        ...c,
                        name: c.full_name || 'Guest',
                        phone: c.mobile || '',
                        total_spent: totalSpent,
                        order_count: orderCount,
                        last_order_date: lastOrder,
                        tag: c.tag || 'New',
                        auto_tag: c.auto_tag || 'New',
                        loyalty_points: c.loyalty_points || 0,
                        star_rating: c.star_rating || 0
                    }
                })
                setCustomers(processed)

                // Extract distinct cities
                const distinctCities = Array.from(new Set(processed.map((c: any) => c.city).filter(Boolean))) as string[]
                setCities(distinctCities)
            } else {
                setCustomers([])
            }
        } catch (error) {
            console.error('Failed to load customers:', error)
        } finally {
            setLoading(false)
        }
    }

    // Filtering Logic
    const filteredCustomers = customers.filter(c => {
        // Search
        const s = search.toLowerCase()
        const matchesSearch = !search ||
            c.name.toLowerCase().includes(s) ||
            (c.phone && c.phone.includes(s)) ||
            (c.email && c.email.toLowerCase().includes(s))

        // Tag
        const matchesTag = !filterTag || c.tag === filterTag

        // City
        const matchesCity = !filterCity || c.city === filterCity

        // Source
        const matchesSource = !filterSource || c.source?.toLowerCase() === filterSource.toLowerCase()

        // Spend
        let matchesSpend = true
        if (filterSpend === '0-500') matchesSpend = c.total_spent >= 0 && c.total_spent <= 500
        if (filterSpend === '500-2000') matchesSpend = c.total_spent > 500 && c.total_spent <= 2000
        if (filterSpend === '2000+') matchesSpend = c.total_spent > 2000

        // Last Order
        let matchesLastOrder = true
        if (filterLastOrder) {
            if (!c.last_order_date) {
                matchesLastOrder = false
            } else {
                const daysSince = Math.floor((new Date().getTime() - new Date(c.last_order_date).getTime()) / (1000 * 3600 * 24))
                if (filterLastOrder === '7') matchesLastOrder = daysSince <= 7
                if (filterLastOrder === '30') matchesLastOrder = daysSince <= 30
                if (filterLastOrder === '60+') matchesLastOrder = daysSince >= 60
            }
        }

        return matchesSearch && matchesTag && matchesCity && matchesSource && matchesSpend && matchesLastOrder
    })

    function clearFilters() {
        setSearch('')
        setFilterTag('')
        setFilterCity('')
        setFilterSource('')
        setFilterSpend('')
        setFilterLastOrder('')
    }

    // Bulk selection
    const toggleSelectAll = () => {
        if (selectedIds.length === filteredCustomers.length) {
            setSelectedIds([])
        } else {
            setSelectedIds(filteredCustomers.map(c => c.id))
        }
    }

    const toggleSelect = (id: string) => {
        setSelectedIds(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
    }

    const handleBulkActionExecute = async () => {
        if (selectedIds.length === 0 || !bulkAction) return
        setIsApplyingBulk(true)

        if (bulkAction === 'whatsapp') {
            const phones = customers.filter(c => selectedIds.includes(c.id)).map(c => c.phone).filter(Boolean)
            if (phones.length > 0) {
                // In a real app we might use a WhatsApp business API. Here we just open one or copy them.
                const text = encodeURIComponent("Hello from Ambajizon!")
                window.open(`https://wa.me/?text=${text}`, '_blank')
                toast.success(`Generated WhatsApp link for ${phones.length} customers`)
            }
        } else if (bulkAction === 'export') {
            exportToCSV(customers.filter(c => selectedIds.includes(c.id)))
            toast.success('Exported selection')
        } else if (bulkAction.startsWith('tag:')) {
            const tag = bulkAction.split(':')[1]
            await bulkUpdateTag(selectedIds, tag)
            toast.success(`Applied ${tag} tag to ${selectedIds.length} customers`)
            await loadCustomers()
        } else if (bulkAction === 'ban') {
            await bulkUpdateBanStatus(selectedIds, true, 'Bulk Ban')
            toast.success(`Banned ${selectedIds.length} customers`)
            await loadCustomers()
        } else if (bulkAction === 'block_cod') {
            await bulkUpdateCODStatus(selectedIds, true, 'Bulk COD Block')
            toast.success(`Blocked COD for ${selectedIds.length} customers`)
            await loadCustomers()
        }

        setIsApplyingBulk(false)
        setBulkAction('')
        setSelectedIds([])
    }

    function exportToCSV(customerList: Customer[] = filteredCustomers) {
        if (customerList.length === 0) return

        const headers = ["Name", "Mobile", "Email", "City", "Tag", "Total Orders", "Total Spent", "Last Order Date", "Status"]
        const rows = customerList.map(c => [
            `"${c.name}"`,
            `"${c.phone || c.mobile || ''}"`,
            `"${c.email || ''}"`,
            `"${c.city || ''}"`,
            `"${c.tag}"`,
            c.order_count,
            c.total_spent,
            c.last_order_date ? new Date(c.last_order_date).toLocaleDateString() : 'Never',
            c.is_banned ? 'Banned' : (c.cod_blocked ? 'COD Blocked' : 'Active')
        ])
        const csvContent = "data:text/csv;charset=utf-8,"
            + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", `customers_${new Date().toISOString().split('T')[0]}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // --- CSV Import Handlers ---
    function downloadTemplate() {
        const headers = ["Name", "Mobile", "Email", "City", "Source", "Tag"]
        const rows = [
            ["Raj Kumar", "9876543210", "raj@example.com", "Udaipur", "tourist", "new"]
        ]
        const csvContent = "data:text/csv;charset=utf-8," + [headers.join(","), ...rows.map(e => e.join(","))].join("\n")
        const encodedUri = encodeURI(csvContent)
        const link = document.createElement("a")
        link.setAttribute("href", encodedUri)
        link.setAttribute("download", "customer_import_template.csv")
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        if (!e.target.files || e.target.files.length === 0) return
        setImportFile(e.target.files[0])

        Papa.parse(e.target.files[0], {
            header: true,
            skipEmptyLines: true,
            complete: function (results) {
                setImportPreview(results.data.slice(0, 5)) // Preview first 5
            }
        })
    }

    async function executeImport() {
        if (!importFile) return
        setImporting(true)

        Papa.parse(importFile, {
            header: true,
            skipEmptyLines: true,
            complete: async function (results) {
                const rows = results.data
                const res = await bulkImportCustomers(rows)
                if (res.success) {
                    toast.success(`Imported ${res.count} customers. Skipped ${res.skipped} duplicates.`)
                    setShowImport(false)
                    setImportFile(null)
                    setImportPreview([])
                    await loadCustomers()
                } else {
                    toast.error(res.error || 'Import failed')
                }
                setImporting(false)
            },
            error: function (error) {
                toast.error('Error parsing file: ' + error.message)
                setImporting(false)
            }
        })
    }

    function getTagColor(tag: string) {
        if (!tag) return 'bg-gray-100 text-gray-700'
        const t = tag.toLowerCase()
        if (t === 'new') return 'bg-blue-100 text-blue-700'
        if (t === 'regular') return 'bg-green-100 text-green-700'
        if (t === 'vip') return 'bg-yellow-100 text-yellow-700'
        if (t === 'at risk') return 'bg-orange-100 text-orange-700'
        if (t === 'inactive') return 'bg-gray-200 text-gray-700'
        if (t === 'banned') return 'bg-red-100 text-red-700'
        return 'bg-gray-100 text-gray-700'
    }

    return (
        <div className="h-[calc(100vh-[var(--header-height,64px)]-2rem)] lg:h-[calc(100vh-100px)] flex flex-col lg:flex-row gap-0 lg:gap-6 pb-20 lg:pb-0">
            {/* LEFT COLUMN: List */}
            <div className={`w-full lg:w-[380px] xl:w-[420px] shrink-0 flex flex-col h-full bg-white lg:rounded-2xl lg:shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] lg:border border-gray-100 ${selectedCustomerId ? 'hidden lg:flex' : 'flex'}`}>
                {/* Header & Search */}
                <div className="p-4 border-b border-gray-100 space-y-4 shrink-0 bg-white/95 backdrop-blur-md z-10 sticky top-0 lg:rounded-t-2xl">
                    <div className="flex items-center justify-between">
                        <h1 className="text-xl font-black text-gray-900 tracking-tight">Customers</h1>
                        <div className="flex items-center gap-2">
                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition border border-gray-100 flex items-center justify-center leading-none" onClick={() => exportToCSV(filteredCustomers)} title="Export CSV">
                                <span className="material-symbols-outlined text-[16px]">download</span>
                            </button>
                            <button className="p-2 bg-gray-50 text-gray-600 rounded-lg hover:bg-gray-100 transition border border-gray-100 flex items-center justify-center leading-none" onClick={() => setShowImport(true)} title="Import CSV">
                                <span className="material-symbols-outlined text-[16px]">upload</span>
                            </button>
                            <button className="p-2 bg-black text-white rounded-lg hover:bg-gray-800 transition shadow-[0_2px_10px_rgba(0,0,0,0.1)] active:scale-95 flex items-center justify-center leading-none" onClick={() => router.push('/dashboard/crm/new')} title="Add Customer">
                                <span className="material-symbols-outlined text-[16px]">add</span>
                            </button>
                        </div>
                    </div>

                    <div className="relative group">
                        <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors text-[18px]">search</span>
                        <input
                            className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-xl text-sm bg-gray-50 focus:bg-white outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all font-medium placeholder:font-normal"
                            placeholder="Search names, phones, emails..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>

                    {/* Quick Filters */}
                    <div className="flex gap-2 overflow-x-auto hide-scrollbar pb-1 -mx-4 px-4 lg:mx-0 lg:px-0 relative">
                        {/* Gradient mask for edge */}
                        <div className="absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-white to-transparent pointer-events-none lg:hidden"></div>

                        <select className="border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-2 bg-white outline-none hover:bg-gray-50 cursor-pointer shrink-0 text-gray-700 shadow-sm" value={filterTag} onChange={e => setFilterTag(e.target.value)}>
                            <option value="">All Tags</option>
                            <option value="New">New</option>
                            <option value="Regular">Regular</option>
                            <option value="VIP">VIP</option>
                            <option value="At Risk">At Risk</option>
                            <option value="Inactive">Inactive</option>
                        </select>
                        <select className="border border-gray-200 rounded-lg text-xs font-bold py-1.5 px-2 bg-white outline-none hover:bg-gray-50 cursor-pointer shrink-0 text-gray-700 shadow-sm" value={filterCity} onChange={e => setFilterCity(e.target.value)}>
                            <option value="">All Cities</option>
                            {cities.map((city, idx) => <option key={idx} value={city}>{city}</option>)}
                        </select>
                        <button className="text-[10px] font-bold text-gray-400 hover:text-gray-600 px-2 uppercase tracking-wider shrink-0" onClick={clearFilters}>
                            Clear
                        </button>
                    </div>

                    {/* Bulk Actions (Visible if selected) */}
                    {selectedIds.length > 0 && (
                        <div className="flex items-center justify-between bg-blue-50/80 p-2.5 rounded-xl border border-blue-200/60 shadow-inner animate-in slide-in-from-top-2 fade-in duration-200">
                            <div className="text-xs font-bold text-blue-800 flex items-center gap-2">
                                <span className="material-symbols-outlined cursor-pointer text-blue-600 hover:scale-110 active:scale-95 transition-transform text-[18px]" onClick={toggleSelectAll}>check_box</span>
                                {selectedIds.length} <span className="hidden sm:inline">selected</span>
                            </div>
                            <div className="flex gap-1.5">
                                <select
                                    className="border border-blue-200 rounded-lg px-2 py-1.5 text-xs font-medium outline-none bg-white text-blue-900 shadow-sm min-w-[100px]"
                                    value={bulkAction}
                                    onChange={e => setBulkAction(e.target.value)}
                                >
                                    <option value="">Action...</option>
                                    <option value="whatsapp">💬 WhatsApp</option>
                                    <optgroup label="Apply Tag">
                                        <option value="tag:New">🏷️ Tag: New</option>
                                        <option value="tag:Regular">🏷️ Tag: Regular</option>
                                        <option value="tag:VIP">🏷️ Tag: VIP</option>
                                    </optgroup>
                                    <optgroup label="Controls">
                                        <option value="ban">🚫 Ban Selected</option>
                                        <option value="block_cod">💳 Block COD</option>
                                    </optgroup>
                                </select>
                                <button
                                    disabled={!bulkAction || isApplyingBulk}
                                    onClick={handleBulkActionExecute}
                                    className="bg-blue-600 text-white px-3 py-1.5 rounded-lg text-xs font-bold hover:bg-blue-700 disabled:opacity-50 transition shadow-sm active:scale-95"
                                >
                                    Go
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* List Body */}
                <div className="flex-1 overflow-y-auto hide-scrollbar p-3 space-y-2 bg-gray-50/30 lg:bg-white lg:rounded-b-2xl pb-safe">
                    {loading ? (
                        <div className="p-12 text-center flex flex-col items-center border-[3px] border-dashed border-gray-100 rounded-2xl mx-1 my-4">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin mb-4" />
                            <p className="text-sm text-gray-500 font-bold">Loading customers...</p>
                        </div>
                    ) : filteredCustomers.length === 0 ? (
                        <div className="py-16 text-center text-gray-500 bg-gray-50/50 rounded-2xl border-2 border-dashed border-gray-100 m-2 flex flex-col items-center">
                            <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3">account_circle</span>
                            <p className="font-bold text-gray-900 text-lg">No customers found</p>
                            <p className="text-xs mt-1 text-gray-500 font-medium max-w-[200px] mx-auto">Try changing your filters or adding one manually.</p>
                            {Object.values({ search, filterTag, filterCity }).some(v => v) && (
                                <button onClick={clearFilters} className="mt-4 text-xs font-bold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition">Clear All Filters</button>
                            )}
                        </div>
                    ) : (
                        filteredCustomers.map(customer => {
                            const isSelectedItem = selectedCustomerId === customer.id;
                            const isChecked = selectedIds.includes(customer.id);
                            return (
                                <div
                                    key={customer.id}
                                    onClick={() => setSelectedCustomerId(customer.id)}
                                    className={`relative flex items-center gap-3.5 p-3 rounded-2xl cursor-pointer transition-all border group ${isSelectedItem ? 'bg-blue-50/80 border-blue-200/80 shadow-[0_4px_12px_-4px_rgba(59,130,246,0.15)] ring-1 ring-blue-100' : 'bg-white border-gray-100/80 hover:border-gray-300 hover:shadow-[0_4px_12px_-4px_rgba(0,0,0,0.05)] shadow-sm'}`}
                                >
                                    {/* Action Indicators */}
                                    <div className="absolute top-2.5 right-2.5 flex gap-1 z-10 transition-opacity">
                                        {customer.is_banned && <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_0_2px_white]" title="Banned" />}
                                        {!customer.is_banned && customer.cod_blocked && <div className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_0_2px_white]" title="COD Blocked" />}
                                    </div>

                                    {/* Checkbox */}
                                    <div
                                        onClick={(e) => { e.stopPropagation(); toggleSelect(customer.id) }}
                                        className="shrink-0 p-1 -ml-1 cursor-pointer group/check"
                                    >
                                        <span className={`material-symbols-outlined text-[20px] ${isChecked ? 'text-blue-600' : 'text-gray-200 group-hover/check:text-gray-400'} transition-colors`}>
                                            {isChecked ? 'check_box' : 'check_box_outline_blank'}
                                        </span>
                                    </div>

                                    {/* Avatar */}
                                    <div className={`w-[46px] h-[46px] rounded-full flex items-center justify-center font-black text-lg shrink-0 shadow-sm border-[1.5px] transition-colors ${isSelectedItem ? 'bg-gradient-to-br from-blue-50 to-white text-blue-700 border-blue-200' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                        {customer.name.charAt(0).toUpperCase()}
                                    </div>

                                    {/* Content */}
                                    <div className="flex-1 min-w-0 pr-2">
                                        <div className="flex items-center gap-2 mb-0.5">
                                            <h3 className={`font-bold truncate text-[15px] leading-tight ${isSelectedItem ? 'text-blue-900' : 'text-gray-900'}`}>{customer.name}</h3>
                                            <span className={`text-[9px] font-black px-1.5 py-[3px] rounded uppercase tracking-widest shrink-0 ${getTagColor(customer.tag)}`}>
                                                {customer.tag}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 mt-0.5">
                                            <p className={`text-xs truncate font-medium tracking-tight ${isSelectedItem ? 'text-blue-600/90' : 'text-gray-500'}`}>{customer.phone || 'No phone'} {customer.city ? `• ${customer.city}` : ''}</p>
                                        </div>
                                        <div className="flex items-center gap-2 mt-1.5">
                                            <p className={`text-[11px] font-black tracking-wider ${isSelectedItem ? 'text-blue-700' : 'text-green-700'}`}>₹{customer.total_spent.toLocaleString()} spent</p>
                                            <span className="text-gray-200 text-[10px]">&bull;</span>
                                            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{customer.order_count} Orders</p>
                                        </div>
                                    </div>
                                </div>
                            )
                        })
                    )}
                </div>
            </div>

            {/* RIGHT COLUMN: Details View */}
            <div className={`flex-1 h-full bg-gray-50/50 lg:bg-white lg:rounded-2xl lg:shadow-[0_4px_40px_-10px_rgba(0,0,0,0.08)] lg:border border-gray-200/60 overflow-hidden relative ${!selectedCustomerId ? 'hidden lg:flex items-center justify-center' : 'flex flex-col'}`}>
                {!selectedCustomerId ? (
                    <div className="text-center p-8 max-w-md animate-in fade-in duration-500 zoom-in-95">
                        <div className="w-[120px] h-[120px] bg-gradient-to-br from-gray-50 to-gray-100 rounded-full flex items-center justify-center mx-auto mb-6 border-[10px] border-white shadow-[0_10px_30px_-10px_rgba(0,0,0,0.1)] relative">
                            <span className="material-symbols-outlined text-[48px] text-gray-300">person</span>
                            <div className="absolute -bottom-1 -right-1 bg-white rounded-full p-2.5 border border-gray-100 shadow-[0_4px_15px_rgba(0,0,0,0.08)] flex items-center justify-center leading-none">
                                <span className="material-symbols-outlined text-[18px] text-blue-500">filter_alt</span>
                            </div>
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-3 tracking-tight">Select a Customer</h2>
                        <p className="text-sm text-gray-500 font-medium leading-relaxed">Choose a customer from the left list to view their complete profile, order history, analytics, and private notes.</p>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto hide-scrollbar z-20">
                        <CustomerDetailClient
                            customerId={selectedCustomerId}
                            onClose={() => setSelectedCustomerId(null)}
                        />
                    </div>
                )}
            </div>

            {/* CSV Import Modal */}
            {showImport && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-3xl p-8 w-full max-w-2xl shadow-2xl animate-in zoom-in-95 fade-in border border-gray-100">
                        <div className="flex justify-between items-start mb-8">
                            <div>
                                <h2 className="text-2xl font-black text-gray-900 flex items-center gap-3 tracking-tight"><span className="material-symbols-outlined text-blue-600 text-[28px]">upload</span> Bulk Import Customers</h2>
                                <p className="text-sm text-gray-500 mt-1.5 font-medium">Upload a CSV file to add multiple customers at once.</p>
                            </div>
                            <button onClick={() => setShowImport(false)} className="p-2.5 bg-gray-50 rounded-full hover:bg-gray-200 transition-colors flex items-center justify-center leading-none active:scale-95">
                                <span className="material-symbols-outlined text-[20px] text-gray-600">close</span>
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div className="bg-blue-50/80 border border-blue-200/60 p-5 rounded-2xl flex items-start gap-4 shadow-inner">
                                <span className="material-symbols-outlined text-blue-600 shrink-0 mt-0.5 text-[24px]">info</span>
                                <div>
                                    <h4 className="font-bold text-blue-900 text-sm">Need a template?</h4>
                                    <p className="text-xs text-blue-800/80 mt-1.5 mb-3 font-medium leading-relaxed">Download our sample CSV file to ensure your data is formatted correctly before uploading.</p>
                                    <button onClick={downloadTemplate} className="text-xs font-bold bg-white text-blue-700 px-4 py-2 rounded-xl border border-blue-200 shadow-sm hover:shadow-md hover:bg-white active:scale-95 transition-all flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[14px]">description</span> Download Template
                                    </button>
                                </div>
                            </div>

                            <div className="border-2 border-dashed border-gray-300 rounded-2xl p-10 text-center bg-gray-50/50 hover:bg-gray-50 hover:border-gray-400 transition-all relative group cursor-pointer">
                                <input type="file" accept=".csv" onChange={handleFileChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10" />
                                <div className="w-16 h-16 bg-white rounded-full shadow-sm border border-gray-100 flex items-center justify-center mx-auto mb-4 group-hover:scale-110 transition-transform duration-300">
                                    <span className="material-symbols-outlined text-[28px] text-gray-400 group-hover:text-blue-500 transition-colors">upload</span>
                                </div>
                                <p className="font-black text-gray-900 text-base tracking-tight mb-1 group-hover:text-blue-600 transition-colors">Click or drag CSV file here</p>
                                <p className="text-xs text-gray-500 font-medium">{importFile?.name ? <span className="text-blue-600 font-bold bg-blue-50 px-2 py-1 rounded">{importFile.name}</span> : 'Excel and Numbers files must be saved as CSV'}</p>
                            </div>

                            {importPreview.length > 0 && (
                                <div className="border rounded-2xl overflow-hidden shadow-sm">
                                    <div className="bg-gray-50/80 p-3.5 border-b text-xs font-bold text-gray-700 uppercase tracking-widest flex items-center gap-2">
                                        <span className="material-symbols-outlined text-[16px] text-green-500">check_circle</span> Preview (First 5 rows)
                                    </div>
                                    <div className="overflow-x-auto hide-scrollbar">
                                        <table className="w-full text-left text-sm whitespace-nowrap">
                                            <thead className="bg-white border-b border-gray-100">
                                                <tr>
                                                    {Object.keys(importPreview[0]).map(key => (
                                                        <th key={key} className="p-3.5 text-gray-500 font-bold text-xs uppercase tracking-wider">{key}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {importPreview.map((row, i) => (
                                                    <tr key={i} className="border-b border-gray-50 last:border-0 hover:bg-gray-50/50 transition-colors">
                                                        {Object.values(row).map((val: any, j) => (
                                                            <td key={j} className="p-3.5 font-medium text-gray-800">{String(val).substring(0, 30)}{String(val).length > 30 ? '...' : ''}</td>
                                                        ))}
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            )}

                            <div className="flex justify-end gap-3 pt-6 border-t border-gray-100">
                                <button onClick={() => setShowImport(false)} className="px-5 py-2.5 font-bold text-gray-600 hover:bg-gray-100 rounded-xl transition-colors active:scale-95">Cancel</button>
                                <button onClick={executeImport} disabled={!importFile || importing} className="px-6 py-2.5 font-bold text-white bg-black hover:bg-gray-900 rounded-xl transition-all shadow-[0_4px_14px_rgba(0,0,0,0.15)] hover:shadow-[0_6px_20px_rgba(0,0,0,0.2)] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 active:scale-95">
                                    {importing ? (
                                        <><div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> Importing...</>
                                    ) : 'Confirm Import'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
