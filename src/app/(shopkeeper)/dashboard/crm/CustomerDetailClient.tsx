'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { getCustomerProfile, updateCustomerProfile, getCustomerAnalytics, updateCustomerControls, getLoyaltyTransactions, addLoyaltyTransaction, getCustomerCommunications, addCustomerCommunication, deleteCustomerCommunication, updateCustomerCommunication } from '@/app/actions/crm'
import { ArrowLeft, User, Edit2, Save, X, Star, MapPin, Calendar, Smartphone, Mail, Globe, TrendingUp, ShoppingBag, CreditCard, Tag, Package, CalendarDays, Award, ShieldAlert, Clock, Phone, MessageSquare, StickyNote, Trash2, PlusCircle, CheckCircle, ExternalLink, MessageCircle, MoreVertical, Ban, FileText, Settings, Activity, History } from 'lucide-react'
import toast from 'react-hot-toast'

export default function CustomerDetailClient({ customerId, onClose }: { customerId: string, onClose?: () => void }) {
    const router = useRouter()

    const [customer, setCustomer] = useState<any>(null)
    const [analytics, setAnalytics] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    const [activeTab, setActiveTab] = useState<'overview' | 'orders' | 'loyalty' | 'notes' | 'settings'>('overview')

    // Edit State
    const [isEditing, setIsEditing] = useState(false)
    const [editData, setEditData] = useState<any>({})
    const [saving, setSaving] = useState(false)

    // Section C State
    const [isBanned, setIsBanned] = useState(false)
    const [banReason, setBanReason] = useState('')
    const [codBlocked, setCodBlocked] = useState(false)
    const [codBlockReason, setCodBlockReason] = useState('')
    const [savingControls, setSavingControls] = useState(false)

    // Sections D, E, F, G State
    const [loyaltyTx, setLoyaltyTx] = useState<any[]>([])
    const [orders, setOrders] = useState<any[]>([])
    const [comms, setComms] = useState<any[]>([])

    // Forms state
    const [loyaltyInput, setLoyaltyInput] = useState({ points: '', note: '' })
    const [addingPoints, setAddingPoints] = useState(false)
    const [commInput, setCommInput] = useState({ type: 'note', message: '' })
    const [addingComm, setAddingComm] = useState(false)

    useEffect(() => {
        if (customerId) {
            loadCustomer()
        }
    }, [customerId])

    async function loadCustomer() {
        setLoading(true)
        try {
            // Use browser-session Supabase client for orders (same as left panel)
            // This avoids server action auth context issues
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            const { data: storeData } = user
                ? await supabase.from('stores').select('id').eq('shopkeeper_id', user.id).single()
                : { data: null }

            // Run all fetches in parallel
            const [res, ana, lRes, cRes] = await Promise.all([
                getCustomerProfile(customerId),
                getCustomerAnalytics(customerId),
                getLoyaltyTransactions(customerId),
                getCustomerCommunications(customerId),
            ])

            // Fetch orders client-side to ensure browser session is used
            if (storeData?.id) {
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select(`
                        id, total_amount, status, payment_status, payment_method, created_at,
                        order_items ( id, product_id, product_name, quantity, price )
                    `)
                    .eq('customer_id', customerId)
                    .eq('store_id', storeData.id)
                    .order('created_at', { ascending: false })

                if (ordersError) {
                    console.error('[CRM orders fetch]', ordersError.message)
                } else {
                    setOrders(ordersData || [])
                }
            }

            if (res.error) {
                toast.error(res.error)
                if (onClose) onClose()
                else router.push('/dashboard/crm')
            } else {
                setCustomer(res.data)
                setEditData(res.data)
                setAnalytics(ana.data)
                setIsBanned(res.data.is_banned || false)
                setBanReason(res.data.ban_reason || '')
                setCodBlocked(res.data.cod_blocked || false)
                setCodBlockReason(res.data.cod_block_reason || '')

                if (lRes.data) setLoyaltyTx(lRes.data)
                if (cRes.data) setComms(cRes.data)
            }
        } catch (err: any) {
            console.error('[CustomerDetailClient loadCustomer]', err)
        } finally {
            setLoading(false)
        }
    }

    async function handleSaveProfile() {
        setSaving(true)
        const res = await updateCustomerProfile(customerId, editData)
        if (res.success) {
            toast.success('Profile updated successfully')
            setIsEditing(false)
            setCustomer(editData)
        } else {
            toast.error(res.error || 'Failed to update profile')
        }
        setSaving(false)
    }

    async function handleSaveControls() {
        setSavingControls(true)
        const res = await updateCustomerControls(customerId, isBanned, banReason, codBlocked, codBlockReason)
        if (res.success) {
            toast.success('Controls updated successfully')
            setCustomer({ ...customer, is_banned: isBanned, ban_reason: banReason, cod_blocked: codBlocked, cod_block_reason: codBlockReason })
        } else {
            toast.error(res.error || 'Failed to update controls')
        }
        setSavingControls(false)
    }

    async function handleAddLoyalty(type: 'earned' | 'redeemed') {
        if (!loyaltyInput.points || Number(loyaltyInput.points) <= 0) return toast.error('Enter valid points')
        setAddingPoints(true)
        const res = await addLoyaltyTransaction(customerId, Number(loyaltyInput.points), type, loyaltyInput.note)
        if (res.success) {
            toast.success(`Points ${type} successfully`)
            setAnalytics({ ...analytics, loyaltyPoints: res.newBalance })
            setLoyaltyInput({ points: '', note: '' })
            const lRes = await getLoyaltyTransactions(customerId)
            if (lRes.data) setLoyaltyTx(lRes.data)
        } else {
            toast.error(res.error || 'Failed to update points')
        }
        setAddingPoints(false)
    }

    async function handleAddComm(autoType?: 'whatsapp' | 'call') {
        const type = autoType || commInput.type as 'whatsapp' | 'call' | 'note' | 'email'
        if (!commInput.message && !autoType) return toast.error('Enter a message or note')

        setAddingComm(true)
        const msg = commInput.message || `Outbound ${type} initiated`
        const res = await addCustomerCommunication(customerId, type, msg)

        if (res.success) {
            toast.success('Added to log')
            if (!autoType) setCommInput({ type: 'note', message: '' })
            const cRes = await getCustomerCommunications(customerId)
            if (cRes.data) setComms(cRes.data)

            if (autoType === 'whatsapp' && customer.mobile) {
                window.open(`https://wa.me/${customer.mobile.replace(/[^0-9]/g, '')}`, '_blank')
            } else if (autoType === 'call' && customer.mobile) {
                window.open(`tel:${customer.mobile}`, '_self')
            }
        } else {
            toast.error(res.error || 'Failed to add log')
        }
        setAddingComm(false)
    }

    async function handleDeleteComm(commId: string) {
        if (!confirm('Delete this note?')) return
        const res = await deleteCustomerCommunication(commId)
        if (res.success) {
            toast.success('Deleted')
            setComms(comms.filter(c => c.id !== commId))
        } else {
            toast.error(res.error || 'Failed to delete note')
        }
    }

    if (loading) return (
        <div className="h-full flex flex-col items-center justify-center bg-gray-50/50">
            <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-gray-500 font-medium">Loading customer data...</p>
        </div>
    )

    if (!customer) return null

    const renderInteractiveStars = () => {
        return (
            <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                    <button
                        key={star}
                        type="button"
                        onClick={() => setEditData({ ...editData, star_rating: star })}
                        className={`hover:scale-110 transition ${star <= (editData.star_rating || 0) ? "text-yellow-400 fill-yellow-400" : "text-gray-200"}`}
                    >
                        <Star size={24} className={star <= (editData.star_rating || 0) ? "fill-current" : ""} />
                    </button>
                ))}
            </div>
        )
    }

    const renderStaticStars = (rating: number) => {
        return (
            <div className="flex text-yellow-500 items-center justify-center bg-yellow-50 px-2 py-0.5 rounded-full ring-1 ring-yellow-200">
                <span className="text-xs font-black mr-1">{rating.toFixed(1)}</span>
                <Star size={12} className="fill-current" />
            </div>
        )
    }

    function getTagColor(tag: string) {
        if (!tag) return 'bg-gray-100 text-gray-700'
        const t = tag.toLowerCase()
        if (t === 'new') return 'bg-blue-100 text-blue-700'
        if (t === 'regular') return 'bg-emerald-100 text-emerald-700'
        if (t === 'vip') return 'bg-purple-100 text-purple-700'
        if (t === 'at risk') return 'bg-orange-100 text-orange-700'
        if (t === 'inactive') return 'bg-gray-200 text-gray-700'
        if (t === 'banned') return 'bg-red-100 text-red-700'
        return 'bg-gray-100 text-gray-700'
    }

    const joinedDate = new Date(customer.created_at).toLocaleDateString('en-IN', {
        year: 'numeric', month: 'long', day: 'numeric'
    })

    return (
        <div className="flex flex-col h-full relative">
            {/* HER0 & HEADER SECTION */}
            <div className="bg-white border-b border-gray-100 sticky top-0 z-10 shrink-0">
                {/* Top Nav */}
                <div className="flex items-center justify-between p-4 pb-2">
                    <button
                        onClick={onClose || (() => router.push('/dashboard/crm'))}
                        className="flex items-center gap-2 p-1.5 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-lg font-medium transition active:scale-95"
                    >
                        {onClose ? <X size={20} /> : <ArrowLeft size={20} />}
                        <span className="text-sm font-bold bg-gray-50 px-2 py-0.5 rounded border border-gray-200">{onClose ? 'Close' : 'Back'}</span>
                    </button>

                    <div className="flex items-center gap-2">
                        <button onClick={() => handleAddComm('whatsapp')} className="p-2 bg-green-50 text-green-600 hover:bg-green-100 rounded-full transition active:scale-95 shadow-sm border border-green-100" title="WhatsApp Customer">
                            <MessageCircle size={18} />
                        </button>
                        <button onClick={() => handleAddComm('call')} className="p-2 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition active:scale-95 shadow-sm border border-blue-100" title="Call Customer">
                            <Phone size={18} />
                        </button>
                    </div>
                </div>

                {/* Profile Info */}
                <div className="px-6 flex flex-col md:flex-row gap-5 items-center md:items-start text-center md:text-left pb-4">
                    <div className="relative">
                        <div className="w-20 h-20 rounded-full bg-gradient-to-br from-indigo-50 to-blue-100 border-[3px] border-white shadow-[0_4px_15px_-3px_rgba(0,0,0,0.1)] flex items-center justify-center text-blue-700 text-3xl font-black shrink-0">
                            {customer.full_name ? customer.full_name.charAt(0).toUpperCase() : 'G'}
                        </div>
                        {customer.is_banned && <div className="absolute -bottom-1 -right-1 bg-red-500 text-white p-1 rounded-full border-2 border-white" title="Banned"><Ban size={12} /></div>}
                        {!customer.is_banned && customer.cod_blocked && <div className="absolute -bottom-1 -right-1 bg-orange-500 text-white p-1 rounded-full border-2 border-white" title="COD Blocked"><ShieldAlert size={12} /></div>}
                    </div>

                    <div className="flex-1 space-y-1">
                        <div className="flex flex-col md:flex-row items-center md:items-start gap-2">
                            <h1 className="text-2xl font-black text-gray-900 leading-none">
                                {customer.full_name || 'Guest User'}
                            </h1>
                            <span className={`text-[10px] font-black px-2 py-1 rounded-full uppercase tracking-wider ${getTagColor(customer.tag)}`}>
                                {customer.tag || 'New'}
                            </span>
                        </div>
                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-1.5 text-xs text-gray-500 font-medium">
                            <div className="flex items-center gap-1.5"><Smartphone size={14} className="text-gray-400" /> {customer.mobile || 'No Phone'}</div>
                            <div className="flex items-center gap-1.5"><Mail size={14} className="text-gray-400" /> {customer.email || 'No Email'}</div>
                            <div className="flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {customer.city ? customer.city : 'No City'}</div>
                        </div>
                    </div>

                    <div className="flex flex-col items-center md:items-end gap-2 shrink-0">
                        {renderStaticStars(customer.star_rating || 0)}
                        <span className="text-[10px] uppercase font-bold text-gray-400">Joined {joinedDate}</span>
                    </div>
                </div>

                {/* Tabs */}
                <div className="px-4 border-b border-gray-200">
                    <div className="flex space-x-6 overflow-x-auto hide-scrollbar">
                        <button onClick={() => setActiveTab('overview')} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-[3px] whitespace-nowrap ${activeTab === 'overview' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Overview</button>
                        <button onClick={() => setActiveTab('orders')} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-[3px] whitespace-nowrap ${activeTab === 'orders' ? 'border-primary text-primary' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Orders <span className="ml-1 bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full text-[10px]">{orders.length}</span></button>
                        <button onClick={() => setActiveTab('loyalty')} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-[3px] whitespace-nowrap ${activeTab === 'loyalty' ? 'border-purple-600 text-purple-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Loyalty</button>
                        <button onClick={() => setActiveTab('notes')} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-[3px] whitespace-nowrap ${activeTab === 'notes' ? 'border-amber-500 text-amber-600' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Logs & Notes</button>
                        <button onClick={() => setActiveTab('settings')} className={`pb-3 text-sm font-bold capitalize transition-colors border-b-[3px] whitespace-nowrap ${activeTab === 'settings' ? 'border-gray-800 text-gray-900' : 'border-transparent text-gray-500 hover:text-gray-800'}`}>Settings</button>
                    </div>
                </div>
            </div>

            {/* TAB CONTENT */}
            <div className="flex-1 overflow-y-auto hide-scrollbar p-6 bg-gray-50/30">
                {activeTab === 'overview' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Analytics Cards */}
                        <h3 className="text-sm font-black text-gray-400 uppercase tracking-widest pl-1">Key Metrics</h3>
                        {analytics ? (
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center"><ShoppingBag size={16} /></div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 mb-1">Total Orders</div>
                                    <div className="text-3xl font-black text-gray-900">{analytics.totalOrders}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-green-50 rounded-bl-full -z-10 opacity-50"></div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-full bg-green-50 text-green-600 flex items-center justify-center"><CreditCard size={16} /></div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 mb-1">Total Spent</div>
                                    <div className="text-3xl font-black text-green-600">₹{analytics.totalSpend.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow">
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-full bg-indigo-50 text-indigo-600 flex items-center justify-center"><TrendingUp size={16} /></div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 mb-1">Avg Order Val</div>
                                    <div className="text-3xl font-black text-indigo-900">₹{analytics.aov.toLocaleString()}</div>
                                </div>
                                <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow relative overflow-hidden">
                                    <div className="absolute right-0 top-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10 opacity-50"></div>
                                    <div className="flex items-center justify-between mb-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center"><Award size={16} /></div>
                                    </div>
                                    <div className="text-sm font-bold text-gray-400 mb-1">Loyalty Points</div>
                                    <div className="text-3xl font-black text-purple-700">{analytics.loyaltyPoints}</div>
                                </div>
                            </div>
                        ) : (
                            <div className="h-32 bg-gray-100 animate-pulse rounded-2xl"></div>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shopping Habits</div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 font-medium">Top Category</div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2"><Tag size={14} className="text-blue-500" /> {analytics?.mostBoughtCategory || 'N/A'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 font-medium">Favorite Product</div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2 truncate"><Package size={14} className="text-green-500 shrink-0" /> <span className="truncate" title={analytics?.mostBoughtProduct || ''}>{analytics?.mostBoughtProduct || 'N/A'}</span></div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-100">
                                <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Demographics</div>
                                <div className="space-y-4">
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 font-medium">Source</div>
                                        <div className="font-bold text-gray-900 capitalize flex items-center gap-2"><Globe size={14} className="text-purple-500" /> {customer.source || 'Tourist'}</div>
                                    </div>
                                    <div>
                                        <div className="text-xs text-gray-500 mb-1 font-medium">Birthday</div>
                                        <div className="font-bold text-gray-900 flex items-center gap-2"><Calendar size={14} className="text-orange-500" /> {customer.birthday ? new Date(customer.birthday).toLocaleDateString() : 'Not Provided'}</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {orders.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
                                <span className="material-symbols-outlined text-[48px] text-gray-300 mb-3">shopping_bag</span>
                                <h3 className="text-lg font-bold text-gray-900">No Orders Yet</h3>
                                <p className="text-sm text-gray-500 mt-1">This customer hasn't placed any orders.</p>
                            </div>
                        ) : (
                            orders.map(order => (
                                <div key={order.id} className="bg-white p-4 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-200 transition-colors group flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div className="flex items-start gap-4">
                                        <div className="w-10 h-10 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                                            <Package size={18} />
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <span className="font-black text-gray-900 text-sm">#{order.id.slice(0, 8).toUpperCase()}</span>
                                                <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${['delivered', 'completed'].includes(order.status) ? 'bg-green-100 text-green-700' : 'bg-blue-100 text-blue-700'}`}>{order.status}</span>
                                            </div>
                                            <p className="text-xs text-gray-500 font-medium flex items-center gap-1.5"><CalendarDays size={12} /> {new Date(order.created_at).toLocaleString()}</p>
                                        </div>
                                    </div>
                                    <div className="sm:text-right flex items-center justify-between sm:block border-t sm:border-0 pt-3 sm:pt-0 border-gray-100">
                                        <div>
                                            <div className="font-black text-gray-900 text-lg">₹{order.total_amount}</div>
                                            <div className="flex items-center text-[10px] text-gray-500 font-bold uppercase tracking-wider gap-1.5 sm:justify-end">
                                                {order.payment_method}
                                                <span className={`px-1.5 py-0.5 rounded ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-orange-50 text-orange-600'}`}>{order.payment_status}</span>
                                            </div>
                                        </div>
                                        <button onClick={() => window.open(`/dashboard/orders/${order.id}`, '_blank')} className="sm:hidden p-2 bg-gray-50 text-gray-600 rounded-lg">
                                            <ExternalLink size={16} />
                                        </button>
                                    </div>
                                    <button onClick={() => window.open(`/dashboard/orders/${order.id}`, '_blank')} className="hidden sm:flex p-2 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-lg transition-colors group-hover:text-blue-600 group-hover:bg-blue-50 ml-4">
                                        <ExternalLink size={18} />
                                    </button>
                                </div>
                            ))
                        )}
                    </div>
                )}

                {activeTab === 'loyalty' && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        <div className="bg-gradient-to-br from-indigo-900 to-purple-900 text-white p-6 rounded-3xl shadow-lg relative overflow-hidden">
                            <div className="absolute -right-6 -top-6 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
                            <div className="absolute right-10 bottom-10 w-24 h-24 bg-purple-500/20 rounded-full blur-xl"></div>

                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
                                <div>
                                    <div className="text-purple-200 font-medium text-sm mb-1 uppercase tracking-widest flex items-center gap-2"><Award size={16} /> Available Balance</div>
                                    <div className="text-5xl font-black">{analytics?.loyaltyPoints || 0} <span className="text-2xl font-bold text-purple-300">pts</span></div>
                                </div>

                                <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl w-full md:w-80">
                                    <div className="text-sm font-bold text-white mb-3">Manual Adjustment</div>
                                    <div className="grid grid-cols-2 gap-2 mb-3">
                                        <input type="number" placeholder="Points" value={loyaltyInput.points} onChange={e => setLoyaltyInput({ ...loyaltyInput, points: e.target.value })} className="col-span-2 bg-white/20 border border-white/30 p-2.5 rounded-xl text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/50 text-white placeholder:text-purple-200 transition-all font-bold" />
                                        <input type="text" placeholder="Note (Optional)" value={loyaltyInput.note} onChange={e => setLoyaltyInput({ ...loyaltyInput, note: e.target.value })} className="col-span-2 bg-white/20 border border-white/30 p-2.5 rounded-xl text-sm outline-none focus:border-white focus:ring-2 focus:ring-white/50 text-white placeholder:text-purple-200 transition-all font-medium" />
                                    </div>
                                    <div className="flex gap-2">
                                        <button disabled={addingPoints} onClick={() => handleAddLoyalty('earned')} className="flex-1 bg-white text-purple-900 py-2 rounded-xl text-sm font-black hover:bg-gray-100 transition-all active:scale-95 shadow-sm">Add +</button>
                                        <button disabled={addingPoints} onClick={() => handleAddLoyalty('redeemed')} className="flex-1 bg-transparent border-2 border-white/30 text-white py-2 rounded-xl text-sm font-black hover:bg-white/10 transition-all active:scale-95">Deduct -</button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6">
                            <h3 className="text-lg font-black text-gray-900 mb-6 flex items-center gap-2"><History size={20} className="text-gray-400" /> Points History</h3>
                            <div className="space-y-4">
                                {loyaltyTx.length === 0 ? (
                                    <p className="text-sm text-gray-500 font-medium text-center py-6">No transactions recorded.</p>
                                ) : loyaltyTx.map(tx => (
                                    <div key={tx.id} className="flex items-center justify-between p-3 border border-gray-100 rounded-2xl hover:bg-gray-50 transition-colors">
                                        <div className="flex items-center gap-4">
                                            <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${tx.type === 'earned' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
                                                {tx.type === 'earned' ? <TrendingUp size={16} /> : <TrendingUp size={16} className="rotate-180" />}
                                            </div>
                                            <div>
                                                <div className="font-bold text-gray-900 text-sm">{tx.note || (tx.type === 'earned' ? 'Points Earned' : 'Points Redeemed')}</div>
                                                <div className="text-[11px] text-gray-500 font-medium mt-0.5">{new Date(tx.created_at).toLocaleString()}</div>
                                            </div>
                                        </div>
                                        <div className={`font-black tracking-wide ${tx.type === 'earned' ? 'text-green-600' : 'text-red-500'}`}>
                                            {tx.type === 'earned' ? '+' : '-'}{tx.points} pts
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'notes' && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Private Notes */}
                        <div className="bg-amber-50/50 p-6 rounded-3xl border border-amber-100 shadow-sm relative overflow-hidden flex flex-col h-[500px]">
                            <div className="absolute right-0 top-0 w-32 h-32 bg-amber-100/50 rounded-bl-full -z-10"></div>
                            <h3 className="text-lg font-black flex items-center gap-2 text-amber-900 mb-6"><StickyNote size={20} className="text-amber-500" /> Private Notes</h3>

                            <div className="flex-1 overflow-y-auto hide-scrollbar space-y-4 pr-2 mb-4">
                                {comms.filter(c => c.type === 'note').length === 0 ? <p className="text-sm text-amber-700/60 font-medium text-center py-8">No private notes yet.</p> :
                                    comms.filter(c => c.type === 'note').map(c => (
                                        <div key={c.id} className="bg-white p-4 rounded-2xl shadow-sm border border-amber-100/50 relative group transition-all hover:shadow-md">
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-amber-400 mb-2">{new Date(c.created_at).toLocaleString()}</div>
                                            <p className="text-sm text-amber-950 whitespace-pre-wrap leading-relaxed">{c.message}</p>
                                            <button onClick={() => handleDeleteComm(c.id)} className="absolute top-3 right-3 p-1.5 bg-red-50 text-red-400 rounded-lg hover:text-red-600 hover:bg-red-100 opacity-0 group-hover:opacity-100 transition-all active:scale-95 shadow-sm"><Trash2 size={14} /></button>
                                        </div>
                                    ))}
                            </div>

                            <div className="bg-white p-3 rounded-2xl shadow-sm border border-amber-200 mt-auto shrink-0 flex items-end gap-2 focus-within:ring-2 focus-within:ring-amber-400/50 transition-all">
                                <textarea placeholder="Write a note... only visible to staff." value={commInput.message} onChange={e => setCommInput({ ...commInput, message: e.target.value })} className="w-full bg-transparent resize-none outline-none text-sm placeholder:text-amber-300 text-amber-900" rows={2} />
                                <button disabled={addingComm || !commInput.message} onClick={() => handleAddComm()} className="bg-amber-500 text-white p-2.5 rounded-xl text-sm font-bold hover:bg-amber-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed">
                                    <StickyNote size={18} />
                                </button>
                            </div>
                        </div>

                        {/* Comm Log */}
                        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col h-[500px]">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-lg font-black flex items-center gap-2 text-gray-900"><Activity size={20} className="text-blue-500" /> Comm Log</h3>
                            </div>

                            <div className="flex-1 overflow-y-auto hide-scrollbar pl-2 space-y-6">
                                {comms.filter(c => c.type !== 'note').length === 0 ? <p className="text-sm text-gray-500 font-medium text-center py-8">No external events recorded.</p> :
                                    comms.filter(c => c.type !== 'note').map((c, idx, arr) => (
                                        <div key={c.id} className="relative pl-6 pb-2">
                                            {/* Timeline track */}
                                            {idx !== arr.length - 1 && <div className="absolute left-[9px] top-6 bottom-[-24px] w-0.5 bg-gray-100"></div>}

                                            <div className={`absolute -left-1 top-1 w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10 ${c.type === 'whatsapp' ? 'bg-green-500' : 'bg-blue-500'}`}>
                                                {c.type === 'whatsapp' ? <MessageCircle size={10} className="text-white" /> : <Phone size={10} className="text-white" />}
                                            </div>
                                            <div className="text-[10px] uppercase tracking-wider font-bold text-gray-400 mb-1">{new Date(c.created_at).toLocaleString()}</div>
                                            <div className="text-sm font-medium text-gray-800 bg-gray-50 px-4 py-3 rounded-2xl rounded-tl-none border border-gray-100 inline-block shadow-sm">
                                                {c.message}
                                            </div>
                                        </div>
                                    ))}
                            </div>
                        </div>
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
                        {/* Edit Profile Form */}
                        <div className="bg-white rounded-3xl shadow-sm border border-gray-100 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <h3 className="text-xl font-black text-gray-900 flex items-center gap-2"><Settings size={22} className="text-gray-400" /> Profile Settings</h3>
                                <button
                                    onClick={handleSaveProfile}
                                    disabled={saving}
                                    className="bg-black text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition hover:bg-gray-800 active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg"
                                >
                                    {saving ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={16} />} Save Profile
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-6">
                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Full Name</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.full_name || ''}
                                        onChange={e => setEditData({ ...editData, full_name: e.target.value })}
                                        placeholder="Enter full name"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Mobile Rating (Stars)</label>
                                    <div className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 flex items-center">
                                        {renderInteractiveStars()}
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Mobile Number</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.mobile || ''}
                                        onChange={e => setEditData({ ...editData, mobile: e.target.value })}
                                        placeholder="Mobile number"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Email Address</label>
                                    <input
                                        type="email"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.email || ''}
                                        onChange={e => setEditData({ ...editData, email: e.target.value })}
                                        placeholder="Email address"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">City</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.city || ''}
                                        onChange={e => setEditData({ ...editData, city: e.target.value })}
                                        placeholder="e.g. Udaipur"
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">State</label>
                                    <input
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.state || ''}
                                        onChange={e => setEditData({ ...editData, state: e.target.value })}
                                        placeholder="e.g. Rajasthan"
                                    />
                                </div>

                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Birthday</label>
                                    <input
                                        type="date"
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900"
                                        value={editData.birthday || ''}
                                        onChange={e => setEditData({ ...editData, birthday: e.target.value })}
                                    />
                                </div>
                                <div>
                                    <label className="block text-[11px] font-black tracking-widest text-gray-400 mb-2 uppercase">Lead Source</label>
                                    <select
                                        className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white transition-all text-gray-900 appearance-none"
                                        value={editData.source || 'tourist'}
                                        onChange={e => setEditData({ ...editData, source: e.target.value })}
                                    >
                                        <option value="tourist">Tourist</option>
                                        <option value="referral">Referral</option>
                                        <option value="social">Social Media</option>
                                        <option value="walk-in">Walk-in</option>
                                        <option value="other">Other</option>
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* STORE CONTROLS */}
                        <div className="bg-red-50/50 rounded-3xl border border-red-100 p-6 md:p-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <h3 className="text-xl font-black text-red-900 flex items-center gap-2 mb-1"><ShieldAlert size={22} className="text-red-500" /> Danger Zone</h3>
                                    <p className="text-sm font-medium text-red-700/80">Restrict or block this customer's access.</p>
                                </div>
                                <button
                                    onClick={handleSaveControls}
                                    disabled={savingControls}
                                    className="bg-red-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 transition hover:bg-red-700 active:scale-95 disabled:opacity-50 shadow-md hover:shadow-lg hover:shadow-red-600/20"
                                >
                                    {savingControls ? <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" /> : <Save size={16} />} Save Restrictions
                                </button>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {/* Ban Settings */}
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${isBanned ? 'border-red-500 bg-white shadow-md' : 'border-red-100 bg-white/50'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base mb-1">Ban Customer</h4>
                                            <p className="text-xs font-medium text-gray-500">Prevent this user from logging in or checking out.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" className="sr-only peer" checked={isBanned} onChange={e => setIsBanned(e.target.checked)} />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-500"></div>
                                        </label>
                                    </div>
                                    <div className={`transition-all duration-300 overflow-hidden ${isBanned ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        <label className="block text-[11px] font-black tracking-widest text-red-500 mb-2 uppercase">Reason for Ban *</label>
                                        <textarea
                                            value={banReason}
                                            onChange={e => setBanReason(e.target.value)}
                                            placeholder="Describe why this user is suspended..."
                                            className="w-full bg-red-50/50 border border-red-200 focus:border-red-400 focus:ring-2 focus:ring-red-400/20 rounded-xl p-3 text-sm font-medium outline-none text-red-900 placeholder:text-red-300 transition-all resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>

                                {/* COD Settings */}
                                <div className={`p-6 rounded-2xl border-2 transition-all duration-300 ${codBlocked ? 'border-orange-500 bg-white shadow-md' : 'border-orange-100/50 bg-white/50'}`}>
                                    <div className="flex items-start justify-between mb-4">
                                        <div>
                                            <h4 className="font-black text-gray-900 text-base mb-1">Block COD</h4>
                                            <p className="text-xs font-medium text-gray-500">Force this user to prepay for all orders.</p>
                                        </div>
                                        <label className="relative inline-flex items-center cursor-pointer shrink-0">
                                            <input type="checkbox" className="sr-only peer" checked={codBlocked} onChange={e => setCodBlocked(e.target.checked)} />
                                            <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                                        </label>
                                    </div>
                                    <div className={`transition-all duration-300 overflow-hidden ${codBlocked ? 'max-h-40 opacity-100 mt-4' : 'max-h-0 opacity-0'}`}>
                                        <label className="block text-[11px] font-black tracking-widest text-orange-500 mb-2 uppercase">Reason for COD Block *</label>
                                        <textarea
                                            value={codBlockReason}
                                            onChange={e => setCodBlockReason(e.target.value)}
                                            placeholder="Describe why COD is disabled..."
                                            className="w-full bg-orange-50/50 border border-orange-200 focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 rounded-xl p-3 text-sm font-medium outline-none text-orange-900 placeholder:text-orange-300 transition-all resize-none"
                                            rows={2}
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
