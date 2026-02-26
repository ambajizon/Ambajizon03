import { getStoreBySlug } from '@/app/actions/storefront'
import { getCurrentCustomer, getCustomerAddresses } from '@/app/actions/customer'
import { getCustomerOrders } from '@/app/actions/checkout'
import { notFound, redirect } from 'next/navigation'
import StoreHeader from '@/components/storefront/StoreHeader'
import Link from 'next/link'
import { User, MapPin, Package, Clock, CheckCircle, PackageOpen } from 'lucide-react'
import CustomerLogoutButton from '@/components/storefront/CustomerLogoutButton'

export default async function ProfilePage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) notFound()

    const customer = await getCurrentCustomer(store.id)
    if (!customer) {
        redirect(`/${params.store}/auth?redirect=/${params.store}/shop/profile`)
    }

    const addresses = await getCustomerAddresses(store.id)
    const orders = await getCustomerOrders(store.id)

    return (
        <div className="min-h-screen bg-gray-50 pb-20">
            <StoreHeader
                storeId={store.id}
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logo_url}
                showBack={true}
            />

            <div className="p-4 space-y-6">
                {/* Profile Header */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border flex items-center gap-4">
                    <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center text-primary">
                        <User size={32} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">{customer.full_name || 'Valued Customer'}</h1>
                        <p className="text-gray-500 text-sm">{customer.mobile}</p>
                        <p className="text-gray-500 text-sm">{customer.email}</p>
                    </div>
                </div>

                {/* Loyalty Info */}
                <div className="bg-gradient-to-r from-yellow-100 to-yellow-50 p-4 rounded-xl border border-yellow-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-yellow-900">Loyalty Points</h3>
                        <p className="text-sm text-yellow-700">Earn points on every order!</p>
                    </div>
                    <div className="text-2xl font-black text-yellow-600">
                        {customer.loyalty_points || 0}
                    </div>
                </div>

                {/* Recent Orders */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <Package size={20} /> My Orders
                    </h2>
                    {orders.length === 0 ? (
                        <div className="bg-white p-10 rounded-2xl border border-gray-100 text-center flex flex-col items-center shadow-sm">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-4 border border-gray-100">
                                📦
                            </div>
                            <h3 className="font-bold text-gray-900 mb-1">No orders yet</h3>
                            <p className="text-sm text-gray-500 mb-6 max-w-[200px]">When you place orders, they will appear here to track.</p>
                            <Link href={`/${store.slug}/shop`} className="bg-primary/10 text-primary px-6 py-2.5 rounded-full font-bold hover:bg-primary/20 transition active:scale-95 text-sm">
                                Browse Products
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.slice(0, 5).map((order: any) => (
                                <Link key={order.id} href={`/${store.slug}/shop/order/success/${order.id}`} className="block bg-white p-4 rounded-xl border shadow-sm hover:border-primary transition">
                                    <div className="flex justify-between items-start mb-2">
                                        <div>
                                            <p className="text-xs text-gray-500 font-medium">Order #{order.id.slice(0, 8)}</p>
                                            <p className="text-xs text-gray-400">{new Date(order.created_at).toLocaleDateString()}</p>
                                        </div>
                                        <div className={`px-2 py-1 rounded text-xs font-bold uppercase ${order.status === 'confirmed' || order.status === 'delivered' ? 'bg-green-100 text-green-700' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'
                                            }`}>
                                            {order.status}
                                        </div>
                                    </div>
                                    <div className="flex justify-between items-center mt-3">
                                        <p className="text-sm font-medium text-gray-700">{order.order_items[0]?.products?.name} {order.order_items.length > 1 ? `+${order.order_items.length - 1} more` : ''}</p>
                                        <p className="font-bold text-gray-900">₹{order.total_amount}</p>
                                    </div>
                                    {order.order_items[0]?.product_id && (
                                        <div className="mt-3 pt-3 border-t flex justify-end">
                                            <Link
                                                href={`/${store.slug}/shop/product/${order.order_items[0].product_id}`}
                                                className="text-xs bg-primary/10 text-primary px-4 py-2 rounded-lg font-bold hover:bg-primary/20 transition"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                Buy Again
                                            </Link>
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    )}
                </div>

                {/* Saved Addresses */}
                <div>
                    <h2 className="text-lg font-bold text-gray-900 mb-3 flex items-center gap-2">
                        <MapPin size={20} /> Saved Addresses
                    </h2>
                    {addresses.length === 0 ? (
                        <div className="bg-white p-8 rounded-2xl border border-gray-100 text-center flex flex-col items-center shadow-sm text-sm">
                            <p className="text-gray-500">No addresses saved.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {addresses.map((addr: any) => (
                                <div key={addr.id} className="bg-white p-4 rounded-xl border shadow-sm relative">
                                    {addr.is_default && <span className="absolute top-4 right-4 text-xs font-bold bg-gray-100 px-2 py-1 rounded text-gray-600">Default</span>}
                                    <p className="font-bold text-gray-900 text-sm">{addr.full_name}</p>
                                    <p className="text-gray-500 text-xs mt-1">{addr.address_line1}</p>
                                    <p className="text-gray-500 text-xs">{addr.city}, {addr.state} - {addr.pincode}</p>
                                    <p className="text-gray-500 text-xs mt-1">Phone: {addr.phone}</p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Logout Button */}
                <div className="mt-8 pt-6 border-t">
                    <CustomerLogoutButton storeSlug={store.slug} />
                </div>

            </div>
        </div>
    )
}
