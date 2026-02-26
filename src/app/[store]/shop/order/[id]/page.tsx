import { createClient } from '@/lib/supabase/server'
import { getCurrentCustomer } from '@/app/actions/customer'
import StoreHeader from '@/components/storefront/StoreHeader'
import { notFound, redirect } from 'next/navigation'
import Image from 'next/image'
import { MapPin, Phone, CreditCard, Truck, Check, XCircle, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { getStoreBySlug } from '@/app/actions/storefront'

async function getOrderDetails(storeId: string, orderId: string) {
    const supabase = createClient()
    const customer = await getCurrentCustomer(storeId)

    if (!customer) return null

    const { data: order } = await (await supabase)
        .from('orders')
        .select('*, order_items(*)')
        .eq('id', orderId)
        .eq('customer_id', customer.id)
        .single()

    return order
}

export default async function OrderDetailPage({ params }: { params: { store: string, id: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) return notFound()

    const order = await getOrderDetails(store.id, params.id)
    if (!order) {
        redirect(`/${params.store}/auth?redirect=/${params.store}/shop/order/${params.id}`)
    }

    let address = order.delivery_address
    if (typeof address === 'string') {
        address = JSON.parse(address)
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-safe">
            {/* Desktop Header */}
            <div className="hidden md:block">
                <StoreHeader storeId={store.id} storeName={store.name} storeSlug={store.slug} logoUrl={store.logo_url} showBack={true} />
            </div>

            {/* Mobile Header */}
            <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 px-4 h-14 flex items-center gap-2">
                <Link href={`/${store.slug}/shop/profile`} className="p-1.5 -ml-1 text-gray-700 hover:bg-gray-100 rounded-full transition active:scale-95">
                    <ArrowLeft size={22} />
                </Link>
                <div className="font-bold text-[17px] text-gray-900">Track Order</div>
            </div>

            {/* Main Content */}
            <div className="p-4 md:p-6 max-w-2xl lg:max-w-[1200px] lg:px-8 mx-auto">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-10 lg:items-start">

                    {/* ─────────────────────────────────────
                        LEFT COLUMN: Order Info + Items + Delivery/Payment
                    ───────────────────────────────────── */}
                    <div className="flex-1 space-y-5">

                        {/* Header Status */}
                        <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 flex flex-col sm:flex-row justify-between sm:items-center gap-2">
                            <div>
                                <h1 className="font-black text-[18px] text-gray-900 tracking-tight">Order #{order.id.slice(0, 8).toUpperCase()}</h1>
                                <p className="text-[13px] font-medium text-gray-500 mt-0.5">{new Date(order.created_at).toLocaleString()}</p>
                            </div>
                        </div>

                        {/* Items Ordered */}
                        <div className="bg-white px-5 pt-5 pb-2 rounded-[20px] shadow-sm border border-gray-100 space-y-4">
                            <h2 className="font-bold text-gray-900 text-[16px] tracking-tight">Items Ordered</h2>
                            <div className="divide-y divide-gray-100 border-t border-gray-100 pt-1">
                                {order.order_items.map((item: any) => (
                                    <div key={item.id} className="flex gap-4 py-4 first:pt-3">
                                        <div className="w-[60px] h-[60px] bg-gray-50 rounded-[12px] overflow-hidden relative flex-shrink-0 border border-gray-100">
                                            {item.product_snapshot?.images?.[0] && (
                                                <Image src={item.product_snapshot.images[0]} alt={item.product_snapshot.name} fill className="object-cover" />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0 flex flex-col justify-center">
                                            <p className="font-bold text-gray-900 text-[14px] leading-snug line-clamp-2">{item.product_snapshot?.name || 'Product'}</p>
                                            <div className="flex justify-between items-center mt-1.5">
                                                <span className="text-[13px] font-medium text-gray-500">Qty: <strong className="text-gray-900">{item.quantity}</strong></span>
                                                <span className="font-black text-[14px] text-gray-900">₹{((item.price_at_purchase || item.product_snapshot?.price || 0) * item.quantity).toLocaleString()}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            <div className="py-4 border-t border-dashed border-gray-200 flex justify-between items-center bg-gray-50/50 -mx-5 px-5 rounded-b-[20px]">
                                <span className="font-bold text-[14px] text-gray-600 uppercase tracking-widest">Total Paid</span>
                                <span className="font-black text-[20px] text-gray-900">₹{order.total_amount.toLocaleString()}</span>
                            </div>
                        </div>

                        {/* Delivery & Payment Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 space-y-3">
                                <h2 className="font-bold text-[13px] text-gray-500 uppercase tracking-widest">Delivery To</h2>
                                <div className="flex gap-3 items-start">
                                    <MapPin className="text-gray-400 mt-0.5 shrink-0" size={18} />
                                    <div className="text-[13px] text-gray-600 leading-relaxed">
                                        <p className="font-bold text-gray-900 text-[14px] mb-1">{address?.full_name || 'Customer'}</p>
                                        <p>{address?.address || address?.address_line1}</p>
                                        <p>{address?.city}, {address?.state} - {address?.pincode}</p>
                                        <div className="flex gap-2 items-center mt-2.5">
                                            <Phone className="text-gray-400 shrink-0" size={14} />
                                            <span className="font-bold">{address?.phone}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-white p-5 rounded-[20px] shadow-sm border border-gray-100 space-y-3 h-fit">
                                <h2 className="font-bold text-[13px] text-gray-500 uppercase tracking-widest">Payment Info</h2>
                                <div className="flex justify-between items-center bg-gray-50 p-3 rounded-[12px] border border-gray-100">
                                    <div className="flex gap-2.5 items-center text-[13px] text-gray-600">
                                        <CreditCard size={18} className="text-gray-400" />
                                        <span className="font-bold text-gray-900">{order.payment_mode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                                    </div>
                                    <span className={`text-[10px] font-black px-2 py-1 rounded-[6px] uppercase tracking-wider
                                            ${order.payment_status === 'paid' ? 'bg-success-light/30 text-success border border-success/20' : 'bg-yellow-50 text-yellow-700 border border-yellow-200'}`}
                                    >
                                        {order.payment_status}
                                    </span>
                                </div>
                            </div>
                        </div>

                    </div>{/* end left column */}

                    {/* ─────────────────────────────────────
                        RIGHT COLUMN: Tracking Timeline (sticky on desktop)
                    ───────────────────────────────────── */}
                    <div className="lg:w-[420px] xl:w-[460px] shrink-0 space-y-5 lg:sticky lg:top-[140px]">
                        <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 relative">
                            <h2 className="font-bold text-gray-900 mb-6 text-[16px] tracking-tight">Tracking Information</h2>

                            {order.status === 'cancelled' ? (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-4 bg-error-light/50 p-4 rounded-[16px] border border-error/20">
                                        <div className="w-12 h-12 bg-white text-error rounded-full flex items-center justify-center shrink-0 shadow-sm">
                                            <XCircle size={24} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-[15px] text-error">Order Cancelled</h3>
                                            {order.cancellation_reason ? (
                                                <p className="text-[13px] text-error/80 font-medium leading-snug mt-0.5">Reason: {order.cancellation_reason}</p>
                                            ) : (
                                                <p className="text-[13px] text-error/80 font-medium leading-snug mt-0.5">This order has been cancelled.</p>
                                            )}
                                        </div>
                                    </div>
                                    {order.payment_mode !== 'cod' && order.payment_status === 'paid' && (
                                        <div className="flex items-start gap-3 bg-orange-50 p-4 rounded-[16px] border border-orange-100/50">
                                            <span className="text-orange-500 text-lg shrink-0 mt-0.5">⚠️</span>
                                            <p className="text-[13px] text-orange-800 font-medium leading-relaxed">
                                                If you paid online, your refund will be processed within 5–7 business days.
                                                For any queries, please contact the shop directly.
                                            </p>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="relative pl-[26px] space-y-8">
                                    {/* Vertical Line Background */}
                                    <div className="absolute left-[39px] top-6 bottom-6 w-[2px] bg-gray-100 rounded-full" />
                                    {/* Active Line Fill */}
                                    <div
                                        className="absolute left-[39px] top-6 w-[2px] bg-primary transition-all duration-700 ease-in-out z-0 rounded-full"
                                        style={{
                                            height: order.status === 'delivered' ? '100%' : order.status === 'shipped' ? '50%' : '0%'
                                        }}
                                    />

                                    {/* Step 1: Order Confirmed */}
                                    <div className="relative z-10 flex gap-5 items-start">
                                        <div className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ring-4 ring-white border-2 border-primary ${order.status ? 'bg-primary' : 'bg-gray-200'}`}>
                                            <Check size={14} strokeWidth={3} />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[15px]">Order Confirmed</h3>
                                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">We have received your order.</p>
                                        </div>
                                    </div>

                                    {/* Step 2: Out for Delivery */}
                                    <div className={`relative z-10 flex gap-5 items-start ${['shipped', 'delivered'].includes(order.status) ? '' : 'opacity-50 grayscale'}`}>
                                        <div className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center shrink-0 text-white shadow-sm ring-4 ring-white border-2 ${['shipped', 'delivered'].includes(order.status) ? 'bg-primary border-primary' : 'bg-white border-gray-300'}`}>
                                            {['shipped', 'delivered'].includes(order.status) ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                        </div>
                                        <div className="w-full">
                                            <h3 className="font-bold text-gray-900 text-[15px]">Out for Delivery</h3>
                                            {order.status === 'shipped' || order.status === 'delivered' ? (
                                                <div className="mt-3 bg-blue-50/50 p-4 rounded-[16px] border border-blue-100/50 space-y-2">
                                                    {order.shipping_partner && (
                                                        <p className="text-[13px] font-medium text-gray-800">Shipped via <span className="font-bold">{order.shipping_partner}</span></p>
                                                    )}
                                                    {order.tracking_number && (
                                                        <p className="text-[13px] text-gray-600">Tracking No: <span className="font-mono font-bold text-gray-900 bg-white px-1.5 py-0.5 rounded border shadow-sm ml-1 select-all">{order.tracking_number}</span></p>
                                                    )}
                                                    {order.estimated_delivery && (
                                                        <p className="text-[13px] text-gray-600">Est. Delivery: <span className="font-bold text-gray-900">{new Date(order.estimated_delivery).toLocaleDateString()}</span></p>
                                                    )}
                                                    {order.shipping_note && (
                                                        <p className="text-[13px] text-gray-500 italic mt-2.5 bg-white p-2.5 rounded-lg border border-gray-100">{order.shipping_note}</p>
                                                    )}
                                                    {order.tracking_number && (
                                                        <a
                                                            href={order.tracking_url || `https://www.google.com/search?q=${encodeURIComponent(order.shipping_partner || '')}+tracking+${encodeURIComponent(order.tracking_number)}`}
                                                            target="_blank"
                                                            rel="noreferrer"
                                                            className="inline-flex items-center justify-center w-full gap-2 mt-4 text-[14px] font-bold text-primary bg-white px-4 py-3 rounded-xl shadow-sm border border-gray-200 hover:border-primary/30 transition active:scale-95"
                                                        >
                                                            <Truck size={18} /> Track Your Order
                                                        </a>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-[13px] text-gray-500 font-medium mt-0.5">The shopkeeper has dispatched your order.</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Step 3: Delivered */}
                                    <div className={`relative z-10 flex gap-5 items-start ${order.status === 'delivered' ? '' : 'opacity-50 grayscale'}`}>
                                        <div className={`w-7 h-7 mt-0.5 rounded-full flex items-center justify-center shrink-0 ring-4 ring-white border-2 ${order.status === 'delivered' ? 'bg-success text-white border-success shadow-md' : 'bg-white text-gray-400 border-gray-300'}`}>
                                            {order.status === 'delivered' ? <Check size={14} strokeWidth={3} /> : <div className="w-2 h-2 rounded-full bg-gray-300" />}
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-[15px]">Delivered</h3>
                                            <p className="text-[13px] text-gray-500 font-medium mt-0.5">Order has been delivered successfully.</p>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>{/* end right column */}

                </div>{/* end two-column flex */}
            </div>{/* end outer container */}
        </div>
    )
}
