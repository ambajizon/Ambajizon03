'use client'

import QRCodeGenerator from '@/components/QRCodeGenerator'
import { createClient } from '@/lib/supabase/client'
import { useEffect, useState } from 'react'

export default function QRCodePage() {
    const [store, setStore] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        async function getStore() {
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('stores').select('*').eq('shopkeeper_id', user.id).single()
                setStore(data)
            }
            setLoading(false)
        }
        getStore()
    }, [])

    if (loading) return <div className="p-8">Loading...</div>
    if (!store) return <div className="p-8">Store not found. Please complete setup first.</div>

    // Assuming the app is hosted, we construct the full URL
    // In dev: http://localhost:3000/[slug]
    // In prod: https://ambajizon.com/[slug]
    const storeUrl = `${window.location.origin}/${store.slug}`

    return (
        <div className="max-w-xl mx-auto">
            <header className="mb-8 text-center">
                <h1 className="text-2xl font-bold text-gray-900">Store QR Code</h1>
                <p className="text-gray-500">Share this QR code with your customers.</p>
            </header>

            <QRCodeGenerator url={storeUrl} storeName={store.name} />
        </div>
    )
}
