'use client'

import { useState, useEffect } from 'react'
import { getOrderDetail, updateOrderStatus, markOrderDelivered, cancelOrder, markOrderAsPaid } from '@/app/actions/order'
import { createShipment, saveManualShipping } from '@/app/actions/shipping'
import { Package, Truck, CheckCircle, MapPin, User, Clock, AlertTriangle, PenTool, CheckCheck, XCircle, ChevronRight } from 'lucide-react'
import Image from 'next/image'

const COURIER_SUGGESTIONS = ['India Post', 'DTDC', 'BlueDart', 'Delhivery', 'Ekart', 'Ecom Express', 'XpressBees', 'Amazon Logistics'];

const CANCEL_REASONS = [
    'Customer requested cancellation',
    'Item out of stock',
    'Customer not reachable',
    'Fraudulent order',
    'Payment issue',
    'Other',
]

// The canonical status flow (lowercase internally)
const STATUS_STEPS = ['pending', 'confirmed', 'packed', 'shipped', 'delivered']

function getStepIndex(status: string) {
    return STATUS_STEPS.indexOf((status || '').toLowerCase())
}

// Toast component
function Toast({ message, type, onClose }: { message: string, type: 'success' | 'error', onClose: () => void }) {
    useEffect(() => {
        const t = setTimeout(onClose, 4000)
        return () => clearTimeout(t)
    }, [onClose])
    return (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-xl text-white text-sm font-medium transition-all
            ${type === 'success' ? 'bg-green-600' : 'bg-red-600'}`}>
            {type === 'success' ? <CheckCheck size={18} /> : <XCircle size={18} />}
            {message}
        </div>
    )
}

// Order Progress Bar
function OrderProgressBar({
    status,
    orderId,
    paymentMode,
    onStatusChange,
}: {
    status: string,
    orderId: string,
    paymentMode: string,
    onStatusChange: () => void,
}) {
    const [actionLoading, setActionLoading] = useState(false)
    const [showDeliveredDialog, setShowDeliveredDialog] = useState(false)
    const [showCancelDialog, setShowCancelDialog] = useState(false)
    const [cancelReason, setCancelReason] = useState('')
    const [cancelNotes, setCancelNotes] = useState('')
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)

    const statusLower = (status || '').toLowerCase()
    const currentStep = getStepIndex(statusLower)
    const isCancelled = statusLower === 'cancelled'
    const isDelivered = statusLower === 'delivered'
    const isFinal = isCancelled || isDelivered

    const displaySteps = ['confirmed', 'packed', 'shipped', 'delivered']

    async function handleSimpleStatus(newStatus: string) {
        setActionLoading(true)
        await updateOrderStatus(orderId, newStatus)
        onStatusChange()
        setActionLoading(false)
        setToast({ message: `Order marked as ${newStatus}! ✅`, type: 'success' })
    }

    async function handleMarkDelivered() {
        setShowDeliveredDialog(false)
        setActionLoading(true)
        const res = await markOrderDelivered(orderId)
        setActionLoading(false)
        if (res.error) {
            setToast({ message: res.error, type: 'error' })
        } else {
            onStatusChange()
            setToast({
                message: `Order marked as delivered! ✅${res.pointsAwarded ? ` ${res.pointsAwarded} loyalty points awarded.` : ''}`,
                type: 'success'
            })
        }
    }

    async function handleCancel() {
        if (!cancelReason) return
        setShowCancelDialog(false)
        setActionLoading(true)
        const res = await cancelOrder(orderId, cancelReason, cancelNotes)
        setActionLoading(false)
        if (res.error) {
            setToast({ message: res.error, type: 'error' })
        } else {
            onStatusChange()
            let msg = 'Order cancelled successfully'
            if (res.showRefundReminder) msg += '. ⚠️ Remember to initiate refund via Razorpay dashboard.'
            setToast({ message: msg, type: 'success' })
            setCancelReason('')
            setCancelNotes('')
        }
    }

    function getStepState(step: string) {
        const stepIdx = getStepIndex(step)
        if (isCancelled) return 'cancelled'
        if (stepIdx < currentStep) return 'completed'
        if (stepIdx === currentStep) return 'current'
        if (stepIdx === currentStep + 1) return 'next'
        return 'future'
    }

    function renderStepButton(step: string) {
        const state = getStepState(step)
        const label = step.charAt(0).toUpperCase() + step.slice(1)

        const baseClasses = 'flex flex-col items-center gap-1 cursor-pointer focus:outline-none'

        // Icon circle
        let circleClass = 'w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold border-2 transition-all '
        let labelClass = 'text-xs font-semibold mt-0.5 '
        let onClick: (() => void) | undefined = undefined

        if (state === 'completed') {
            circleClass += 'bg-green-500 border-green-500 text-white'
            labelClass += 'text-green-600'
        } else if (state === 'current') {
            circleClass += 'bg-blue-600 border-blue-600 text-white shadow-md'
            labelClass += 'text-blue-700'
        } else if (state === 'next' && !actionLoading) {
            circleClass += 'bg-white border-blue-500 text-blue-600 hover:bg-blue-50'
            labelClass += 'text-blue-600'
            if (step === 'delivered') {
                onClick = () => setShowDeliveredDialog(true)
            } else {
                onClick = () => handleSimpleStatus(step)
            }
        } else {
            circleClass += 'bg-gray-100 border-gray-200 text-gray-400 cursor-default'
            labelClass += 'text-gray-400'
        }

        return (
            <button key={step} onClick={onClick} disabled={!onClick || actionLoading} className={baseClasses}>
                <div className={circleClass}>
                    {state === 'completed' ? '✓' : label.charAt(0)}
                </div>
                <span className={labelClass}>{label}</span>
            </button>
        )
    }

    return (
        <>
            <div className="bg-white rounded-xl shadow-sm border p-5">
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold text-gray-900 text-sm">Order Progress</h3>
                    {actionLoading && <span className="text-xs text-blue-600 flex items-center gap-1"><Clock size={12} className="animate-spin" /> Updating...</span>}
                </div>

                {isCancelled ? (
                    <div className="flex items-center gap-3 px-4 py-3 bg-red-50 rounded-xl border border-red-100">
                        <XCircle size={22} className="text-red-500 shrink-0" />
                        <div>
                            <p className="font-bold text-red-700 text-sm">Order Cancelled</p>
                            <p className="text-xs text-red-500">This order has been cancelled and cannot be updated.</p>
                        </div>
                    </div>
                ) : (
                    <div className="flex items-center gap-2">
                        {displaySteps.map((step, i) => (
                            <div key={step} className="flex items-center gap-2 flex-1 last:flex-none">
                                {renderStepButton(step)}
                                {i < displaySteps.length - 1 && (
                                    <div className={`flex-1 h-0.5 rounded ${getStepIndex(step) < currentStep ? 'bg-green-400' : 'bg-gray-200'}`} />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* Cancel Button */}
                {!isFinal && (
                    <div className="mt-4 pt-3 border-t flex justify-end">
                        <button
                            onClick={() => setShowCancelDialog(true)}
                            disabled={actionLoading}
                            className="flex items-center gap-2 text-xs font-bold text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 px-4 py-2 rounded-lg border border-red-200 transition disabled:opacity-50"
                        >
                            <XCircle size={14} />
                            Cancel Order
                        </button>
                    </div>
                )}
            </div>

            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Delivered Confirmation Dialog */}
            {showDeliveredDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-7 max-w-sm w-full space-y-4 animate-in fade-in zoom-in">
                        <div className="text-center">
                            <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                                <CheckCheck size={28} className="text-green-600" />
                            </div>
                            <h3 className="font-black text-gray-900 text-lg">Mark as Delivered?</h3>
                            <p className="text-sm text-gray-500 mt-2">
                                Confirm that this order has been delivered to the customer.
                                {paymentMode === 'cod' && <span className="block mt-1 text-amber-600 font-medium">COD payment will be marked as collected.</span>}
                            </p>
                        </div>
                        <div className="flex gap-3">
                            <button
                                onClick={() => setShowDeliveredDialog(false)}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition text-sm"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleMarkDelivered}
                                className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl font-bold hover:bg-green-700 transition text-sm"
                            >
                                Yes, Delivered ✅
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Cancel Order Dialog */}
            {showCancelDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-2xl shadow-2xl p-6 max-w-md w-full space-y-4 animate-in fade-in zoom-in max-h-[90vh] overflow-y-auto">
                        <div className="flex items-center gap-2">
                            <XCircle className="text-red-500" size={22} />
                            <h3 className="font-black text-gray-900">Cancel Order?</h3>
                        </div>

                        <p className="text-sm text-gray-500">Please select a reason for cancellation:</p>

                        <div className="space-y-2">
                            {CANCEL_REASONS.map(reason => (
                                <label key={reason} className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition
                                    ${cancelReason === reason ? 'border-red-400 bg-red-50' : 'border-gray-100 hover:border-gray-300'}`}>
                                    <input
                                        type="radio"
                                        name="cancel-reason"
                                        value={reason}
                                        checked={cancelReason === reason}
                                        onChange={() => setCancelReason(reason)}
                                        className="accent-red-500"
                                    />
                                    <span className="text-sm text-gray-700 font-medium">{reason}</span>
                                </label>
                            ))}
                        </div>

                        <div>
                            <label className="text-xs font-bold text-gray-500">Additional Notes (optional)</label>
                            <textarea
                                value={cancelNotes}
                                onChange={e => setCancelNotes(e.target.value)}
                                className="w-full mt-1 border border-gray-200 rounded-xl p-3 text-sm focus:outline-none focus:border-red-400 resize-none"
                                rows={2}
                                placeholder="Any other details..."
                            />
                        </div>

                        <div className="flex gap-3 pt-1">
                            <button
                                onClick={() => { setShowCancelDialog(false); setCancelReason(''); setCancelNotes('') }}
                                className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-700 hover:bg-gray-50 transition text-sm"
                            >
                                Keep Order
                            </button>
                            <button
                                onClick={handleCancel}
                                disabled={!cancelReason}
                                className="flex-1 px-4 py-2.5 bg-red-600 text-white rounded-xl font-bold hover:bg-red-700 disabled:opacity-50 transition text-sm"
                            >
                                Confirm Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}

