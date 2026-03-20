'use client'

import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { LogOut } from 'lucide-react'

export default function CustomerLogoutButton({ storeSlug, compact = false }: { storeSlug: string; compact?: boolean }) {
    const router = useRouter()

    const handleCustomerLogout = async () => {
        try {
            const supabase = createClient()
            await supabase.auth.signOut()
            router.push(`/${storeSlug}`)
            router.refresh()
        } catch (error) {
            console.error('Logout error:', error)
        }
    }

    if (compact) {
        return (
            <button
                onClick={handleCustomerLogout}
                className="flex items-center gap-2 text-[13px] font-medium text-[#DC2626] hover:text-red-700 transition-colors"
            >
                <LogOut size={14} />
                Sign Out
            </button>
        )
    }

    return (
        <button
            onClick={handleCustomerLogout}
            className="w-full flex justify-center items-center gap-2 bg-red-50 text-red-600 font-bold py-4 rounded-xl shadow-sm border border-red-100 hover:bg-red-100 transition active:scale-95"
        >
            <LogOut size={20} />
            Sign Out
        </button>
    )
}
