'use client'

import { type Section } from './ProfileDashboard'
import CustomerLogoutButton from '@/components/storefront/CustomerLogoutButton'
import { type Customer } from '@/app/actions/customer'
import {
    LayoutDashboard, Package, Heart, MapPin, Trophy,
    Settings, MessageCircle, ChevronRight
} from 'lucide-react'

interface SidebarProps {
    activeSection: Section
    onSectionChange: (s: Section) => void
    customer: Customer
    initials: string
    orderCount: number
    storeSlug: string
    whatsappNumber: string | null
    mobile?: boolean
}

const NAV_ITEMS: { section: Section; icon: React.ReactNode; label: string; shortLabel: string }[] = [
    { section: 'overview', icon: <LayoutDashboard size={18} />, label: 'Overview', shortLabel: 'Home' },
    { section: 'orders', icon: <Package size={18} />, label: 'My Orders', shortLabel: 'Orders' },
    { section: 'addresses', icon: <MapPin size={18} />, label: 'Saved Addresses', shortLabel: 'Address' },
    { section: 'rewards', icon: <Trophy size={18} />, label: 'Loyalty Points', shortLabel: 'Rewards' },
    { section: 'settings', icon: <Settings size={18} />, label: 'Account Settings', shortLabel: 'Settings' },
]

export default function ProfileSidebar({
    activeSection, onSectionChange, customer, initials,
    orderCount, storeSlug, whatsappNumber, mobile = false
}: SidebarProps) {

    // ── Mobile: horizontal scroll tab bar ───────────────────────────────────
    if (mobile) {
        return (
            <div className="lg:hidden sticky top-0 z-30 bg-white border-b border-rt-border shadow-sm">
                <div className="flex overflow-x-auto scrollbar-hide">
                    {NAV_ITEMS.map(({ section, icon, shortLabel }) => {
                        const isActive = activeSection === section
                        return (
                            <button
                                key={section}
                                onClick={() => onSectionChange(section)}
                                className={`flex flex-col items-center gap-1 px-4 py-2.5 shrink-0 text-[11px] font-semibold border-b-2 transition-all min-w-[64px]
                                    ${isActive
                                        ? 'border-rt-primary text-rt-primary'
                                        : 'border-transparent text-rt-muted hover:text-rt-text'
                                    }`}
                            >
                                <span className={isActive ? 'text-rt-primary' : 'text-rt-muted'}>{icon}</span>
                                {shortLabel}
                            </button>
                        )
                    })}
                </div>
            </div>
        )
    }

    // ── Desktop: full sidebar ────────────────────────────────────────────────
    return (
        <div
            className="w-[240px] bg-white border border-rt-border rounded-2xl shadow-rt-card sticky top-[88px] overflow-hidden"
            style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
            {/* Mini profile */}
            <div className="p-4 border-b border-rt-border flex items-center gap-3">
                <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-[14px] shrink-0"
                    style={{ background: '#E8400C' }}
                >
                    {initials}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-[13px] font-semibold text-rt-text truncate">{customer.full_name || 'Customer'}</p>
                    <button
                        onClick={() => onSectionChange('overview')}
                        className="text-[11px] text-rt-primary font-medium flex items-center gap-0.5 hover:underline"
                    >
                        View Profile <ChevronRight size={11} />
                    </button>
                </div>
            </div>

            {/* Nav items */}
            <nav className="p-3 space-y-0.5">
                {NAV_ITEMS.map(({ section, icon, label }) => {
                    const isActive = activeSection === section
                    return (
                        <button
                            key={section}
                            onClick={() => onSectionChange(section)}
                            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium transition-all text-left
                                ${isActive
                                    ? 'bg-[#FFF5F0] text-rt-primary border-l-2 border-rt-primary'
                                    : 'text-[#374151] hover:bg-[#F9FAFB] border-l-2 border-transparent'
                                }`}
                        >
                            <span className={isActive ? 'text-rt-primary' : 'text-[#9CA3AF]'}>{icon}</span>
                            <span className="flex-1">{label}</span>
                            {section === 'orders' && orderCount > 0 && (
                                <span className="bg-rt-primary text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                    {orderCount}
                                </span>
                            )}
                        </button>
                    )
                })}
            </nav>

            {/* Bottom pinned */}
            <div className="p-3 border-t border-rt-border space-y-1 mt-1">
                {whatsappNumber && (
                    <a
                        href={`https://wa.me/91${whatsappNumber.replace(/\D/g, '')}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-3 px-3 py-2.5 rounded-[10px] text-[13px] font-medium text-[#374151] hover:bg-[#F9FAFB] transition-all w-full"
                    >
                        <MessageCircle size={18} className="text-[#25D366]" />
                        WhatsApp Support
                    </a>
                )}
                <div className="px-3 py-1.5">
                    <CustomerLogoutButton storeSlug={storeSlug} compact />
                </div>
            </div>
        </div>
    )
}
