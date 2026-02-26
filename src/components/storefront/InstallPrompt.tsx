'use client'

import { useState, useEffect } from 'react'
import { Download, X } from 'lucide-react'

// Note: To properly support PWA installation, the browser fires beforeinstallprompt
// We capture it and then trigger it when the user clicks 'Install App'

export default function InstallPrompt({ storeName, primaryColor, logoUrl }: { storeName: string, primaryColor: string, logoUrl?: string | null }) {
    const [show, setShow] = useState(false)
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null)
    const [isInstalled, setIsInstalled] = useState(false)

    useEffect(() => {
        // Check if already installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsInstalled(true)
            return
        }

        const handler = (e: any) => {
            e.preventDefault()
            setDeferredPrompt(e)
            // Show prompt after 5 seconds as requested
            setTimeout(() => {
                const lastDismissed = localStorage.getItem('pwa_prompt_dismissed_store')
                if (lastDismissed) {
                    const dismissedDate = new Date(parseInt(lastDismissed))
                    const daysSinceDismiss = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
                    if (daysSinceDismiss < 7) {
                        return // Less than 7 days ago
                    }
                }
                setShow(true)
            }, 5000)
        }

        window.addEventListener('beforeinstallprompt', handler)

        // Fallback for iOS Safari which doesn't support beforeinstallprompt properly yet
        const isIos = () => {
            const userAgent = window.navigator.userAgent.toLowerCase()
            return /iphone|ipad|ipod/.test(userAgent)
        }

        if (isIos() && !(window.navigator as any).standalone) {
            setTimeout(() => {
                const lastDismissed = localStorage.getItem('pwa_prompt_dismissed_store')
                if (lastDismissed) {
                    const dismissedDate = new Date(parseInt(lastDismissed))
                    const daysSinceDismiss = (new Date().getTime() - dismissedDate.getTime()) / (1000 * 3600 * 24)
                    if (daysSinceDismiss < 7) return
                }
                setShow(true)
            }, 5000)
        }

        return () => window.removeEventListener('beforeinstallprompt', handler)
    }, [])

    const handleInstall = async () => {
        if (!deferredPrompt) return

        deferredPrompt.prompt()
        const { outcome } = await deferredPrompt.userChoice

        if (outcome === 'accepted') {
            setShow(false)
        }
        setDeferredPrompt(null)
    }

    const handleDismiss = () => {
        setShow(false)
        localStorage.setItem('pwa_prompt_dismissed_store', new Date().getTime().toString())
    }

    if (!show || isInstalled) return null

    return (
        <div className="fixed inset-x-0 bottom-0 z-50 p-4 md:hidden animate-in slide-in-from-bottom-full duration-300">
            <div className="bg-white rounded-2xl shadow-2xl border border-gray-100 p-5 relative overflow-hidden">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0 shadow-md bg-gray-100 overflow-hidden">
                        {logoUrl ? (
                            <img src={logoUrl} alt="Logo" className="w-full h-full object-contain" />
                        ) : (
                            <Download size={24} style={{ color: primaryColor }} />
                        )}
                    </div>
                    <div className="flex-1">
                        <h3 className="text-lg font-bold text-gray-900 tracking-tight leading-tight">Install {storeName} App</h3>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Faster shopping. Easier access.</p>
                    </div>
                </div>

                <div className="mt-5 flex items-center gap-3">
                    <button
                        onClick={handleInstall}
                        className="flex-1 flex items-center justify-center gap-2 text-white py-3 rounded-xl font-bold shadow-lg transition-transform active:scale-[0.98]"
                        style={{ backgroundColor: primaryColor }}
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
