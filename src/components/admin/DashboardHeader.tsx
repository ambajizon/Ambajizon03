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
                setUserName(user.user_metadata?.full_name || 'Admin User')

                let { data, error } = await supabase
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
            // Turning ON
            setIsLive(true)
            if (storeId) {
                const supabase = createClient()
                const { error } = await supabase.from('stores').update({ is_live: true }).eq('id', storeId)
                if (error && error.code === '42703') {
                    alert('Live Status feature requires database migration (is_live column).')
                    setIsLive(false)
                }
            }
        } else {
            // Turning OFF
            const confirmOff = window.confirm("Are you sure? Customers won't be able to access your store.")
            if (confirmOff) {
                setIsLive(false)
                if (storeId) {
                    const supabase = createClient()
                    const { error } = await supabase.from('stores').update({ is_live: false }).eq('id', storeId)
                    if (error && error.code === '42703') {
                        alert('Live Status feature requires database migration (is_live column).')
                        setIsLive(true)
                    }
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

    return (
        <header className="bg-white px-4 lg:px-8 py-4 sticky top-0 z-30 flex items-center justify-between border-b border-gray-100/50">
            {/* Left: Store Title & Mobile Menu Spacer */}
            <div className="flex items-center gap-3">
                <div className="w-10 lg:hidden"></div> {/* Hamburger Spacer */}
                <h2 className="text-xl font-bold text-slate-800 tracking-tight hidden sm:block">
                    {storeInfo.name || storeName || 'Ambajizon'}
                </h2>

                {/* Live Toggle Pill */}
                <button
                    onClick={handleToggleLive}
                    className={`flex items-center gap-1.5 ml-2 px-3 py-1 rounded-full text-[11px] font-bold transition-colors ${isLive ? 'bg-green-100 text-green-700 hover:bg-green-200' : 'bg-red-100 text-red-700 hover:bg-red-200'
                        }`}
                    title={isLive ? "Turn Offline" : "Go Online"}
                >
                    <span className={`w-2 h-2 rounded-full shadow-sm ${isLive ? 'bg-green-500 shadow-green-400/50' : 'bg-red-500 shadow-red-400/50'}`}></span>
                    {isLive ? 'LIVE' : 'OFFLINE'}
                </button>
            </div>

            {/* Center: Search Bar (Desktop) */}
            <div className="flex-1 max-w-2xl px-4 lg:px-8 flex justify-center hidden md:flex">
                <div className="relative w-full max-w-md lg:max-w-full lg:w-96">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-[20px]">search</span>
                    <input
                        type="text"
                        placeholder="Search orders, products..."
                        className="w-full bg-slate-100 border-none rounded-lg pl-10 pr-4 py-2.5 focus:ring-2 focus:ring-primary text-sm font-medium text-slate-700 placeholder:text-slate-400"
                    />
                </div>
            </div>

            {/* Right: Actions */}
            <div className="flex items-center gap-3 sm:gap-4">
                <Link
                    href={`/${storeInfo.slug || 'setup'}`}
                    target="_blank"
                    className="bg-primary text-white px-4 py-2.5 rounded-lg font-bold text-[13px] shadow-[0_4px_14px_0_rgba(17,82,212,0.2)] flex items-center gap-2 hover:bg-blue-700 transition hidden sm:flex"
                >
                    <span className="material-symbols-outlined text-[18px]">visibility</span>
                    <span>View Store</span>
                </Link>

                <button className="relative p-2 text-slate-400 hover:text-slate-700 bg-slate-50 hover:bg-slate-100 rounded-full transition-colors active:scale-95 hidden sm:block">
                    <span className="material-symbols-outlined text-[20px]">notifications</span>
                    <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                </button>

                {/* Profile Dropdown */}
                <div className="relative z-50" ref={dropdownRef}>
                    <button
                        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                        className="flex items-center gap-2 hover:bg-slate-50 p-1.5 rounded-full sm:rounded-xl transition-colors"
                    >
                        <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-orange-300 flex items-center justify-center text-white font-bold shrink-0">
                            <span className="material-symbols-outlined text-[20px]">person</span>
                        </div>
                        <div className="hidden sm:block text-left mr-1">
                            <p className="text-sm font-semibold text-slate-900 leading-tight">{userName}</p>
                        </div>
                        <span className="material-symbols-outlined text-slate-400 hidden sm:block">expand_more</span>
                    </button>

                    {isDropdownOpen && (
                        <div className="absolute right-0 top-full mt-2 w-48 bg-white border border-slate-200 rounded-xl shadow-lg z-[60] overflow-hidden animate-in fade-in slide-in-from-top-2">
                            <div className="p-3 border-b border-slate-100">
                                <p className="text-xs text-slate-500 truncate">{userEmail || 'admin@store.com'}</p>
                            </div>
                            <button
                                onClick={handleLogout}
                                className="w-full text-left p-3 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors"
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
