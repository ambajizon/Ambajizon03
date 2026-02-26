'use client'

import { useEffect, useState } from 'react'

export default function Template({ children }: { children: React.ReactNode }) {
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    return (
        <div className={`page-transition-enter ${mounted ? 'page-transition-enter-active' : ''}`}>
            {children}
        </div>
    )
}
