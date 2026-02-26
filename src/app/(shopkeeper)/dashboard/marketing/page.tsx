import Link from 'next/link'
import { Ticket, Megaphone, Share2, BellRing } from 'lucide-react'

export default function MarketingPage() {
    const tools = [
        {
            title: 'Coupons',
            description: 'Create discount codes for your customers.',
            icon: Ticket,
            href: '/dashboard/marketing/coupons',
            color: 'text-purple-600',
            bg: 'bg-purple-50'
        },
        {
            title: 'Festival Offers',
            description: 'Run time-limited sales with banners.',
            icon: Megaphone,
            href: '/dashboard/marketing/offers',
            color: 'text-orange-600',
            bg: 'bg-orange-50'
        },
        {
            title: 'Share Tools',
            description: 'WhatsApp links and QR codes.',
            icon: Share2,
            href: '/dashboard/marketing/share',
            color: 'text-green-600',
            bg: 'bg-green-50'
        },
        {
            title: 'Customer Reminders',
            description: 'Bring back inactive customers.',
            icon: BellRing,
            href: '/dashboard/marketing/reminders',
            color: 'text-blue-600',
            bg: 'bg-blue-50'
        }
    ]

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {tools.map((tool) => (
                <Link
                    key={tool.title}
                    href={tool.href}
                    className="bg-white p-6 rounded-xl shadow-sm border hover:shadow-md transition flex items-start gap-4 group"
                >
                    <div className={`p-3 rounded-lg ${tool.bg} ${tool.color} group-hover:scale-110 transition`}>
                        <tool.icon size={24} />
                    </div>
                    <div>
                        <h2 className="font-bold text-gray-900 text-lg">{tool.title}</h2>
                        <p className="text-gray-500 text-sm mt-1">{tool.description}</p>
                    </div>
                </Link>
            ))}
        </div>
    )
}
