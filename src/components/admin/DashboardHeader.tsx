'use client'

import { useEffect, useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useStoreContext } from '@/context/StoreContext'
import Link from 'next/link'

export default function DashboardHeader() {
    const [storeName, setStoreName] = useState('My Store')
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
                    .select('id, name')
                    .eq('shopkeeper_id', user.id)
                    .maybeSingle()

                if (data) {
                    if (data.name) setStoreName(data.name)
                    if (data.id) setStoreId(data.id)
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

    const initials = userName ? userName.charAt(0).toUpperCase() : 'A'

    return (
        <header className="bg-indigo-900 px-4 lg:px-6 py-3 sticky top-0 z-30 flex items-center justify-between shadow-lg shadow-indigo-900/30">
            {/* Left: Store Name + Live Badge */}
            <div className="flex items-center gap-3">
                <div className="w-10 lg:hidden" /> {/* Hamburger spacer */}
                <h2 className="text-[17px] font-black text-white tracking-tight hidden sm:block">
                    {storeInfo.name || storeName || 'Ambajizon'}
                </h2>
                <button
                    onClick={handleToggleLive}
                    className={`flex items-center gap-1.5 ml-1 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider transition-colors ${isLive
                        ? 'bg-green-500/20 text-green-300 border border-green-500/30 hover:bg-green-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30 hover:bg-red-500/30'
                        }`}
                    title={isLive ? 'Turn Offline' : 'Go Online'}
                >
                    <span className={`w-1.5 h-1.5 rounded-full ${isLive ? 'bg-green-400 animate-pulse' : 'bg-red-400'}`} />
                    {isLive ? 'LIVE' : 'OFFLINE'}
                </button>
            </div>

            {/* Center: Glass Search Bar */}
            <div className="flex-1 max-w-sm mx-4 lg:mx-10 hidden md:flex">
                <div className="relative w-full">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-indigo-300 text-[18px]">search</span>
                    <input
                        type="text"
                        placeholder="Search orders, products..."
                        className="w-full bg-white/10 border border-white/10 rounded-lg pl-10 pr-4 py-2.5 text-sm font-medium text-white placeholder:text-indigo-300 focus:outline-none focus:ring-2 focus:ring-white/30 transition"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-2 sm:gap-3">
                {/* View Store */}
                <Link
                    href={`/${storeInfo.slug || 'setup'}`}
                    target="_blank"
                    className="bg-white/10 border border-white/15 text-white px-3 py-2 rounded-lg font-bold text-[12px] flex items-center gap-1.5 hover:bg-white/20 transition shrink-0 hidden sm:flex"
                >
                    <span className="material-symbols-outlined text-[16px]">visibility</span>
                    View Store
                </Link>

                {/* Notifications */}
                <button className="relative p-2 text-indigo-200 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden sm:block">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full border-2 border-indigo-900" />
                </button>

                {/* Profile Dropdown */}
                <div className="relative z-50" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-white/10 p-1.5 rounded-xl transition-colors"
                    >
                        <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center text-white font-black text-sm shrink-0 ring-2 ring-white/20">
                            {initials}
                        </div>
                        <div className="hidden sm:block text-left">
                            <p className="text-[13px] font-bold text-white leading-tight">{userName}</p>
                        </div>
                        <span className="material-symbols-outlined text-indigo-300 text-[18px] hidden sm:block">expand_more</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-52 bg-white border border-slate-200 rounded-xl shadow-xl z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-slate-100 bg-slate-50">
                                <p className="text-xs font-bold text-slate-700 truncate">{userName}</p>
                                <p className="text-[11px] text-slate-400 truncate">{userEmail || 'seller@store.com'}</p>
                            </div>
                            <Link href="/dashboard/settings" className="w-full text-left p-3 text-sm font-medium text-slate-700 hover:bg-slate-50 flex items-center gap-2 transition-colors">
                                <span className="material-symbols-outlined text-[18px] text-slate-400">settings</span>
                                Settings
                            </Link>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left p-3 text-sm font-bold text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-slate-100"
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
