'use client'

import { useParams } from 'next/navigation'
import Link from 'next/link'
import { CheckCircle, Package, PartyPopper } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export default function OrderSuccessPage({ params }: { params: { store: string, id: string } }) {
    return (
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-4">
            <div className="bg-white p-8 md:p-10 rounded-[24px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] w-full max-w-md text-center space-y-6 border border-gray-100 relative overflow-hidden">
                <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-success via-green-400 to-emerald-500" />

                <div className="w-24 h-24 bg-success-light/30 rounded-full flex items-center justify-center mx-auto text-success relative">
                    <div className="absolute inset-0 bg-success/10 rounded-full animate-ping opacity-50" />
                    <CheckCircle size={48} strokeWidth={2.5} />
                </div>

                <div>
                    <h1 className="text-[26px] font-black text-gray-900 tracking-tight flex items-center justify-center gap-2">
                        Order Placed! <PartyPopper size={24} className="text-yellow-500" />
                    </h1>
                    <p className="text-[15px] text-gray-500 mt-2 font-medium">Thank you for your purchase.</p>
                </div>

                <div className="bg-gray-50 p-5 rounded-[16px] border border-gray-200">
                    <p className="text-[11px] text-gray-500 uppercase font-black tracking-widest mb-1">Order ID</p>
                    <p className="text-[18px] font-mono font-bold text-gray-900 tracking-wide">#{params.id.slice(0, 8).toUpperCase()}</p>
                </div>

                <div className="space-y-3 pt-6 flex flex-col items-center">
                    <Link href={`/${params.store}/shop/order/${params.id}`} className="w-full block">
                        <Button fullWidth variant="primary" size="lg" className="h-14 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]">
                            Track Order Status
                        </Button>
                    </Link>
                    <Link href={`/${params.store}/shop`} className="w-full block">
                        <Button fullWidth variant="secondary" size="lg" className="h-14 text-[16px] bg-white border-2 border-gray-200 text-gray-700 shadow-sm">
                            Continue Shopping
                        </Button>
                    </Link>
                </div>
            </div>
        </div>
    )
}
