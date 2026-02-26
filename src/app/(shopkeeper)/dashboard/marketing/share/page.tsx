'use client'

import { useState, useEffect } from 'react'
import QRCodeGenerator from '@/components/QRCodeGenerator'
import { Copy, Share2, ExternalLink } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export default function ShareToolsPage() {
    const [store, setStore] = useState<any>(null)
    const [storeUrl, setStoreUrl] = useState('')

    useEffect(() => {
        async function load() {
            const supabase = createClient()
            const { data: { user } } = await supabase.auth.getUser()
            if (user) {
                const { data } = await supabase.from('stores').select('*').eq('shopkeeper_id', user.id).single()
                setStore(data)
                if (data) {
                    setStoreUrl(`${window.location.origin}/${data.slug}`)
                }
            }
        }
        load()
    }, [])

    if (!store) return <div>Loading...</div>

    const shareMessage = `Check out our store *${store.name}*! Visit us here: ${storeUrl}`
    const whatsappLink = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* QR Code Section */}
            <div className="bg-white p-6 rounded-xl shadow-sm border text-center">
                <h3 className="font-bold text-lg mb-4">Store QR Code</h3>
                <div className="flex justify-center mb-6">
                    <QRCodeGenerator url={storeUrl} storeName={store.name} />
                </div>
                <p className="text-sm text-gray-500">Scan to visit store</p>
            </div>

            {/* Share Links Section */}
            <div className="space-y-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                        <Share2 size={20} className="text-primary" /> Share on WhatsApp
                    </h3>

                    <div className="bg-gray-50 p-4 rounded-lg border border-dashed mb-4">
                        <p className="text-gray-800 font-medium whitespace-pre-wrap">{shareMessage}</p>
                    </div>

                    <div className="flex gap-3">
                        <a
                            href={whatsappLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 bg-green-600 text-white font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-green-700 transition"
                        >
                            <Share2 size={18} /> Share Now
                        </a>
                        <button
                            onClick={() => { navigator.clipboard.writeText(shareMessage); alert('Copied!') }}
                            className="bg-white border text-gray-700 font-bold px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-50"
                        >
                            <Copy size={18} /> Copy
                        </button>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border">
                    <h3 className="font-bold text-lg mb-2">Store Link</h3>
                    <div className="flex items-center gap-2 bg-gray-50 p-2 rounded border">
                        <input className="flex-1 bg-transparent border-none outline-none text-sm text-gray-600" value={storeUrl} readOnly />
                        <a href={storeUrl} target="_blank" className="text-primary hover:underline"><ExternalLink size={16} /></a>
                    </div>
                </div>
            </div>
        </div>
    )
}
