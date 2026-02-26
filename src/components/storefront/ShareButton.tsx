'use client'

import { Share2 } from 'lucide-react'
import toast from 'react-hot-toast'

export default function ShareButton({ title, text, url, className, iconClassName }: { title: string, text: string, url: string, className?: string, iconClassName?: string }) {
    const handleShare = async () => {
        if (navigator.share) {
            try {
                await navigator.share({
                    title,
                    text,
                    url,
                })
            } catch (error) {
                console.error('Error sharing', error)
            }
        } else {
            // Fallback
            navigator.clipboard.writeText(url)
            toast.success('Link copied to clipboard')
        }
    }

    return (
        <button
            onClick={handleShare}
            className={className || "w-12 h-12 rounded-xl flex items-center justify-center bg-gray-100 hover:bg-gray-200"}
        >
            <Share2 size={20} className={iconClassName || "text-gray-500"} />
        </button>
    )
}
