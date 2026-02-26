'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { getStoreBySlug } from '@/app/actions/storefront'
import StoreHeader from '@/components/storefront/StoreHeader'
import Link from 'next/link'
import Image from 'next/image'
import { ArrowLeft, Loader2, CheckCircle2, AlertCircle, Mail } from 'lucide-react'

export default function CustomerForgotPasswordPage({ params }: { params: { store: string } }) {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [store, setStore] = useState<any>(null)

    useEffect(() => {
        getStoreBySlug(params.store).then(s => setStore(s))
    }, [params.store])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setStatus('idle')
        setErrorMsg('')

        const supabase = createClient()
        const siteUrl = window.location.origin

        const { error } = await supabase.auth.resetPasswordForEmail(email, {
            redirectTo: `${siteUrl}/${params.store}/auth/reset-password`,
        })

        setLoading(false)

        if (error) {
            setStatus('error')
            setErrorMsg(error.message || 'Email not found. Please check and retry.')
        } else {
            setStatus('success')
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
                    {/* Back */}
                    <Link
                        href={`/${params.store}/auth`}
                        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-800 transition text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Back to Login
                    </Link>

                    {/* Store Logo */}
                    {store?.logo_url && (
                        <div className="flex justify-center">
                            <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-100 shadow relative">
                                <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
                            </div>
                        </div>
                    )}

                    {/* Header */}
                    <div className="text-center space-y-1">
                        <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                            <Mail size={26} className="text-blue-600" />
                        </div>
                        <h1 className="text-2xl font-bold text-gray-900">Reset Password</h1>
                        <p className="text-gray-500 text-sm">
                            Enter your email and we&apos;ll send you a reset link
                        </p>
                    </div>

                    {/* Success */}
                    {status === 'success' ? (
                        <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                            <CheckCircle2 className="text-green-500" size={40} />
                            <div>
                                <p className="font-bold text-green-800">Reset link sent!</p>
                                <p className="text-green-600 text-sm mt-1">
                                    Check your inbox and spam folder for the reset email.
                                </p>
                            </div>
                            <Link
                                href={`/${params.store}/auth`}
                                className="text-sm text-blue-600 font-semibold hover:underline mt-1"
                            >
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                    Email Address
                                </label>
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="you@example.com"
                                    required
                                    className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-primary focus:border-transparent outline-none text-gray-900 transition"
                                />
                            </div>

                            {status === 'error' && (
                                <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                                    <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                    <span>{errorMsg}</span>
                                </div>
                            )}

                            <button
                                type="submit"
                                disabled={loading}
                                className="w-full bg-primary text-white font-bold py-3 min-h-[48px] rounded-xl hover:opacity-90 transition flex items-center justify-center gap-2 disabled:opacity-70"
                            >
                                {loading && <Loader2 size={18} className="animate-spin" />}
                                {loading ? 'Sending…' : 'Send Reset Link'}
                            </button>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
