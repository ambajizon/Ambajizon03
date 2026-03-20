'use client'

import { useEffect, useRef, useState } from 'react'

interface RewardsCardProps {
    points: number
    expanded?: boolean
}

export default function RewardsCard({ points, expanded = false }: RewardsCardProps) {
    const [displayPoints, setDisplayPoints] = useState(0)
    const hasAnimated = useRef(false)

    // Count-up animation on mount
    useEffect(() => {
        if (hasAnimated.current || points === 0) {
            setDisplayPoints(points)
            return
        }
        hasAnimated.current = true
        const duration = 900
        const steps = 30
        const increment = points / steps
        let current = 0
        const timer = setInterval(() => {
            current += increment
            if (current >= points) {
                setDisplayPoints(points)
                clearInterval(timer)
            } else {
                setDisplayPoints(Math.floor(current))
            }
        }, duration / steps)
        return () => clearInterval(timer)
    }, [points])

    const progress = Math.min((points / 100) * 100, 100)

    return (
        <div
            className="rounded-2xl overflow-hidden"
            style={{
                background: 'linear-gradient(135deg, #E8400C 0%, #C4300A 100%)',
                boxShadow: '0 4px 16px rgba(232,64,12,0.25)',
            }}
        >
            {/* Main content */}
            <div className="p-6 flex flex-col sm:flex-row gap-5 sm:items-start justify-between">
                {/* Left: points */}
                <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="text-[28px]">🪙</span>
                        <span className="text-[13px] font-medium text-white/80">Your Loyalty Points</span>
                    </div>
                    <div className="text-[52px] font-extrabold text-white leading-none tracking-tight">
                        {displayPoints}
                    </div>
                    <p className="text-[12px] text-white/70 mt-1">Earn 1 point for every ₹10 spent</p>

                    {/* Progress bar */}
                    <div className="mt-4">
                        <div className="h-[6px] bg-white/20 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white rounded-full transition-all duration-700"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                        <p className="text-[11px] text-white/70 mt-1.5">{points} / 100 points — Next reward at 100</p>
                    </div>
                </div>

                {/* Right: CTA */}
                <div className="flex flex-col items-start sm:items-end gap-3 shrink-0">
                    <button className="bg-white text-rt-primary text-[12px] font-semibold px-4 py-1.5 rounded-full hover:bg-orange-50 transition-colors active:scale-95">
                        How to Earn?
                    </button>
                </div>
            </div>

            {/* Bottom mini tiles */}
            <div className="grid grid-cols-3 gap-2 px-5 pb-5">
                {[
                    { icon: '🛍️', label: 'Shop & Earn' },
                    { icon: '🎁', label: 'Redeem Gifts' },
                    { icon: '📋', label: 'View History' },
                ].map(({ icon, label }) => (
                    <button
                        key={label}
                        className="flex flex-col items-center gap-1.5 py-2.5 px-2 rounded-[10px] hover:bg-white/25 transition-colors active:scale-95"
                        style={{ background: 'rgba(255,255,255,0.15)' }}
                    >
                        <span className="text-[18px]">{icon}</span>
                        <span className="text-[11px] font-medium text-white">{label}</span>
                    </button>
                ))}
            </div>

            {/* Expanded: extra history placeholder */}
            {expanded && (
                <div className="mx-5 mb-5 p-4 rounded-xl" style={{ background: 'rgba(255,255,255,0.12)' }}>
                    <p className="text-[13px] text-white font-semibold mb-2">Points History</p>
                    <p className="text-[12px] text-white/70">No points earned yet. Start shopping to earn your first points!</p>
                </div>
            )}
        </div>
    )
}
