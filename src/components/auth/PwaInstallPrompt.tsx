'use client'

import { useEffect, useState } from 'react'
import { Store, Download, X } from 'lucide-react'
import { useRouter } from 'next/navigation'

export default function PwaInstallPrompt() {
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [showPrompt, setShowPrompt] = useState(false)
    const router = useRouter()

    useEffect(() => {
        // Only run on client
        if (typeof window === 'undefined') return

        // 1. Check if already installed (standalone mode)
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone
        if (isStandalone) {
            // Already installed. Don't show.
            return
        }

        // 2. Check dismissal limit
        const lastDismissed = localStorage.getItem('pwa_prompt_dismissed')
        if (lastDismissed) {
            const dismissedDate = new Date(parseInt(lastDismissed))
            const daysSinceDismiss = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
            if (daysSinceDismiss < 7) {
                return // Less than 7 days ago
            }
        }

        // 3. Listen for the event
        const handleBeforeInstallPrompt = (e: Event) => {
            // Prevent the mini-infobar from appearing on mobile
            e.preventDefault()
            // Stash the event so it can be triggered later.
            setDeferredPrompt(e)

            // Show prompt after 5 seconds
            setTimeout(() => {
                setShowPrompt(true)
            }, 5000)
        }

        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)

        // 4. Listen for successful install
        const handleAppInstalled = () => {
            setShowPrompt(false)
            setDeferredPrompt(null)
            router.push('/dashboard')
        }

        window.addEventListener('appinstalled', handleAppInstalled)

        return () => {
            window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
            window.removeEventListener('appinstalled', handleAppInstalled)
        }
    }, [router])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        // Show the install prompt
        deferredPrompt.prompt()

        // Wait for the user to respond to the prompt
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            console.log('User accepted the install prompt')
            setDeferredPrompt(null)
            setShowPrompt(false)
        } else {
            console.log('User dismissed the install prompt')
            handleDismiss()
        }
    }

    const handleDismiss = () => {
        setShowPrompt(false)
        localStorage.setItem('pwa_prompt_dismissed', new Date().getTime().toString())
    }

    if (!showPrompt) return null

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative overflow-hidden">
                {/* Decorative background */}
                <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>

                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-[#1A237E] rounded-xl flex items-center justify-center text-white shrink-0 shadow-md">
                        <Store size={24} />
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Install Dashboard App</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Manage orders and products on the go. Fast and secure.</p>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 flex items-center justify-center gap-2 bg-[#1A237E] text-white py-3 rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-transform"
                    >
                        <Download size={18} /> Install App
                    </button>
                    <button
                        onClick={handleDismiss}
                        className="px-6 py-3 text-gray-500 font-bold hover:bg-gray-50 rounded-xl transition-colors shrink-0"
                    >
                        Not Now
                    </button>
                </div>
            </div>
        </div>
    )
}
