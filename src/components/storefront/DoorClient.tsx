'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight, MessageCircle, Phone } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import toast from 'react-hot-toast'

export default function DoorClient({ store, storeSlug, isLoggedIn }: { store: any, storeSlug: string, isLoggedIn?: boolean }) {
    const router = useRouter()
    const [touchStartY, setTouchStartY] = useState<number | null>(null)
    const [swipeDistance, setSwipeDistance] = useState(0)
    const [isEntering, setIsEntering] = useState(false)

    useEffect(() => {
        if (typeof window !== 'undefined') {
            const isStandalone = window.matchMedia('(display-mode: standalone)').matches || (window.navigator as any).standalone;
            if (isStandalone && isLoggedIn) {
                toast.success('Welcome back!')
                router.replace(`/${storeSlug}/shop`)
            }
        }
    }, [isLoggedIn, router, storeSlug])

    const handleTouchStart = (e: React.TouchEvent) => setTouchStartY(e.touches[0].clientY)
    const handleTouchMove = (e: React.TouchEvent) => {
        if (!touchStartY) return
        const diff = touchStartY - e.touches[0].clientY
        if (diff > 0) setSwipeDistance(diff)
    }

    const handleEnter = () => {
        setIsEntering(true)
        router.push(`/${storeSlug}/shop`)
    }

    const handleTouchEnd = () => {
        if (swipeDistance > 80) handleEnter()
        setTouchStartY(null)
        setSwipeDistance(0)
    }

    const pullUpStyle = {
        transform: `translateY(-${Math.min(swipeDistance, 100)}px)`,
        transition: touchStartY ? 'none' : 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
    }

    return (
        <div
            className="fixed inset-0 z-50 flex flex-col items-center justify-end overflow-hidden bg-gray-50 touch-none"
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Background Image / Gradient */}
            <div className="absolute inset-0 w-full h-full -z-10">
                {store.hero_banner_url ? (
                    <Image src={store.hero_banner_url} alt="Cover" fill className="object-cover opacity-60" priority />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-b from-primary/20 to-gray-50" />
                )}
                {/* Gradient overlay to make sheet pop */}
                <div className="absolute inset-0 bg-gradient-to-t from-gray-50 via-gray-50/80 to-transparent" />
            </div>

            {/* Bottom Sheet Entry Container */}
            <div
                className={`w-full max-w-md bg-white rounded-t-[32px] px-6 pb-12 pt-8 shadow-[0_-8px_30px_rgba(0,0,0,0.08)] flex flex-col items-center animate-in slide-in-from-bottom-full duration-500 ease-out`}
                style={pullUpStyle}
            >
                {/* Drag Handle */}
                <div className="w-12 h-1.5 bg-gray-200 rounded-full mb-8 animate-pulse" />

                {/* Logo */}
                <div className="relative w-20 h-20 rounded-full shadow-md bg-white p-1 mb-4 z-10 -mt-16">
                    <div className="relative w-full h-full rounded-full overflow-hidden border-2 border-white">
                        {store.logo_url ? (
                            <Image src={store.logo_url} alt={store.name} fill className="object-cover" priority />
                        ) : (
                            <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-400">
                                <span className="text-2xl font-bold">{store.name[0]}</span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Details */}
                <h1 className="text-[28px] font-bold text-gray-900 text-center tracking-tight mb-2 leading-tight">
                    {store.name}
                </h1>
                <p className="text-[15px] font-medium text-gray-500 text-center mb-8 px-4 leading-relaxed">
                    {store.tagline || 'Welcome to our official online store.'}
                </p>

                {/* Actions */}
                <div className="w-full space-y-4">
                    <Button
                        fullWidth
                        size="lg"
                        className="h-14 text-lg shadow-lg shadow-primary/20"
                        onClick={handleEnter}
                        isLoading={isEntering}
                        icon={!isEntering && <ArrowRight className="w-5 h-5" />}
                        style={{ flexDirection: 'row-reverse' }} // Icon on right
                    >
                        {isEntering ? 'Entering...' : 'Enter Store'}
                    </Button>

                    <div className="flex justify-center gap-3 pt-2">
                        {store.phone_number && (
                            <Button variant="ghost" className="h-10 px-4 gap-2 text-[13px] bg-gray-100 hover:bg-gray-200" onClick={() => window.open(`tel:${store.phone_number}`)}>
                                <Phone size={14} /> Call
                            </Button>
                        )}
                        {store.whatsapp_number && (
                            <Button variant="ghost" className="h-10 px-4 gap-2 text-[13px] text-[#25D366] bg-[#25D366]/10 hover:bg-[#25D366]/20" onClick={() => window.open(`https://wa.me/${store.whatsapp_number}`)}>
                                <MessageCircle size={14} /> WhatsApp
                            </Button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

