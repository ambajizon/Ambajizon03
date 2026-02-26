'use client'

import { useState, Suspense } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter, useSearchParams } from 'next/navigation'
import { Loader2, Store, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { completeShopkeeperRegistration } from '@/app/actions/onboarding'

function RegisterForm() {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [loading, setLoading] = useState(false)
    const [role, setRole] = useState<'shopkeeper'>('shopkeeper')
    const router = useRouter()
    const searchParams = useSearchParams()

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        const supabase = createClient()

        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: {
                    full_name: name,
                    role: role,
                },
            }
        })

        if (authError) {
            alert('Error signing up: ' + authError.message)
            setLoading(false)
            return
        }

        if (authData.user) {
            const formData = new FormData()
            formData.append('name', name)

            const res = await completeShopkeeperRegistration(formData)

            if (res.error) {
                console.error(res.error)
            }

            if (authData.session) {
                router.push('/dashboard')
            } else {
                alert('Please check your email to confirm your account.')
                router.push('/auth/login')
            }
        }

        setLoading(false)
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-gray-50 pb-20 px-4">
            <div className="w-full max-w-md space-y-8 rounded-xl bg-white p-8 shadow-lg">
                <div className="text-center">
                    <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-gray-900 leading-tight">Welcome to Ambajizon!<br /><span className="text-[#FF6F00]">Launch your digital store in just 30 seconds.</span></h2>
                    <p className="mt-3 text-sm text-gray-600 font-medium">No credit card required. 15-day free trial.</p>
                </div>

                <form className="mt-8 space-y-5" onSubmit={handleRegister}>
                    <div className="space-y-4">
                        <div>
                            <label htmlFor="name" className="block text-sm font-bold text-gray-700 mb-1.5">Store Name</label>
                            <input
                                id="name"
                                name="name"
                                type="text"
                                required
                                className="relative block w-full rounded-xl py-3 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-shadow sm:text-sm pl-4 shadow-sm"
                                placeholder="E.g. Rajesh Handicrafts"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="email-address" className="block text-sm font-bold text-gray-700 mb-1.5">Email Address / Phone Number</label>
                            <input
                                id="email-address"
                                name="email"
                                type="text"
                                required
                                className="relative block w-full rounded-xl py-3 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-shadow sm:text-sm pl-4 shadow-sm"
                                placeholder="Enter your email or phone"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                        <div>
                            <label htmlFor="password" className="block text-sm font-bold text-gray-700 mb-1.5">Password</label>
                            <input
                                id="password"
                                name="password"
                                type="password"
                                autoComplete="new-password"
                                required
                                className="relative block w-full rounded-xl py-3 border border-gray-200 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-[#1A237E] focus:border-transparent transition-shadow sm:text-sm pl-4 shadow-sm"
                                placeholder="Create a secure password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="group relative flex w-full justify-center rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white hover:bg-blue-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-600 disabled:opacity-70 items-center"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Create Account <ArrowRight className="ml-2 h-4 w-4" />
                        </button>
                    </div>
                </form>

                <div className="text-center text-sm text-gray-500">
                    Already have an account?{' '}
                    <Link href="/auth/login" className="font-semibold text-blue-600 hover:text-blue-500">
                        Sign in
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function RegisterPage() {
    return (
        <Suspense fallback={<div className="flex h-screen items-center justify-center"><Loader2 className="animate-spin" /></div>}>
            <RegisterForm />
        </Suspense>
    )
}
