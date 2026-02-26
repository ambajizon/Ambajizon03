'use client'

import { useState } from 'react'
import { ChevronDown, ChevronUp } from 'lucide-react'

export default function ExpandableText({ text }: { text: string }) {
    const [isExpanded, setIsExpanded] = useState(false)
    const isLong = text.length > 150

    return (
        <div>
            <div className={`text-gray-600 text-sm leading-relaxed whitespace-pre-line ${!isExpanded && isLong ? 'line-clamp-3' : ''}`}>
                {text}
            </div>
            {isLong && (
                <button
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="flex items-center gap-1 text-primary font-bold text-sm mt-2 focus:outline-none"
                >
                    {isExpanded ? (
                        <>Show Less <ChevronUp size={16} /></>
                    ) : (
                        <>Read More <ChevronDown size={16} /></>
                    )}
                </button>
            )}
        </div>
    )
}
