'use client'

import { useState, useRef, useCallback, ReactNode } from 'react'
import { Loader2 } from 'lucide-react'

interface PullToRefreshProps {
    onRefresh: () => Promise<void>
    children: ReactNode
    className?: string
}

export default function PullToRefresh({ onRefresh, children, className = '' }: PullToRefreshProps) {
    const [pulling, setPulling] = useState(false)
    const [refreshing, setRefreshing] = useState(false)
    const [pullDistance, setPullDistance] = useState(0)
    const startY = useRef<number | null>(null)
    const containerRef = useRef<HTMLDivElement>(null)

    const THRESHOLD = 70 // px to pull before triggering refresh

    const handleTouchStart = useCallback((e: React.TouchEvent) => {
        // Only start if scrolled to top
        if (containerRef.current && containerRef.current.scrollTop === 0) {
            startY.current = e.touches[0].clientY
        }
    }, [])

    const handleTouchMove = useCallback((e: React.TouchEvent) => {
        if (startY.current === null || refreshing) return
        const delta = e.touches[0].clientY - startY.current
        if (delta > 0) {
            // Dampen pull distance for natural feel
            setPullDistance(Math.min(delta * 0.4, THRESHOLD + 20))
            if (delta > 10) setPulling(true)
        }
    }, [refreshing])

    const handleTouchEnd = useCallback(async () => {
        if (pullDistance >= THRESHOLD && !refreshing) {
            setRefreshing(true)
            setPullDistance(THRESHOLD)
            try {
                await onRefresh()
            } finally {
                setRefreshing(false)
                setPullDistance(0)
                setPulling(false)
                startY.current = null
            }
        } else {
            setPullDistance(0)
            setPulling(false)
            startY.current = null
        }
    }, [pullDistance, refreshing, onRefresh])

    const progress = Math.min(pullDistance / THRESHOLD, 1)

    return (
        <div
            ref={containerRef}
            className={`relative ${className}`}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
        >
            {/* Pull Indicator */}
            <div
                className="flex items-center justify-center overflow-hidden transition-all duration-200"
                style={{ height: pulling || refreshing ? `${pullDistance}px` : 0 }}
            >
                <div
                    className="w-9 h-9 bg-white rounded-full shadow-md flex items-center justify-center"
                    style={{ opacity: progress, transform: `scale(${0.6 + 0.4 * progress})` }}
                >
                    <Loader2
                        size={20}
                        className={`text-blue-500 ${refreshing ? 'animate-spin' : ''}`}
                        style={{ transform: `rotate(${progress * 360}deg)` }}
                    />
                </div>
            </div>
            {children}
        </div>
    )
}
