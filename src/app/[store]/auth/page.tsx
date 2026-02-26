'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { registerCustomer } from '@/app/actions/customer'
import { getStoreBySlug } from '@/app/actions/storefront'
import StoreHeader from '@/components/storefront/StoreHeader'
import PasswordInput from '@/components/PasswordInput'
import { Loader2 } from 'lucide-react'
import Link from 'next/link'
import Image from 'next/image'

export default function CustomerAuthPage({ params }: { params: { store: string } }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [name, setName] = useState('')
    const [phone, setPhone] = useState('')
    const [isLogin, setIsLogin] = useState(true)
    const [loading, setLoading] = useState(false)
    const [message, setMessage] = useState('')
    const [store, setStore] = useState<any>(null)

    const router = useRouter()
    const supabase = createClient()
    const searchParams = useSearchParams()
    const redirectUrl = searchParams.get('redirect') || `/${params.store}/shop`

    // Load store for branding
    useEffect(() => {
        getStoreBySlug(params.store).then(s => setStore(s))
    }, [params.store])

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setMessage('')

        try {
            let authUser = null

            if (isLogin) {
                const { data, error } = await supabase.auth.signInWithPassword({ email, password })
                if (error) throw error
                authUser = data.user
            } else {
                // Sign Up
                const { data, error } = await supabase.auth.signUp({
                    email,
                    password,
                    options: { data: { full_name: name, phone } }
                })
                if (error) throw error
                authUser = data.user

                // Ensure session (auto-confirm quirk)
                if (authUser && !data.session) {
                    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({ email, password })
                    if (signInError) throw signInError
                    authUser = signInData.user
                }
            }

            if (authUser) {
                const storeData = store || await getStoreBySlug(params.store)
                if (!storeData) throw new Error('Store not found.')

                const customerName = name || authUser.user_metadata?.full_name || email.split('@')[0]
                const customerPhone = phone || authUser.user_metadata?.phone || null
                const regResult = await registerCustomer(storeData.id, customerName, customerPhone || '')
                if (regResult.error) throw new Error(regResult.error)

                router.push(redirectUrl)
                router.refresh()
            }
        } catch (error: any) {
            console.error('Auth Error:', error)
            setMessage(error.message || 'Authentication failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col">
            <StoreHeader
                storeName={store?.name || 'Store'}
                storeSlug={params.store}
                logoUrl={store?.logo_url || null}
                showBack={true}
            />

            <div className="flex-1 flex items-center justify-center p-4">
                <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">

                    {/* Store Branding */}
                    {store?.logo_url && (
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow relative">
                                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
                            </div>
                        </div>
                    )}

                    <div className="text-center">
                        <h1 className="text-2xl font-bold text-gray-900">
                            {isLogin ? 'Welcome Back' : 'Create Account'}
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            {isLogin
                                ? 'Sign in to access your orders and cart'
                                : 'Join us to track orders and checkout faster'}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-4">
                        {/* Register-only fields */}
                        {!isLogin && (
                            <>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                                    <input
                                        type="text"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="Your name"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Phone Number</label>
                                    <input
                                        type="tel"
                                        value={phone}
                                        onChange={e => setPhone(e.target.value)}
                                        className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-primary outline-none"
                                        placeholder="10-digit mobile number"
                                        required
                                    />
                                </div>
                            </>
                        )}

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email Address</label>
                            <input
                                type="email"
                                value={email}
                                onChange={e => setEmail(e.target.value)}
                                className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-primary outline-none"
                                placeholder="you@example.com"
                                required
                            />
                        </div>

                        {/* Password with toggle */}
                        <div className="space-y-1">
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                            <PasswordInput
                                id="customer-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="Password"
                                autoComplete={isLogin ? 'current-password' : 'new-password'}
                                required
                                className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-primary outline-none"
                            />
                            {/* Forgot Password link — only on login */}
                            {isLogin && (
                                <div className="flex justify-end pt-1">
                                    <Link
                                        href={`/${params.store}/auth/forgot-password`}
                                        className="text-xs text-primary hover:opacity-75 font-medium transition"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>
                            )}
                        </div>

                        {/* Error */}
                        {message && (
                            <p className="text-red-500 text-sm text-center bg-red-50 rounded-lg py-2 px-3">
                                {message}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-primary text-white font-bold py-3 min-h-[48px] rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="animate-spin" size={18} />}
                            {isLogin ? 'Sign In' : 'Sign Up'}
                        </button>
                    </form>

                    <div className="text-center text-sm text-gray-500">
                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                        <button
                            onClick={() => { setIsLogin(!isLogin); setMessage('') }}
                            className="text-primary font-bold hover:underline"
                        >
                            {isLogin ? 'Sign Up' : 'Sign In'}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
