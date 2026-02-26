'use client'

import { useParams, useRouter } from 'next/navigation'
import CustomerDetailClient from '../CustomerDetailClient'

export default function CustomerDetailPage() {
    const params = useParams()
    const customerId = params.id as string

    if (!customerId) return null

    return <CustomerDetailClient customerId={customerId} />
}

