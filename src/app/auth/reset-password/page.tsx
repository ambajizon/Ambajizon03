'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Loader2, CheckCircle2, AlertCircle, KeyRound } from 'lucide-react'
import PasswordInput from '@/components/PasswordInput'

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
    if (password.length === 0) return { label: '', color: '', width: '0%' }
    if (password.length < 6) return { label: 'Weak', color: 'bg-red-500', width: '33%' }
    if (password.length < 9 || !/[0-9]/.test(password)) return { label: 'Medium', color: 'bg-orange-500', width: '66%' }
    if (/[0-9]/.test(password) && /[^a-zA-Z0-9]/.test(password)) return { label: 'Strong', color: 'bg-green-500', width: '100%' }
    return { label: 'Medium', color: 'bg-orange-500', width: '66%' }
}

export default function ResetPasswordPage() {
    const [password, setPassword] = useState('')
    const [confirm, setConfirm] = useState('')
    const [loading, setLoading] = useState(false)
    const [status, setStatus] = useState<'idle' | 'success' | 'error'>('idle')
    const [errorMsg, setErrorMsg] = useState('')
    const [sessionReady, setSessionReady] = useState(false)
    const router = useRouter()

    const strength = getPasswordStrength(password)
    const mismatch = confirm.length > 0 && password !== confirm

    // Supabase sends the session tokens in the URL fragment — we need to handle them
    useEffect(() => {
        const supabase = createClient()
        // onAuthStateChange will fire with SIGNED_IN when the fragment is processed
        const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
            if (event === 'SIGNED_IN' || event === 'PASSWORD_RECOVERY') {
                setSessionReady(true)
            }
        })
        // Also check existing session
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) setSessionReady(true)
        })
        return () => subscription.unsubscribe()
    }, [])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (password !== confirm) {
            setErrorMsg('Passwords do not match.')
            setStatus('error')
            return
        }
        if (password.length < 6) {
            setErrorMsg('Password must be at least 6 characters.')
            setStatus('error')
            return
        }

        setLoading(true)
        setStatus('idle')
        setErrorMsg('')

        const supabase = createClient()
        const { error } = await supabase.auth.updateUser({ password })

        setLoading(false)

        if (error) {
            setStatus('error')
            setErrorMsg(error.message || 'Failed to update password. Try requesting a new link.')
        } else {
            setStatus('success')
            await supabase.auth.signOut()
            setTimeout(() => router.push('/auth/login'), 2000)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="w-full max-w-md bg-white rounded-2xl shadow-xl p-8 space-y-6">
                {/* Header */}
                <div className="text-center space-y-1">
                    <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center mx-auto mb-3">
                        <KeyRound size={26} className="text-blue-600" />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Set New Password</h1>
                    <p className="text-gray-500 text-sm">
                        Choose a strong password for your account
                    </p>
                </div>

                {/* Success */}
                {status === 'success' ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-5 flex flex-col items-center text-center gap-3">
                        <CheckCircle2 className="text-green-500" size={40} />
                        <div>
                            <p className="font-bold text-green-800">Password updated!</p>
                            <p className="text-green-600 text-sm mt-1">Redirecting to login…</p>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        {/* New Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                New Password
                            </label>
                            <PasswordInput
                                id="new-password"
                                value={password}
                                onChange={e => setPassword(e.target.value)}
                                placeholder="New password"
                                autoComplete="new-password"
                                required
                                className="w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none text-gray-900 transition"
                            />
                            {/* Strength Indicator */}
                            {password.length > 0 && (
                                <div className="mt-2 space-y-1">
                                    <div className="h-1.5 bg-gray-100 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full rounded-full transition-all duration-300 ${strength.color}`}
                                            style={{ width: strength.width }}
                                        />
                                    </div>
                                    <p className={`text-xs font-medium ${strength.label === 'Weak' ? 'text-red-500' :
                                            strength.label === 'Medium' ? 'text-orange-500' : 'text-green-600'
                                        }`}>
                                        {strength.label}
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1.5">
                                Confirm Password
                            </label>
                            <PasswordInput
                                id="confirm-password"
                                value={confirm}
                                onChange={e => setConfirm(e.target.value)}
                                placeholder="Confirm password"
                                autoComplete="new-password"
                                required
                                className={`w-full border rounded-xl px-4 py-3 min-h-[48px] focus:ring-2 focus:border-transparent outline-none text-gray-900 transition ${mismatch ? 'border-red-300 focus:ring-red-400' : 'focus:ring-blue-500'
                                    }`}
                            />
                            {mismatch && (
                                <p className="text-red-500 text-xs mt-1">Passwords do not match</p>
                            )}
                        </div>

                        {/* Error */}
                        {status === 'error' && (
                            <div className="flex items-start gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3 text-red-700 text-sm">
                                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                                <span>{errorMsg}</span>
                            </div>
                        )}

                        <button
                            type="submit"
                            disabled={loading || mismatch || !sessionReady}
                            className="w-full bg-blue-600 text-white font-bold py-3 min-h-[48px] rounded-xl hover:bg-blue-700 transition flex items-center justify-center gap-2 disabled:opacity-60"
                        >
                            {loading && <Loader2 size={18} className="animate-spin" />}
                            {loading ? 'Updating…' : 'Update Password'}
                        </button>

                        {!sessionReady && (
                            <p className="text-center text-xs text-gray-400">
                                Waiting for reset link session…{' '}
                                <Link href="/auth/forgot-password" className="text-blue-500 underline">Request new link</Link>
                            </p>
                        )}
                    </form>
                )}
            </div>
        </div>
    )
}
