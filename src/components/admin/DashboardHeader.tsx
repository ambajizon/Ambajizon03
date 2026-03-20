'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStoreContext } from '@/context/StoreContext'
import Link from 'next/link'

export default function DashboardHeader() {
    const [storeName, setStoreName] = useState('My Store')
    const [storeSlug, setStoreSlug] = useState<string | null>(null)
    const [storeId, setStoreId] = useState<string | null>(null)
    const [isLive, setIsLive] = useState(true)
    const [userEmail, setUserEmail] = useState<string | null>(null)
    const [userName, setUserName] = useState<string>('Admin User')
    const [isDropdownOpen, setIsDropdownOpen] = useState(false)
    const dropdownRef = useRef<HTMLDivElement>(null)
    const { storeInfo } = useStoreContext()

    useEffect(() => {
        async function fetchStore() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                setUserEmail(user.email || null)
                setUserName(user.user_metadata?.full_name || user.email?.split('@')[0] || 'User')

                const { data } = await supabase
                    .from('stores')
                    .select('id, name, slug')
                    .eq('shopkeeper_id', user.id)
                    .maybeSingle()

                if (data) {
                    if (data.name) setStoreName(data.name)
                    if (data.id) setStoreId(data.id)
                    if (data.slug) setStoreSlug(data.slug)
                    setIsLive(true)
                }
            }
        }
        fetchStore()
    }, [])

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false)
            }
        }
        document.addEventListener('mousedown', handleClickOutside)
        return () => document.removeEventListener('mousedown', handleClickOutside)
    }, [])

    const handleToggleLive = async () => {
        if (!isLive) {
            setIsLive(true)
            if (storeId) {
                const supabase = createClient()
                const { error } = await supabase.from('stores').update({ is_live: true }).eq('id', storeId)
                if (error && error.code === '42703') { alert('Live Status feature requires database migration.'); setIsLive(false) }
            }
        } else {
            const confirmOff = window.confirm("Are you sure? Customers won't be able to access your store.")
            if (confirmOff) {
                setIsLive(false)
                if (storeId) {
                    const supabase = createClient()
                    const { error } = await supabase.from('stores').update({ is_live: false }).eq('id', storeId)
                    if (error && error.code === '42703') { alert('Live Status feature requires database migration.'); setIsLive(true) }
                }
            }
        }
    }

    const handleLogout = async () => {
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            window.location.href = '/auth/login'
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    const displayName = storeInfo.name || storeName || 'Rupa Toys'
    const initials = userName ? userName.charAt(0).toUpperCase() : 'A'
    const slug = storeInfo.slug || storeSlug || 'setup'

    return (
        <header
            className="bg-white border-b border-dash-border px-5 lg:px-6 h-[64px] flex items-center justify-between sticky top-0 z-30 shrink-0"
            style={{ boxShadow: '0 1px 4px rgba(0,0,0,0.06)' }}
        >
            {/* Left: Store name + LIVE badge */}
            <div className="flex items-center gap-3">
                <div className="w-10 lg:hidden" /> {/* Hamburger spacer */}
                <h2 className="text-[14px] font-semibold text-dash-text hidden sm:block truncate max-w-[180px]">
                    {displayName}
                </h2>
                <button
                    onClick={handleToggleLive}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-semibold uppercase tracking-wider transition-colors ${isLive
                        ? 'bg-[#DCFCE7] text-[#15803D] border border-[#86EFAC] hover:bg-[#BBFDE7]'
                        : 'bg-[#FEE2E2] text-[#DC2626] border border-[#FECACA] hover:bg-[#FEE2E2]'
                    }`}
                    title={isLive ? 'Turn Offline' : 'Go Online'}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-[#22C55E] animate-pulse' : 'bg-[#EF4444]'}`} />
                    {isLive ? 'LIVE' : 'OFFLINE'}
                </button>
            </div>

            {/* Center: Search bar */}
            <div className="flex-1 max-w-[360px] mx-4 lg:mx-10 hidden md:flex">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-dash-icon text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search orders, products..."
                        className="w-full bg-dash-bg border border-dash-border rounded-[10px] pl-9 pr-4 py-2.5 text-[13px] text-dash-muted placeholder:text-dash-icon focus:outline-none focus:border-dash-primary transition-all duration-150"
                        style={{ '--tw-ring-color': 'rgba(75,68,214,0.1)' } as React.CSSProperties}
                        onFocus={e => {
                            e.target.style.boxShadow = '0 0 0 3px rgba(75,68,214,0.12)'
                            e.target.style.background = '#FFFFFF'
                        }}
                        onBlur={e => {
                            e.target.style.boxShadow = ''
                            e.target.style.background = ''
                        }}
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* View Store */}
                <Link
                    href={`/${slug}`}
                    target="_blank"
                    className="bg-dash-primary-light border border-[#C7C4F5] text-dash-primary px-4 py-2 rounded-[9px] font-semibold text-[13px] flex items-center gap-1.5 hover:bg-dash-primary hover:text-white hover:border-dash-primary transition-all duration-150 shrink-0 hidden sm:flex"
                >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Store
                </Link>

                {/* Notification bell */}
                <button className="relative p-2 text-dash-muted hover:text-dash-primary hover:bg-dash-primary-light rounded-full transition-colors hidden sm:flex items-center justify-center">
                    <span className="material-symbols-outlined text-[22px]">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-[7px] h-[7px] bg-dash-danger rounded-full border-2 border-white" />
                </button>

                {/* Profile dropdown */}
                <div className="relative z-50" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-dash-bg px-3 py-1.5 rounded-[10px] transition-colors"
                    >
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white font-semibold text-[14px] shrink-0"
                            style={{ background: '#4B44D6' }}
                        >
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[13px] font-semibold text-dash-text leading-tight truncate max-w-[100px]">{userName}</p>
                        </div>
                        <span className="material-symbols-outlined text-dash-icon text-[18px] hidden sm:block">expand_more</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-dash-border rounded-[14px] overflow-hidden z-[60]"
                            style={{ boxShadow: '0 8px 24px rgba(74,68,214,0.12)' }}>
                            <div className="p-3 border-b border-dash-border bg-dash-surface">
                                <p className="text-[13px] font-semibold text-dash-text truncate">{userName}</p>
                                <p className="text-[11px] text-dash-icon truncate">{userEmail || 'seller@store.com'}</p>
                            </div>
                            <Link
                                href="/dashboard/settings"
                                onClick={() => setIsDropdownOpen(false)}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-medium text-dash-muted hover:bg-dash-bg hover:text-dash-primary transition-colors"
                            >
                                <span className="material-symbols-outlined text-[18px]">settings</span>
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="flex items-center gap-2.5 w-full px-4 py-2.5 text-[13px] font-semibold text-dash-danger hover:bg-[#FEF2F2] transition-colors border-t border-dash-border"
                            >
                                <span className="material-symbols-outlined text-[18px]">logout</span>
                                Sign Out
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </header>
    )
}
