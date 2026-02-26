import { Users, CreditCard, UserPlus, AlertTriangle, UserCheck, UserX, Clock, IndianRupee, Eye, ExternalLink } from 'lucide-react'
import { getAdminDashboardStats } from '@/app/actions/admin'
import Link from 'next/link'

export default async function AdminDashboard() {
    const statsData = await getAdminDashboardStats()
    if (!statsData) return <div>Failed to load stats</div>

    const stats = [
        { name: 'Total Shopkeepers', value: statsData.totalShopkeepers, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
        { name: 'Active Subscriptions', value: statsData.activeShopkeepers, icon: UserCheck, color: 'text-green-600', bg: 'bg-green-50' },
        { name: 'Trial Shopkeepers', value: statsData.trialShopkeepers, icon: Clock, color: 'text-orange-600', bg: 'bg-orange-50' },
        { name: 'Expired Shopkeepers', value: statsData.expiredShopkeepers, icon: UserX, color: 'text-red-600', bg: 'bg-red-50' },
        { name: 'Total Revenue', value: `₹${statsData.totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-purple-600', bg: 'bg-purple-50' },
        { name: 'This Month Revenue', value: `₹${statsData.thisMonthRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-teal-600', bg: 'bg-teal-50' },
    ]

    const alerts = [
        { name: 'Expiring Trials (7 days)', value: statsData.alertExpiringTrials, icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-50' },
        { name: 'Expiring Subs (30 days)', value: statsData.alertExpiringSubs, icon: AlertTriangle, color: 'text-rose-600', bg: 'bg-rose-50' },
    ]

    return (
        <div className="space-y-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
                    <p className="mt-2 text-sm text-gray-700">A high-level overview of Ambajizon Platform metrics.</p>
                </div>
                <div className="mt-4 sm:ml-16 sm:mt-0 flex gap-3">
                    <Link href="/admin/shopkeepers/create" className="inline-flex items-center gap-2 rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600">
                        <UserPlus size={16} />
                        Create Shopkeeper
                    </Link>
                    <Link href="/admin/shopkeepers" className="inline-flex items-center gap-2 rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50">
                        <Eye size={16} />
                        View All Stores
                    </Link>
                </div>
            </div>

            {/* Performance Stats */}
            <h2 className="text-lg font-medium leading-6 text-gray-900">Platform Performance</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
                {stats.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                        </dd>
                    </div>
                ))}
            </div>

            {/* Alerts */}
            <h2 className="text-lg font-medium leading-6 text-gray-900">Alerts & Attention</h2>
            <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
                {alerts.map((item) => (
                    <div key={item.name} className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6 sm:pt-6 border border-gray-100">
                        <dt>
                            <div className={`absolute rounded-md p-3 ${item.bg}`}>
                                <item.icon className={`h-6 w-6 ${item.color}`} aria-hidden="true" />
                            </div>
                            <p className="ml-16 truncate text-sm font-medium text-gray-500">{item.name}</p>
                        </dt>
                        <dd className="ml-16 flex items-baseline pb-1 sm:pb-2">
                            <p className="text-2xl font-semibold text-gray-900">{item.value}</p>
                        </dd>
                    </div>
                ))}
            </div>

            <div className="bg-white rounded-lg shadow sm:p-6">
                <h3 className="text-base font-semibold leading-6 text-gray-900 mb-4">Recent Signups</h3>
                {statsData.recentSignups.length === 0 ? (
                    <div className="text-sm text-gray-500 text-center py-10 border-2 border-dashed rounded-lg">
                        No recent signups found.
                    </div>
                ) : (
                    <ul role="list" className="divide-y divide-gray-100">
                        {statsData.recentSignups.map((store: any, idx) => (
                            <li key={idx} className="flex items-center justify-between gap-x-6 py-5">
                                <div className="min-w-0">
                                    <div className="flex items-start gap-x-3">
                                        <p className="text-sm font-semibold leading-6 text-gray-900">{store.name}</p>
                                        <p className={`rounded-md whitespace-nowrap mt-0.5 px-1.5 py-0.5 text-xs font-medium ring-1 ring-inset ${store.is_enabled ? 'text-green-700 bg-green-50 ring-green-600/20' : 'text-yellow-800 bg-yellow-50 ring-yellow-600/20'}`}>
                                            {store.is_enabled ? 'Active' : 'Offline'}
                                        </p>
                                    </div>
                                    <div className="mt-1 flex items-center gap-x-2 text-xs leading-5 text-gray-500">
                                        <p className="whitespace-nowrap">Joined on {new Date(store.created_at).toLocaleDateString()}</p>
                                        <svg viewBox="0 0 2 2" className="h-0.5 w-0.5 fill-current"><circle cx={1} cy={1} r={1} /></svg>
                                        <p className="truncate">/{store.slug}</p>
                                    </div>
                                </div>
                                <div className="flex flex-none items-center gap-x-4">
                                    <Link href={`/${store.slug}`} className="hidden rounded-md bg-white px-2.5 py-1.5 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:block">
                                        Visit Store<span className="sr-only">, {store.name}</span>
                                    </Link>
                                </div>
                            </li>
                        ))}
                    </ul>
                )}
            </div>
        </div>
    )
}
