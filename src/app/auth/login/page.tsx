'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Store, User, ShieldCheck } from 'lucide-react'
import Link from 'next/link'
import PasswordInput from '@/components/PasswordInput'
import PwaInstallPrompt from '@/components/auth/PwaInstallPrompt'

function LoginForm() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState<'admin' | 'shopkeeper' | 'customer'>('shopkeeper')
    const router = useRouter()
    const searchParams = useSearchParams()
    const redirectRole = searchParams.get('role')

    // Set initial role from query param if available
    if (redirectRole && redirectRole !== role && ['admin', 'shopkeeper', 'customer'].includes(redirectRole)) {
        setRole(redirectRole as any)
    }

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (error) {
            alert('Error logging in: ' + error.message)
            setLoading(false)
            return
        }

        // Redirect based on role
        if (role === 'admin') router.push('/admin')
        else if (role === 'shopkeeper') router.push('/dashboard')
        else router.push('/') // Customer home

        router.refresh()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-20">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-3xl font-bold tracking-tight text-gray-900">Sign in to Ambajizon</h2>
                    <p className="mt-2 text-sm text-gray-600">Select your account type</p>
                </div>

                <div className="flex justify-center space-x-4">
                    <button
                        type="button"
                        onClick={() => setRole('admin')}
                        className={`flex flex-col items-center gap-2 rounded-lg p-2 px-4 transition-colors ${role === 'admin' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <ShieldCheck size={24} />
                        <span className="text-xs font-medium">Admin</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('shopkeeper')}
                        className={`flex flex-col items-center gap-2 rounded-lg p-2 px-4 transition-colors ${role === 'shopkeeper' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <Store size={24} />
                        <span className="text-xs font-medium">Shopkeeper</span>
                    </button>
                    <button
                        type="button"
                        onClick={() => setRole('customer')}
                        className={`flex flex-col items-center gap-2 rounded-lg p-2 px-4 transition-colors ${role === 'customer' ? 'bg-blue-50 text-blue-600 ring-2 ring-blue-500' : 'text-gray-500 hover:bg-gray-50'}`}
                    >
                        <User size={24} />
                        <span className="text-xs font-medium">Customer</span>
                    </button>
                </div>

                <form className="mt-8 space-y-6" onSubmit={handleLogin}>
                    {/* Email */}
                    <div>
                        <label htmlFor="email-address" className="sr-only">Email address</label>
                        <input
                            id="email-address"
                            name="email"
                            type="email"
                            autoComplete="email"
                            required
                            className="relative block w-full rounded-t-md border-0 py-3 min-h-[48px] text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm sm:leading-6 pl-3"
                            placeholder="Email address"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                        />
                    </div>

                    {/* Password with show/hide */}
                    <div className="space-y-1">
                        <label htmlFor="password" className="sr-only">Password</label>
                        <PasswordInput
                            id="password"
                            name="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="Password"
                            autoComplete="current-password"
                            required
                            className="relative block w-full rounded-md border-0 py-3 min-h-[48px] text-gray-900 ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:z-10 focus:ring-2 focus:ring-inset focus:ring-blue-600 sm:text-sm pl-3"
                        />
                        {/* Forgot Password link */}
                        <div className="flex justify-end pt-1">
                            <Link
                                href="/auth/forgot-password"
                                className="text-xs text-blue-600 hover:text-blue-800 font-medium transition"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-3 min-h-[48px] text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Sign in as {role.charAt(0).toUpperCase() + role.slice(1)}
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500">
                    Don&apos;t have an account?{' '}
                    <Link href="/auth/register" className="font-semibold text-blue-600 hover:text-blue-500">
                        Sign up
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function LoginPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center">Loading...</div>}>
            <LoginForm />
            <PwaInstallPrompt />
        </Suspense>
    )
}
