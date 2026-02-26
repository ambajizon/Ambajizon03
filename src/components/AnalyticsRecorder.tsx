'use client'

import { useEffect } from 'react'
import { recordVisit } from '@/app/actions/analytics'

export default function AnalyticsRecorder({ storeId }: { storeId: string }) {
    useEffect(() => {
        // Record visit once per session/mount
        // Ideally we'd check sessionStorage to avoid dupes on refresh, 
        // but for MVP simple mount trigger is okay (counts page loads basically)
        if (!sessionStorage.getItem(`visited_${storeId}`)) {
            recordVisit(storeId)
            sessionStorage.setItem(`visited_${storeId}`, 'true')
        }
    }, [storeId])

    return null
}
