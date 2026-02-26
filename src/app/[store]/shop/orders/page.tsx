import { createClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/app/actions/customer'
import StoreHeader from '@/components/storefront/StoreHeader'
import Link from 'next/link'
import { Package, ChevronRight, Calendar, Clock } from 'lucide-react'
import { redirect } from 'next/navigation'
import { getStoreBySlug } from '@/app/actions/storefront'

async function getCustomerOrders(storeId: string) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return null

    const { data: orders } = await (await supabase)
        .from('orders')
        .select('*')
        .eq('customer_id', customer.id)
        .eq('store_id', storeId)
        .order('created_at', { ascending: false })

    return orders
}

export default async function CustomerOrdersPage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) return <div>Store not found</div>

    const orders = await getCustomerOrders(store.id)

    if (orders === null) {
        redirect(`/${params.store}/auth?redirect=/${params.store}/shop/orders`)
    }

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <StoreHeader storeId={store.id} storeName={store.name} storeSlug={store.slug} logoUrl={store.logo_url} showBack={true} />

            <div className="p-4 space-y-4">
                <h1 className="text-xl font-bold text-gray-900">My Orders</h1>

                {orders.length > 0 ? (
                    <div className="space-y-4">
                        {orders.map((order: any) => (
                            <Link
                                key={order.id}
                                href={`/${params.store}/shop/order/${order.id}`}
                                className="block bg-white p-4 rounded-xl shadow-sm border hover:border-primary transition"
                            >
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center text-primary">
                                            <Package size={20} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-900">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                                                <Calendar size={12} />
                                                {new Date(order.created_at).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>
                                    <div className={`px-2 py-0.5 rounded text-xs font-bold uppercase
                                        ${order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' :
                                                'bg-yellow-100 text-yellow-700'
                                        }`}
                                    >
                                        {order.status}
                                    </div>
                                </div>
                                <div className="mt-4 pt-3 border-t flex justify-between items-center">
                                    <span className="text-sm font-medium text-gray-600">Total Amount</span>
                                    <span className="font-bold text-gray-900">₹{order.total_amount}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                ) : (
                    <div className="text-center py-12">
                        <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto text-gray-400 mb-4">
                            <Package size={32} />
                        </div>
                        <h3 className="font-bold text-gray-900">No orders yet</h3>
                        <p className="text-gray-500 text-sm mt-1">Start shopping to see your orders here.</p>
                        <Link
                            href={`/${params.store}/shop`}
                            className="inline-block mt-4 bg-primary text-white px-6 py-2 rounded-lg font-bold text-sm"
                        >
                            Shop Now
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}
