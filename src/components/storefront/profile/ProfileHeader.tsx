'use client'

import { type Section } from './ProfileDashboard'
import { type Customer } from '@/app/actions/customer'
import { Camera, Pencil, BadgeCheck } from 'lucide-react'
import toast from 'react-hot-toast'

interface ProfileHeaderProps {
    customer: Customer
    initials: string
    memberYear: number
    orders: any[]
    onSectionChange: (s: Section) => void
}

export default function ProfileHeader({ customer, initials, memberYear, orders, onSectionChange }: ProfileHeaderProps) {
    const handleCameraClick = () => {
        toast('Profile photo upload coming soon. 📸', { icon: '✨', duration: 2500 })
    }

    return (
        <div
            className="rounded-2xl border border-rt-border overflow-hidden"
            style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #FFF0E8 100%)', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' }}
        >
            {/* Top row */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 p-6 sm:p-7">

                {/* Avatar */}
                <div className="relative shrink-0">
                    <div
                        className="w-[72px] h-[72px] rounded-full flex items-center justify-center text-white font-bold text-[24px] select-none"
                        style={{
                            background: '#E8400C',
                            border: '3px solid #FFFFFF',
                            outline: '2px solid rgba(232,64,12,0.15)',
                            outlineOffset: '2px',
                        }}
                    >
                        {initials}
                    </div>
                    {/* Camera badge */}
                    <button
                        onClick={handleCameraClick}
                        className="absolute bottom-0 right-0 w-[22px] h-[22px] bg-white border border-rt-border rounded-full flex items-center justify-center shadow-sm hover:bg-rt-surface transition-colors active:scale-90"
                        title="Change profile photo"
                    >
                        <Camera size={11} className="text-rt-muted" />
                    </button>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                    <h1 className="text-[22px] font-bold text-rt-text leading-tight mb-1">
                        {customer.full_name || 'Valued Customer'}
                    </h1>
                    <p className="text-[14px] text-rt-muted">{customer.email || '—'}</p>
                    <p className="text-[14px] text-rt-muted">{customer.mobile || '—'}</p>
                    <div className="flex flex-wrap items-center gap-2 mt-2.5">
                        <span className="inline-flex items-center text-[11px] font-medium px-2.5 py-1 rounded-full bg-[#F3F4F6] text-[#374151]">
                            Member since {memberYear}
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2.5 py-1 rounded-full bg-[#DCFCE7] text-[#15803D]">
                            <BadgeCheck size={11} /> Verified Account
                        </span>
                    </div>
                </div>

                {/* Edit button */}
                <button
                    onClick={() => onSectionChange('settings')}
                    className="shrink-0 flex items-center gap-1.5 text-[13px] font-medium text-rt-primary border border-rt-primary rounded-[8px] px-4 py-2 bg-white hover:bg-[#FFF5F0] transition-colors active:scale-95"
                >
                    <Pencil size={13} /> Edit Profile
                </button>
            </div>

            {/* Stats row */}
            <div className="border-t border-[#F0D5C8] grid grid-cols-3 divide-x divide-[#F0D5C8]">
                {[
                    { label: 'Total Orders', count: orders.length, section: 'orders' as Section },
                    { label: 'Wishlist Items', count: 0, section: 'overview' as Section },
                    { label: 'Loyalty Points', count: 0, section: 'rewards' as Section },
                ].map(({ label, count, section }) => (
                    <button
                        key={label}
                        onClick={() => onSectionChange(section)}
                        className="flex flex-col items-center py-4 hover:bg-[#FFF0E8] transition-colors group"
                    >
                        <span className="text-[20px] font-bold text-rt-text group-hover:text-rt-primary transition-colors">{count}</span>
                        <span className="text-[12px] text-rt-muted mt-0.5">{label}</span>
                    </button>
                ))}
            </div>
        </div>
    )
}
