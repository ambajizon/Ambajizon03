'use client'

import { useState, useRef } from 'react'
import { Trash2 } from 'lucide-react'

interface SwipeToDeleteItemProps {
    children: React.ReactNode
    onDelete: () => void
}

export default function SwipeToDeleteItem({ children, onDelete }: SwipeToDeleteItemProps) {
    const [startX, setStartX] = useState<number | null>(null)
    const [translateX, setTranslateX] = useState(0)
    const containerRef = useRef<HTMLDivElement>(null)

    const SWIPE_THRESHOLD = -60 // Threshold to confirm delete (px)

    const handleTouchStart = (e: React.TouchEvent) => {
        setStartX(e.touches[0].clientX)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
        if (startX === null) return
        const currentX = e.touches[0].clientX
        const diff = currentX - startX

        // Only allow swiping left
        if (diff < 0) {
            setTranslateX(Math.max(diff, -100)) // Cap at -100px
        } else {
            setTranslateX(0)
        }
    }

    const handleTouchEnd = () => {
        if (translateX < SWIPE_THRESHOLD) {
            // Trigger delete and slide out completely
            setTranslateX(-window.innerWidth)
            setTimeout(() => {
                onDelete()
            }, 300)
        } else {
            // Snap back
            setTranslateX(0)
        }
        setStartX(null)
    }

    return (
        <div className="relative overflow-hidden rounded-xl bg-red-500 mb-4 touch-pan-y" ref={containerRef}>
            {/* Background Delete Button */}
            <div className="absolute right-0 top-0 bottom-0 w-24 flex justify-end items-center pr-6 bg-red-500 text-white">
                <Trash2 size={24} />
            </div>

            {/* Foreground Content */}
            <div
                className="relative bg-white border rounded-xl shadow-sm z-10 w-full transition-transform duration-200 ease-out"
                style={{
                    transform: `translateX(${translateX}px)`,
                    transition: startX !== null ? 'none' : 'transform 0.2s ease-out',
                }}
                onTouchStart={handleTouchStart}
                onTouchMove={handleTouchMove}
                onTouchEnd={handleTouchEnd}
            >
                {children}
            </div>
        </div>
    )
}