export default function OrderDetailPage({ params }: { params: { id: string } }) {
    const [order, setOrder] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [shippingLoading, setShippingLoading] = useState(false)
    const [shippingOption, setShippingOption] = useState<'logistics' | 'manual' | null>(null)

    // Manual shipping state
    const [courier, setCourier] = useState('')
    const [trackingNumber, setTrackingNumber] = useState('')
    const [trackingUrl, setTrackingUrl] = useState('')
    const [estDelivery, setEstDelivery] = useState('')
    const [shippingNote, setShippingNote] = useState('')
    const [toast, setToast] = useState<{ message: string, type: 'success' | 'error' } | null>(null)
    const [payActionLoading, setPayActionLoading] = useState(false)

    useEffect(() => {
        loadOrder()
    }, [params.id])

    async function loadOrder() {
        setLoading(true)
        const data = await getOrderDetail(params.id)
        setOrder(data)
        setLoading(false)
    }

    async function handleShip() {
        if (!confirm('Create shipment via Shiprocket (Simulated)?')) return
        setShippingLoading(true)
        const res = await createShipment(params.id)
        if (res.success) {
            alert('Shipment created! Tracking AWB: ' + res.awb)
            loadOrder()
        } else {
            alert('Shipping Error')
        }
        setShippingLoading(false)
    }

    async function handleManualShip() {
        if (!courier || !trackingNumber) return alert('Please enter Courier Name and Tracking Number');
        setShippingLoading(true)
        const res = await saveManualShipping(params.id, {
            partner: courier,
            trackingNumber,
            trackingUrl,
            estDelivery,
            note: shippingNote
        })
        if (res.success) {
            alert('Manual Shipping details saved!')
            loadOrder()
        } else {
            alert('Error saving shipping details: ' + res.error)
        }
        setShippingLoading(false)
    }

    if (loading) return <div className="p-8 text-center text-gray-500">Loading order details...</div>
    if (!order) return <div className="p-8 text-center text-red-500">Order not found.</div>

    const statusLower = (order.status || '').toLowerCase()
    const isShipped = statusLower === 'shipped' || statusLower === 'delivered'
    const isCancelled = statusLower === 'cancelled'

    const shippingDetails = typeof order?.stores?.shipping_details === 'string'
        ? (() => { try { return JSON.parse(order.stores.shipping_details) } catch { return {} } })()
        : (order?.stores?.shipping_details || {})

    const provider = shippingDetails?.provider || 'Manual' // e.g. 'Delhivery', 'Shiprocket', 'Manual'

    return (
        <div className="space-y-6 max-w-5xl mx-auto">
            {/* Toast */}
            {toast && <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />}

            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Order #{order.id.slice(0, 8)}</h1>
                    <p className="text-sm text-gray-500">Placed on {new Date(order.created_at).toLocaleString()}</p>
                </div>
                <span className={`px-4 py-1.5 rounded-full text-sm font-bold border
                    ${isCancelled ? 'bg-red-50 text-red-700 border-red-200'
                        : statusLower === 'delivered' ? 'bg-green-50 text-green-700 border-green-200'
                            : statusLower === 'shipped' ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : 'bg-gray-100 text-gray-700 border-gray-200'}`}>
                    {order.status}
                </span>
            </div>

            {/* Status Bar */}
            <OrderProgressBar
                status={order.status}
                orderId={params.id}
                paymentMode={order.payment_mode}
                onStatusChange={loadOrder}
            />

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main Content */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Items */}
                    <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
                        <div className="p-4 bg-gray-50 border-b font-bold text-gray-700">Order Items</div>
                        <div className="divide-y">
                            {order.items.map((item: any) => (
                                <div key={item.id} className="p-4 flex gap-4">
                                    <div className="w-16 h-16 bg-gray-100 rounded-lg relative overflow-hidden flex-shrink-0">
                                        {item.product?.images?.[0] && (
                                            <Image
                                                src={item.product.images[0]}
                                                alt={item.product.name}
                                                fill
                                                className="object-cover"
                                            />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-medium text-gray-900">{item.product?.name}</h3>
                                        <p className="text-sm text-gray-500">Qty: {item.quantity}</p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-bold">₹{(item.price_at_purchase || item.product?.price || 0) * item.quantity}</p>
                                        <p className="text-xs text-gray-400">₹{item.price_at_purchase || item.product?.price || 0} ea</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
                            <span className="font-bold text-gray-700">Total Amount</span>
                            <span className="text-xl font-bold text-gray-900">₹{order.total_amount}</span>
                        </div>
                    </div>

                    {/* Shipping Logic */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-purple-100 text-purple-600 rounded-lg">
                                <Truck size={20} />
                            </div>
                            <h3 className="font-bold text-gray-900">Shipping & Fulfillment</h3>
                        </div>

                        {isShipped ? (
                            <div className="bg-green-50 text-green-700 p-4 rounded-lg flex items-center gap-3">
                                <CheckCircle size={20} />
                                <div>
                                    <p className="font-bold">Order Shipped</p>
                                    <p className="text-sm">Tracking info updated. {order.shipping_partner ? `Shipped via ${order.shipping_partner}` : ''}</p>
                                    {order.tracking_number && <p className="text-sm font-mono mt-1 font-bold">AWB: {order.tracking_number}</p>}
                                </div>
                            </div>
                        ) : isCancelled ? (
                            <p className="text-sm text-gray-500 italic">Cannot ship a cancelled order.</p>
                        ) : (
                            <div className="space-y-4">
                                {!shippingOption && (
                                    <>
                                        <div className="mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100 flex items-center justify-between">
                                            <span className="text-sm text-gray-600">Configured Shipping Mode:</span>
                                            <span className="px-2.5 py-1 bg-white border border-gray-200 rounded-md text-xs font-bold text-gray-800 shadow-sm">{provider}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">How do you want to ship this order?</p>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                            {(provider === 'Delhivery' || provider === 'Shiprocket') ? (
                                                <button
                                                    onClick={() => setShippingOption('logistics')}
                                                    className="border-2 border-dashed border-purple-300 bg-purple-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-purple-500 hover:bg-purple-100 transition text-center shadow-sm"
                                                >
                                                    <div className="p-3 bg-purple-100 text-purple-600 rounded-full"><Truck size={24} /></div>
                                                    <h4 className="font-bold text-gray-900">Schedule Pickup</h4>
                                                    <p className="text-xs text-gray-500">Auto-generate AWB via {provider}</p>
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => setShippingOption('manual')}
                                                    className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-blue-500 hover:bg-blue-100 transition text-center shadow-sm"
                                                >
                                                    <div className="p-3 bg-blue-100 text-blue-600 rounded-full"><PenTool size={24} /></div>
                                                    <h4 className="font-bold text-gray-900">Manual Dispatch</h4>
                                                    <p className="text-xs text-gray-500">Enter shipping AWB yourself</p>
                                                </button>
                                            )}

                                            {/* Allow manual override for API providers just in case */}
                                            {(provider === 'Delhivery' || provider === 'Shiprocket') && (
                                                <button
                                                    onClick={() => setShippingOption('manual')}
                                                    className="border-2 border-dashed border-gray-200 rounded-xl p-4 flex flex-col items-center justify-center gap-2 hover:border-gray-400 transition text-center opacity-70 hover:opacity-100"
                                                >
                                                    <div className="p-2 bg-gray-100 text-gray-500 rounded-full"><PenTool size={18} /></div>
                                                    <h4 className="font-bold text-gray-700 text-sm">Self-Ship Override</h4>
                                                </button>
                                            )}
                                        </div>
                                    </>
                                )}

                                {shippingOption === 'logistics' && (
                                    <div className="bg-gray-50 border rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-900">Ship with Logistics Partner</h4>
                                            <button onClick={() => setShippingOption(null)} className="text-sm text-gray-500 hover:text-gray-900">Back</button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Select Provider</label>
                                                <select className="w-full mt-1 border rounded-lg p-2 text-sm bg-gray-50 text-gray-700 outline-none" disabled>
                                                    <option>{provider} (Simulated for Demo)</option>
                                                </select>
                                            </div>
                                            <button
                                                onClick={handleShip}
                                                disabled={shippingLoading}
                                                className="w-full bg-purple-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-purple-700 disabled:opacity-50 transition flex items-center justify-center gap-2"
                                            >
                                                {shippingLoading ? <Clock size={16} className="animate-spin" /> : <Truck size={16} />}
                                                Generate Shipment & Label
                                            </button>
                                            <p className="text-xs text-gray-400 text-center">Note: Requires API credentials configured in Settings → Logistics</p>
                                        </div>
                                    </div>
                                )}

                                {shippingOption === 'manual' && (
                                    <div className="bg-gray-50 border rounded-xl p-4">
                                        <div className="flex justify-between items-center mb-4">
                                            <h4 className="font-bold text-gray-900">✍️ Manual Shipping Details</h4>
                                            <button onClick={() => setShippingOption(null)} className="text-sm text-gray-500 hover:text-gray-900">Back</button>
                                        </div>
                                        <div className="space-y-3">
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Courier Partner Name <span className="text-red-500">*</span></label>
                                                <input
                                                    list="courier-suggestions"
                                                    value={courier}
                                                    onChange={(e) => setCourier(e.target.value)}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm bg-white outline-none focus:border-blue-500"
                                                    placeholder="e.g. India Post, DTDC..."
                                                />
                                                <datalist id="courier-suggestions">
                                                    {COURIER_SUGGESTIONS.map(c => <option key={c} value={c} />)}
                                                </datalist>
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Tracking Number / AWB <span className="text-red-500">*</span></label>
                                                <input
                                                    value={trackingNumber}
                                                    onChange={(e) => setTrackingNumber(e.target.value)}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm bg-white outline-none focus:border-blue-500"
                                                    placeholder="Enter tracking number"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Tracking Website URL</label>
                                                <input
                                                    type="url"
                                                    value={trackingUrl}
                                                    onChange={(e) => setTrackingUrl(e.target.value)}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm bg-white outline-none focus:border-blue-500"
                                                    placeholder="https://..."
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Estimated Delivery Date</label>
                                                <input
                                                    type="date"
                                                    value={estDelivery}
                                                    onChange={(e) => setEstDelivery(e.target.value)}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm bg-white outline-none focus:border-blue-500"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs font-bold text-gray-500">Note to Customer (optional)</label>
                                                <textarea
                                                    value={shippingNote}
                                                    onChange={(e) => setShippingNote(e.target.value)}
                                                    className="w-full mt-1 border rounded-lg p-2 text-sm bg-white outline-none focus:border-blue-500"
                                                    placeholder="Your order has been shipped via..."
                                                    rows={2}
                                                />
                                            </div>
                                            <button
                                                onClick={handleManualShip}
                                                disabled={shippingLoading || !courier || !trackingNumber}
                                                className="w-full bg-blue-600 text-white px-6 py-2 rounded-lg font-bold hover:bg-blue-700 disabled:opacity-50 transition flex items-center justify-center gap-2 mt-2"
                                            >
                                                {shippingLoading ? <Clock size={16} className="animate-spin" /> : <CheckCircle size={16} />}
                                                💾 Save & Mark as Shipped
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    {/* Customer */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <User size={18} className="text-gray-400" /> Customer
                        </h3>
                        <div className="space-y-2">
                            <p className="font-medium">{order.customers?.full_name || 'Guest'}</p>
                            <p className="text-sm text-gray-500">{order.customers?.email}</p>
                            <p className="text-sm text-gray-500">{order.customers?.mobile}</p>
                            <div className="mt-2 pt-2 border-t text-xs">
                                <span className={`px-2 py-1 rounded bg-gray-100`}>
                                    {order.customers?.tag || 'New Customer'}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Address */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <MapPin size={18} className="text-gray-400" /> Shipping Address
                        </h3>
                        {order.delivery_address ? (
                            <div className="text-sm text-gray-600 space-y-1">
                                {(() => {
                                    const addr = typeof order.delivery_address === 'string' ? JSON.parse(order.delivery_address) : order.delivery_address;
                                    return (
                                        <>
                                            <p className="font-medium text-gray-900">{addr.full_name || 'Name not provided'}</p>
                                            <p>{addr.address || addr.address_line1}</p>
                                            <p>{addr.city}, {addr.state} - {addr.pincode}</p>
                                            <p>Phone: {addr.phone}</p>
                                        </>
                                    )
                                })()}
                            </div>
                        ) : (
                            <p className="text-sm text-red-500">Address not found</p>
                        )}
                    </div>

                    {/* Payment Info */}
                    <div className="bg-white rounded-xl shadow-sm border p-6">
                        <h3 className="font-bold text-gray-900 mb-4 flex items-center gap-2">
                            <AlertTriangle size={18} className="text-gray-400" /> Payment
                        </h3>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-gray-500">Method</span>
                                <span className="font-bold">{order.payment_mode === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</span>
                            </div>
                            <div className="flex justify-between items-center">
                                <span className="text-gray-500">Status</span>
                                <div className="flex items-center gap-3">
                                    <span className={`font-bold capitalize ${order.payment_status === 'paid' ? 'text-green-600' : 'text-orange-500'}`}>
                                        {order.payment_status}
                                    </span>
                                    {order.payment_mode === 'cod' && order.payment_status !== 'paid' && !isCancelled && (
                                        <button
                                            onClick={async () => {
                                                if (!confirm('Are you sure you want to mark this COD order as paid?')) return;
                                                setPayActionLoading(true)
                                                try {
                                                    const res = await markOrderAsPaid(params.id)
                                                    if (res.error) setToast({ message: res.error, type: 'error' })
                                                    else {
                                                        setToast({ message: 'Order marked as paid', type: 'success' })
                                                        loadOrder()
                                                    }
                                                } catch (e: any) {
                                                    setToast({ message: e.message || 'Error occurred', type: 'error' })
                                                } finally {
                                                    setPayActionLoading(false)
                                                }
                                            }}
                                            disabled={payActionLoading}
                                            className="ml-2 text-xs bg-green-100 hover:bg-green-200 text-green-700 px-3 py-1 rounded-full font-bold transition-colors disabled:opacity-50"
                                        >
                                            {payActionLoading ? 'Saving...' : 'Mark as Paid'}
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Cancellation info (if cancelled) */}
                    {isCancelled && order.cancellation_reason && (
                        <div className="bg-red-50 rounded-xl border border-red-100 p-5">
                            <h3 className="font-bold text-red-700 mb-2 flex items-center gap-2">
                                <XCircle size={16} /> Cancellation Details
                            </h3>
                            <p className="text-sm text-red-600"><span className="font-medium">Reason:</span> {order.cancellation_reason}</p>
                            {order.cancelled_at && (
                                <p className="text-xs text-red-400 mt-1">
                                    {new Date(order.cancelled_at).toLocaleString()}
                                </p>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
