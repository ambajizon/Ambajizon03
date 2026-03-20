'use client'

import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'

export default function BackToTopButton() {
    const [visible, setVisible] = useState(false)

    useEffect(() => {
        const onScroll = () => setVisible(window.scrollY > 300)
        window.addEventListener('scroll', onScroll, { passive: true })
        return () => window.removeEventListener('scroll', onScroll)
    }, [])

    if (!visible) return null

    return (
        <button
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            aria-label="Back to top"
            className="fixed bottom-24 right-4 md:bottom-8 md:right-6 z-50 w-11 h-11 bg-rt-primary text-white rounded-full shadow-lg flex items-center justify-center hover:bg-rt-primary-dark transition-all active:scale-90 hover:-translate-y-0.5"
        >
            <ChevronUp size={20} strokeWidth={2.5} />
        </button>
    )
}
