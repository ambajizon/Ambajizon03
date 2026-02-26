'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Settings, CreditCard, Shield, Users } from 'lucide-react'

export default function AdminSettingsLayout({ children }: { children: React.ReactNode }) {
    const pathname = usePathname()

    const tabs = [
        { name: 'General Platform', href: '/admin/settings', icon: Settings, exact: true },
        { name: 'Payment Gateway', href: '/admin/settings/payment', icon: CreditCard },
    ]

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-900">Platform Settings</h1>

            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8" aria-label="Tabs">
                    {tabs.map((tab) => {
                        const isActive = tab.exact ? pathname === tab.href : pathname.startsWith(tab.href)
                        return (
                            <Link
                                key={tab.name}
                                href={tab.href}
                                className={`
                                    group inline-flex items-center gap-2 border-b-2 py-4 px-1 text-sm font-medium
                                    ${isActive
                                        ? 'border-indigo-500 text-indigo-600'
                                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                                    }
                                `}
                            >
                                <tab.icon
                                    className={`h-5 w-5 ${isActive ? 'text-indigo-500' : 'text-gray-400 group-hover:text-gray-500'}`}
                                    aria-hidden="true"
                                />
                                <span>{tab.name}</span>
                            </Link>
                        )
                    })}
                </nav>
            </div>

            <div className="py-2">
                {children}
            </div>
        </div>
    )
}
