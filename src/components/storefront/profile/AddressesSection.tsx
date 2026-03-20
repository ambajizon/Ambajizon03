'use client'

import { useState } from 'react'
import { MapPin, Plus, Pencil, Trash2, MoreVertical, Check, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Address {
    id: string
    full_name: string
    phone: string
    address_line1: string
    address_line2?: string
    city: string
    state: string
    pincode: string
    address_type?: string
    is_default: boolean
}

interface AddressesSectionProps {
    addresses: Address[]
    storeId: string
    storeSlug: string
}

type DrawerMode = 'add' | 'edit' | null

function getTypeEmoji(type?: string) {
    if (type === 'work') return { icon: '🏢', label: 'Work' }
    return { icon: '🏠', label: 'Home' }
}

export default function AddressesSection({ addresses: initial, storeId }: AddressesSectionProps) {
    const [addresses, setAddresses] = useState<Address[]>(initial)
    const [drawerMode, setDrawerMode] = useState<DrawerMode>(null)
    const [editingAddress, setEditingAddress] = useState<Address | null>(null)
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)
    const [deletingId, setDeletingId] = useState<string | null>(null)

    const openAdd = () => {
        setEditingAddress(null)
        setDrawerMode('add')
    }

    const openEdit = (addr: Address) => {
        setEditingAddress(addr)
        setDrawerMode('edit')
        setOpenMenuId(null)
    }

    const closeDrawer = () => {
        setDrawerMode(null)
        setEditingAddress(null)
    }

    const handleDelete = (id: string) => {
        setDeletingId(id)
    }

    const confirmDelete = (id: string) => {
        setAddresses(prev => prev.filter(a => a.id !== id))
        setDeletingId(null)
        toast.success('Address deleted')
    }

    const setDefault = (id: string) => {
        setAddresses(prev => prev.map(a => ({ ...a, is_default: a.id === id })))
        setOpenMenuId(null)
        toast.success('Default address updated')
    }

    const handleSave = (data: Partial<Address>) => {
        if (drawerMode === 'add') {
            const newAddr: Address = {
                id: `local-${Date.now()}`,
                full_name: data.full_name || '',
                phone: data.phone || '',
                address_line1: data.address_line1 || '',
                address_line2: data.address_line2,
                city: data.city || '',
                state: data.state || '',
                pincode: data.pincode || '',
                address_type: data.address_type || 'home',
                is_default: data.is_default || addresses.length === 0,
            }
            if (newAddr.is_default) {
                setAddresses(prev => [...prev.map(a => ({ ...a, is_default: false })), newAddr])
            } else {
                setAddresses(prev => [...prev, newAddr])
            }
            toast.success('Address added')
        } else if (drawerMode === 'edit' && editingAddress) {
            setAddresses(prev => prev.map(a =>
                a.id === editingAddress.id ? { ...a, ...data } : a
            ))
            toast.success('Address updated')
        }
        closeDrawer()
    }

    return (
        <>
            <div className="bg-white rounded-2xl border border-rt-border overflow-hidden" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}>
                {/* Section header */}
                <div className="flex items-center justify-between p-5 border-b border-rt-border">
                    <div className="flex items-center gap-2">
                        <MapPin size={18} className="text-rt-primary" />
                        <h2 className="text-[17px] font-bold text-rt-text">Saved Addresses</h2>
                    </div>
                    <button
                        onClick={openAdd}
                        className="flex items-center gap-1.5 bg-rt-primary text-white text-[13px] font-semibold px-4 py-2 rounded-[8px] hover:bg-rt-primary-dark transition-colors active:scale-95"
                    >
                        <Plus size={14} /> Add New
                    </button>
                </div>

                {/* Address list */}
                <div className="p-5">
                    {addresses.length === 0 ? (
                        <button
                            onClick={openAdd}
                            className="w-full border-2 border-dashed border-rt-border rounded-[14px] p-8 flex flex-col items-center gap-2 hover:border-rt-primary/40 hover:bg-[#FFF5F0] transition-all group"
                        >
                            <Plus size={28} className="text-rt-muted group-hover:text-rt-primary transition-colors" />
                            <p className="text-[15px] text-rt-muted group-hover:text-rt-primary font-medium transition-colors">
                                Add your first delivery address
                            </p>
                        </button>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(addr => {
                                const { icon, label } = getTypeEmoji(addr.address_type)
                                const isMenuOpen = openMenuId === addr.id
                                const isDeleting = deletingId === addr.id

                                return (
                                    <div
                                        key={addr.id}
                                        className={`relative border rounded-[14px] p-5 transition-all ${addr.is_default ? 'border-rt-primary/30 bg-[#FFF9F7]' : 'border-rt-border bg-white'}`}
                                    >
                                        {/* Top row */}
                                        <div className="flex items-start justify-between mb-3">
                                            <div className="flex items-center gap-2">
                                                <span className="inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#374151]">
                                                    {icon} {label}
                                                </span>
                                                {addr.is_default && (
                                                    <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#FEF3C7] text-[#92400E]">
                                                        ★ Default
                                                    </span>
                                                )}
                                            </div>
                                            {/* 3-dot menu */}
                                            <div className="relative">
                                                <button
                                                    onClick={() => setOpenMenuId(isMenuOpen ? null : addr.id)}
                                                    className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-rt-surface transition-colors text-rt-muted"
                                                >
                                                    <MoreVertical size={16} />
                                                </button>
                                                {isMenuOpen && (
                                                    <div className="absolute right-0 top-9 bg-white border border-rt-border rounded-[12px] shadow-rt-card-hover z-20 min-w-[160px] overflow-hidden">
                                                        <button onClick={() => openEdit(addr)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-rt-text hover:bg-rt-surface transition-colors">
                                                            <Pencil size={14} /> Edit
                                                        </button>
                                                        {!addr.is_default && (
                                                            <button onClick={() => setDefault(addr.id)} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-rt-success hover:bg-rt-surface transition-colors">
                                                                <Check size={14} /> Set as Default
                                                            </button>
                                                        )}
                                                        <button onClick={() => { handleDelete(addr.id); setOpenMenuId(null) }} className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] text-rt-sale hover:bg-rt-surface transition-colors">
                                                            <Trash2 size={14} /> Delete
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* Delete confirmation popover */}
                                        {isDeleting && (
                                            <div className="mb-3 p-3 bg-[#FEF2F2] border border-[#FECACA] rounded-[10px] flex items-center justify-between gap-2">
                                                <p className="text-[12px] text-[#DC2626] font-medium">Delete this address?</p>
                                                <div className="flex gap-2">
                                                    <button onClick={() => setDeletingId(null)} className="text-[12px] text-rt-muted font-medium px-2 py-1 rounded hover:bg-white transition-colors">Cancel</button>
                                                    <button onClick={() => confirmDelete(addr.id)} className="text-[12px] text-white font-semibold px-3 py-1 bg-rt-sale rounded-[6px] hover:bg-red-700 transition-colors">Delete</button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Address content */}
                                        <p className="text-[15px] font-semibold text-rt-text">{addr.full_name}</p>
                                        <p className="text-[14px] text-[#374151] leading-relaxed mt-1">
                                            {addr.address_line1}
                                            {addr.address_line2 && <>, {addr.address_line2}</>}
                                        </p>
                                        <p className="text-[14px] text-[#374151]">{addr.city}, {addr.state} — {addr.pincode}</p>
                                        {addr.phone && <p className="text-[13px] text-rt-muted mt-1">📞 {addr.phone}</p>}

                                        {/* Bottom action links */}
                                        <div className="flex items-center gap-3 mt-4 pt-3 border-t border-rt-border/60">
                                            <button onClick={() => openEdit(addr)} className="text-[13px] font-medium text-rt-accent hover:underline">Edit</button>
                                            <span className="text-rt-border">|</span>
                                            <button onClick={() => handleDelete(addr.id)} className="text-[13px] font-medium text-rt-sale hover:underline">Delete</button>
                                            {!addr.is_default && (
                                                <>
                                                    <span className="text-rt-border">|</span>
                                                    <button onClick={() => setDefault(addr.id)} className="text-[13px] font-medium text-rt-success hover:underline">Set as Default</button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* Slide-over drawer */}
            {drawerMode && (
                <AddressDrawer
                    mode={drawerMode}
                    address={editingAddress}
                    onClose={closeDrawer}
                    onSave={handleSave}
                />
            )}
        </>
    )
}

// ── Slide-over Drawer ───────────────────────────────────────────────────────
interface DrawerProps {
    mode: 'add' | 'edit'
    address: Address | null
    onClose: () => void
    onSave: (data: Partial<Address>) => void
}

function AddressDrawer({ mode, address, onClose, onSave }: DrawerProps) {
    const [form, setForm] = useState<Partial<Address>>({
        full_name: address?.full_name || '',
        phone: address?.phone || '',
        address_line1: address?.address_line1 || '',
        address_line2: address?.address_line2 || '',
        city: address?.city || '',
        state: address?.state || '',
        pincode: address?.pincode || '',
        address_type: address?.address_type || 'home',
        is_default: address?.is_default || false,
    })

    const set = (field: keyof Address, value: any) => setForm(f => ({ ...f, [field]: value }))

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        if (!form.full_name || !form.address_line1 || !form.city || !form.state || !form.pincode) {
            toast.error('Please fill all required fields')
            return
        }
        onSave(form)
    }

    return (
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/40 z-40 transition-opacity"
                onClick={onClose}
            />

            {/* Drawer panel */}
            <div className="fixed inset-y-0 right-0 z-50 w-full md:w-[480px] bg-white shadow-2xl flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-5 border-b border-rt-border">
                    <h3 className="text-[18px] font-bold text-rt-text">
                        {mode === 'add' ? 'Add New Address' : 'Edit Address'}
                    </h3>
                    <button
                        onClick={onClose}
                        className="w-9 h-9 flex items-center justify-center rounded-full hover:bg-rt-surface transition-colors text-rt-muted"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-4">

                    {/* Type selector */}
                    <div>
                        <label className="block text-[13px] font-semibold text-rt-text mb-2">Address Type</label>
                        <div className="flex gap-3">
                            {['home', 'work', 'other'].map(type => (
                                <button
                                    key={type}
                                    type="button"
                                    onClick={() => set('address_type', type)}
                                    className={`flex-1 py-2.5 rounded-[10px] text-[13px] font-medium border transition-all capitalize
                                        ${form.address_type === type
                                            ? 'border-rt-primary bg-[#FFF5F0] text-rt-primary'
                                            : 'border-rt-border text-rt-muted hover:border-rt-primary/40'
                                        }`}
                                >
                                    {type === 'home' ? '🏠' : type === 'work' ? '🏢' : '📍'} {type}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Fields */}
                    {[
                        { id: 'full_name', label: 'Full Name *', placeholder: 'Receiver\'s full name', type: 'text' },
                        { id: 'phone', label: 'Phone Number *', placeholder: '+91 XXXXX XXXXX', type: 'tel' },
                        { id: 'address_line1', label: 'Address Line 1 *', placeholder: 'House No., Street, Area', type: 'text' },
                        { id: 'address_line2', label: 'Address Line 2', placeholder: 'Landmark, Colony (optional)', type: 'text' },
                        { id: 'city', label: 'City *', placeholder: 'City', type: 'text' },
                        { id: 'state', label: 'State *', placeholder: 'State', type: 'text' },
                        { id: 'pincode', label: 'Pincode *', placeholder: '6-digit pincode', type: 'text' },
                    ].map(({ id, label, placeholder, type }) => (
                        <div key={id}>
                            <label className="block text-[13px] font-semibold text-rt-text mb-1.5">{label}</label>
                            <input
                                type={type}
                                value={(form as any)[id] || ''}
                                onChange={e => set(id as keyof Address, e.target.value)}
                                placeholder={placeholder}
                                className="w-full h-11 px-4 rounded-[10px] border border-rt-border bg-rt-surface text-[14px] text-rt-text focus:outline-none focus:border-rt-primary transition-colors"
                            />
                        </div>
                    ))}

                    {/* Default checkbox */}
                    <label className="flex items-center gap-3 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={form.is_default || false}
                            onChange={e => set('is_default', e.target.checked)}
                            className="w-4 h-4 accent-rt-primary rounded"
                        />
                        <span className="text-[14px] text-rt-text">Set as default delivery address</span>
                    </label>
                </form>

                {/* Footer buttons */}
                <div className="flex gap-3 p-5 border-t border-rt-border">
                    <button
                        type="button"
                        onClick={onClose}
                        className="flex-1 h-[48px] border border-rt-border text-rt-text font-semibold rounded-[10px] hover:bg-rt-surface transition-colors text-[15px]"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit as any}
                        className="flex-1 h-[48px] bg-rt-primary text-white font-bold rounded-[10px] hover:bg-rt-primary-dark transition-colors active:scale-[0.99] text-[15px]"
                    >
                        {mode === 'add' ? 'Add Address' : 'Save Changes'}
                    </button>
                </div>
            </div>
        </>
    )
}
