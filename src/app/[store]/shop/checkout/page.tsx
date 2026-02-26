'use client'

import { useState, useEffect } from 'react'
import { getCart } from '@/app/actions/cart'
import { getStoreBySlug } from '@/app/actions/storefront'
import { getCustomerAddresses, addAddress, getCurrentCustomer } from '@/app/actions/customer'
import { createOrder } from '@/app/actions/checkout'
import StoreHeader from '@/components/storefront/StoreHeader'
import { Loader2, MapPin, CheckCircle, CreditCard, Banknote, ShieldAlert, AlertTriangle, Star, Check, ArrowLeft, ArrowRight } from 'lucide-react'
import { useRouter } from 'next/navigation'
import Script from 'next/script'
import Link from 'next/link'
import Image from 'next/image'
import { Button } from '@/components/ui/Button'

export default function CheckoutPage({ params }: { params: { store: string } }) {
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [step, setStep] = useState<1 | 2 | 3>(1)

    const [cart, setCart] = useState<any>(null)
    const [store, setStore] = useState<any>(null)
    const [addresses, setAddresses] = useState<any[]>([])
    const [showAddressForm, setShowAddressForm] = useState(false)
    const [selectedAddressId, setSelectedAddressId] = useState<string>('')
    const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod')
    const [buyer, setBuyer] = useState<any>(null)

    // QA Modals
    const [showMockRazorpay, setShowMockRazorpay] = useState(false)
    const [mockOrderDetails, setMockOrderDetails] = useState<any>(null)

    // New Address State
    const [newAddress, setNewAddress] = useState({
        full_name: '', phone: '', address_line1: '', city: '', state: '', pincode: '', is_default: true
    })

    // Loyalty Points State
    const [usePoints, setUsePoints] = useState(false)
    const [pointsToRedeem, setPointsToRedeem] = useState<number | ''>('')

    const router = useRouter()

    useEffect(() => {
        async function init() {
            setLoading(true)
            const storeData = await getStoreBySlug(params.store)
            if (!storeData) {
                setLoading(false)
                return
            }
            setStore(storeData)

            const cartData = await getCart(storeData.id)
            if (!cartData || !cartData.cart_items || cartData.cart_items.length === 0) {
                router.push(`/${params.store}/shop/cart`)
                return
            }
            setCart(cartData)

            const customerData = await getCurrentCustomer(storeData.id)
            setBuyer(customerData)

            if (customerData?.cod_blocked) {
                setPaymentMethod('online')
            }

            const addressData = await getCustomerAddresses(storeData.id)
            setAddresses(addressData)
            if (addressData.length > 0) {
                const defaultAddr = addressData.find((a: any) => a.is_default) || addressData[0]
                setSelectedAddressId(defaultAddr.id)
            } else {
                setShowAddressForm(true)
            }

            setLoading(false)
        }
        init()
    }, [params.store, router])

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitting(true)
        const result = await addAddress(store.id, newAddress)
        if (result.success) {
            const updated = await getCustomerAddresses(store.id)
            setAddresses(updated)
            const newDefault = updated.find((a: any) => a.is_default) || updated[0]
            setSelectedAddressId(newDefault.id)
            setShowAddressForm(false)
        } else {
            alert('Failed to save address: ' + result.error)
        }
        setSubmitting(false)
    }

    const handlePlaceOrder = async () => {
        if (!selectedAddressId) return alert('Please select a delivery address')

        setSubmitting(true)

        // Calculate accurate redemption points to pass
        const currentSubtotal = cart?.cart_items?.reduce((acc: number, item: any) => acc + (item.products.price * item.quantity), 0) || 0
        const maxRed = Math.min(buyer?.loyalty_points || 0, currentSubtotal * 5)
        const finalPts = usePoints ? Math.min(Number(pointsToRedeem) || 0, maxRed) : 0

        // 1. Create Order (Pending Payment)
        const result = await createOrder(store.id, cart.id, selectedAddressId, paymentMethod, finalPts)

        if (!result.success) {
            alert('Failed to place order: ' + result.error)
            setSubmitting(false)
            return
        }

        if (paymentMethod === 'cod') {
            router.push(`/${params.store}/shop/order/success/${result.orderId}`)
            return
        }

        // 2. Handle Razorpay
        try {
            const { createRazorpayOrder, verifyPayment } = await import('@/app/actions/payment')
            const rzOrder = await createRazorpayOrder(result.orderId!)

            if (rzOrder.error || !rzOrder.razorpayOrderId) {
                alert('Payment initialization failed: ' + rzOrder.error)
                setSubmitting(false)
                return
            }

            if (rzOrder.keyId === 'rzp_test_1MBZ2z9F9w123p') {
                // Trigger Simulator Modal natively to avoid Playwright evaluate crashes
                setMockOrderDetails({ orderId: result.orderId, rzOrderId: rzOrder.razorpayOrderId })
                setShowMockRazorpay(true)
                return
            }

            const options = {
                key: rzOrder.keyId,
                amount: rzOrder.amount,
                currency: rzOrder.currency,
                name: store.name,
                description: `Order #${result.orderId?.slice(0, 8)}`,
                image: store.logo_url,
                order_id: rzOrder.razorpayOrderId,
                handler: async function (response: any) {
                    const verification = await verifyPayment(
                        result.orderId!,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    )

                    if (verification.success) {
                        router.push(`/${params.store}/shop/order/success/${result.orderId}`)
                    } else {
                        alert('Payment verification failed. Please contact support.')
                        setSubmitting(false)
                    }
                },
                prefill: {
                    name: addresses.find((a: any) => a.id === selectedAddressId)?.full_name,
                    contact: addresses.find((a: any) => a.id === selectedAddressId)?.phone,
                },
                theme: {
                    color: store.primary_color || '#000000'
                },
                modal: {
                    ondismiss: function () {
                        setSubmitting(false)
                    }
                }
            };

            const rzp1 = new (window as any).Razorpay(options);
            rzp1.open();

        } catch (error: any) {
            console.error('Payment Error:', error)
            alert('Something went wrong during payment.')
            setSubmitting(false)
        }
    }

    if (loading) return <div className="min-h-screen bg-gray-50 flex items-center justify-center"><Loader2 className="animate-spin text-primary" size={48} /></div>

    if (buyer?.is_banned) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col items-center">
                <StoreHeader storeId={store.id} storeName={store.name} storeSlug={store.slug} logoUrl={store.logo_url} showBack={true} />
                <div className="bg-white p-8 rounded-2xl shadow-sm border max-w-md text-center mt-20 mx-4">
                    <ShieldAlert size={56} className="text-red-500 mx-auto mb-4" />
                    <h1 className="text-2xl font-black text-gray-900 mb-2">Account Restricted</h1>
                    <p className="text-gray-600 mb-6 font-medium">Your checkout privileges have been suspended by the store owner for the following reason:</p>
                    <div className="bg-red-50 border border-red-100 text-red-800 p-4 rounded-xl font-bold text-sm mb-6">
                        {buyer.ban_reason || 'Violation of store policies.'}
                    </div>
                    <button onClick={() => router.push(`/${params.store}/shop`)} className="bg-black text-white px-8 py-3 rounded-xl font-bold shadow-lg hover:bg-gray-800 transition">Return to Shop</button>
                </div>
            </div>
        )
    }

    const subtotal = cart?.cart_items?.reduce((acc: number, item: any) => acc + (item.products.price * item.quantity), 0) || 0

    // Loyalty calculations
    const availablePoints = buyer?.loyalty_points || 0
    const maxDiscount = subtotal * 0.5
    const maxRedeemablePoints = Math.min(availablePoints, maxDiscount * 10)

    let computedDiscount = 0
    let actualPointsUsed = 0

    if (usePoints) {
        actualPointsUsed = Math.min(Number(pointsToRedeem) || 0, maxRedeemablePoints)
        computedDiscount = actualPointsUsed / 10
    }

    const shippingDetails = typeof store?.shipping_details === 'string'
        ? (() => { try { return JSON.parse(store.shipping_details) } catch { return {} } })()
        : (store?.shipping_details || {})

    const deliveryFee = Number(shippingDetails?.shipping_price) || 0

    const total = Math.max(0, subtotal + deliveryFee - computedDiscount)

    const ProgressBar = () => (
        <div className="bg-white px-8 py-5 border-b border-gray-100 flex items-center justify-between relative shadow-sm z-30 sticky top-14 md:top-0">
            {/* Background Track */}
            <div className="absolute top-1/2 left-12 right-12 h-1 bg-gray-100 -z-10 -translate-y-1/2 rounded-full" />

            {/* Active Track */}
            <div
                className="absolute top-1/2 left-12 h-1 bg-primary -z-10 -translate-y-1/2 rounded-full transition-all duration-500 ease-in-out"
                style={{ width: step === 1 ? '0%' : step === 2 ? '50%' : 'calc(100% - 96px)' }}
            />

            {/* Step 1 */}
            <div className={`flex flex-col items-center gap-2 transition-colors ${step >= 1 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-300 ${step > 1 ? 'bg-primary text-white border-2 border-primary' : step === 1 ? 'bg-white text-primary border-2 border-primary ring-4 ring-blue-50' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                    {step > 1 ? <Check size={14} strokeWidth={3} /> : '1'}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Address</span>
            </div>

            {/* Step 2 */}
            <div className={`flex flex-col items-center gap-2 transition-colors ${step >= 2 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-300 ${step > 2 ? 'bg-primary text-white border-2 border-primary' : step === 2 ? 'bg-white text-primary border-2 border-primary ring-4 ring-blue-50' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                    {step > 2 ? <Check size={14} strokeWidth={3} /> : '2'}
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Payment</span>
            </div>

            {/* Step 3 */}
            <div className={`flex flex-col items-center gap-2 transition-colors ${step >= 3 ? 'text-primary' : 'text-gray-400'}`}>
                <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[13px] transition-all duration-300 ${step === 3 ? 'bg-white text-primary border-2 border-primary ring-4 ring-blue-50' : 'bg-gray-100 text-gray-400 border-2 border-white'}`}>
                    3
                </div>
                <span className="text-[10px] font-bold uppercase tracking-wider">Confirm</span>
            </div>
        </div>
    )

    return (
        <div className="bg-gray-50 min-h-screen pb-32 flex flex-col">
            <div className="hidden md:block">
                <StoreHeader storeName={store.name} storeSlug={store.slug} logoUrl={store.logo_url} showBack={true} />
            </div>

            {/* Mobile sticky top */}
            <div className="md:hidden sticky top-0 z-40 bg-white/95 backdrop-blur-md shadow-sm border-b border-gray-100 h-14 flex items-center px-4 gap-2">
                <Link href={`/${store.slug}/shop/cart`} className="p-1.5 -ml-1 text-gray-700 hover:bg-gray-100 rounded-full transition active:scale-95">
                    <ArrowLeft size={22} />
                </Link>
                <div className="font-bold text-[17px] text-gray-900">Secure Checkout</div>
            </div>

            <ProgressBar />

            <div className="flex-1 p-4 md:p-6 max-w-7xl mx-auto w-full">
                <div className="flex flex-col lg:flex-row gap-6 lg:gap-8 min-h-[500px]">

                    {/* LEFT COLUMN: Checkout Steps */}
                    <div className="flex-1 space-y-6">

                        {/* STEP 1: ADDRESS */}
                        {step === 1 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                                <div className="bg-white p-5 md:p-8 rounded-[24px] shadow-sm border border-gray-100">
                                    <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">1</div>
                                            <h2 className="text-[20px] md:text-[22px] font-black text-gray-900 tracking-tight">Delivery Address</h2>
                                        </div>
                                        {!showAddressForm && addresses.length > 0 && (
                                            <button onClick={() => setShowAddressForm(true)} className="text-primary text-[14px] font-bold bg-primary/10 hover:bg-primary/20 px-4 py-2 rounded-full active:scale-95 transition-all">Add New Address</button>
                                        )}
                                    </div>

                                    {showAddressForm ? (
                                        <form onSubmit={handleAddressSubmit} className="space-y-5 max-w-xl">
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                                <div>
                                                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Full Name</label>
                                                    <input placeholder="John Doe" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-[15px] font-medium" required
                                                        value={newAddress.full_name} onChange={e => setNewAddress({ ...newAddress, full_name: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Phone Number</label>
                                                    <input type="tel" placeholder="+91 9876543210" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-[15px] font-medium" required
                                                        value={newAddress.phone} onChange={e => setNewAddress({ ...newAddress, phone: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Address (House No, Building, Street)</label>
                                                <textarea placeholder="Line 1" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition resize-none h-24 text-[15px] font-medium" required
                                                    value={newAddress.address_line1} onChange={e => setNewAddress({ ...newAddress, address_line1: e.target.value })} />
                                            </div>
                                            <div className="grid grid-cols-2 gap-5">
                                                <div>
                                                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">City</label>
                                                    <input placeholder="Udaipur" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-[15px] font-medium" required
                                                        value={newAddress.city} onChange={e => setNewAddress({ ...newAddress, city: e.target.value })} />
                                                </div>
                                                <div>
                                                    <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">Pincode</label>
                                                    <input type="number" placeholder="313001" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-[15px] font-medium" required
                                                        value={newAddress.pincode} onChange={e => setNewAddress({ ...newAddress, pincode: e.target.value })} />
                                                </div>
                                            </div>
                                            <div>
                                                <label className="text-[13px] font-bold text-gray-700 mb-1.5 block">State</label>
                                                <input placeholder="Rajasthan" className="w-full border-2 border-gray-100 p-3.5 rounded-xl bg-gray-50 focus:bg-white focus:border-primary focus:ring-4 focus:ring-primary/10 outline-none transition text-[15px] font-medium" required
                                                    value={newAddress.state} onChange={e => setNewAddress({ ...newAddress, state: e.target.value })} />
                                            </div>

                                            <div className="flex gap-4 pt-4">
                                                <Button type="button" variant="secondary" onClick={() => setShowAddressForm(false)} className="flex-1 h-12 text-[15px]">Cancel</Button>
                                                <Button type="submit" variant="primary" isLoading={submitting} disabled={submitting} className="flex-1 h-12 text-[15px] shadow-sm">
                                                    Save Address
                                                </Button>
                                            </div>
                                        </form>
                                    ) : (
                                        <div className="space-y-4 max-w-2xl">
                                            {addresses.map((addr: any) => (
                                                <div
                                                    key={addr.id}
                                                    onClick={() => setSelectedAddressId(addr.id)}
                                                    className={`p-5 rounded-[20px] border-2 cursor-pointer relative transition-all duration-300 ${selectedAddressId === addr.id ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5' : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white'}`}
                                                >
                                                    <div className="flex justify-between items-start gap-4">
                                                        <div className="flex-1">
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <span className="font-black text-gray-900 text-[16px]">{addr.full_name}</span>
                                                                {addr.is_default && <span className="bg-gray-900 text-white text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-sm">Default</span>}
                                                            </div>
                                                            <p className="text-[14px] font-bold text-gray-700 mb-3 flex items-center gap-1.5"><MapPin size={14} className="text-gray-400" /> {addr.phone}</p>
                                                            <p className="text-[14px] text-gray-600 leading-relaxed font-medium">{addr.address_line1}, <br /> {addr.city}, {addr.state} - <span className="font-bold">{addr.pincode}</span></p>
                                                        </div>
                                                        <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center shrink-0 mt-1 transition-colors ${selectedAddressId === addr.id ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-gray-300 bg-white'}`}>
                                                            {selectedAddressId === addr.id && <div className="w-[12px] h-[12px] bg-primary rounded-full shadow-sm" />}
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* Desktop Continue Button (Hidden on Mobile) */}
                                {!showAddressForm && (
                                    <div className="hidden lg:flex justify-end pt-4">
                                        <Button
                                            onClick={() => {
                                                if (!selectedAddressId) return alert('Please select an address');
                                                setStep(2)
                                            }}
                                            disabled={!selectedAddressId}
                                            variant="primary"
                                            size="lg"
                                            className="h-14 px-8 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)] rounded-2xl"
                                        >
                                            Continue to Payment <ArrowRight size={20} className="ml-2" />
                                        </Button>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* STEP 2: PAYMENT */}
                        {step === 2 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 lg:pb-0">
                                <div className="bg-white p-5 md:p-8 rounded-[24px] shadow-sm border border-gray-100 max-w-2xl">
                                    <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
                                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-black">2</div>
                                        <h2 className="text-[20px] md:text-[22px] font-black text-gray-900 tracking-tight">Payment Method</h2>
                                    </div>

                                    {buyer?.cod_blocked && (
                                        <div className="mb-6 bg-error-light/40 border border-error/20 text-error p-5 rounded-2xl text-[15px] flex gap-4 items-start shadow-sm">
                                            <AlertTriangle size={24} className="shrink-0 mt-0.5" />
                                            <div>
                                                <strong className="block text-[15px] mb-1.5 font-black uppercase tracking-wide">Cash on Delivery Unavailable</strong>
                                                <p className="font-medium opacity-90 leading-relaxed">{buyer.cod_block_reason || 'Store restricted COD for your account.'}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="space-y-4">
                                        {!buyer?.cod_blocked && (
                                            <div
                                                onClick={() => setPaymentMethod('cod')}
                                                className={`flex items-center gap-5 p-5 rounded-[20px] border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'cod' ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5' : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white'}`}
                                            >
                                                <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                                                    <Banknote className="text-success" size={28} strokeWidth={2.5} />
                                                </div>
                                                <div className="flex-1">
                                                    <p className="font-black text-gray-900 text-[16px] md:text-[18px]">Cash on Delivery</p>
                                                    <p className="text-[14px] text-gray-500 font-medium mt-1">Pay when you receive your order</p>
                                                </div>
                                                <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'cod' ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-gray-300 bg-white'}`}>
                                                    {paymentMethod === 'cod' && <div className="w-[12px] h-[12px] bg-primary rounded-full shadow-sm" />}
                                                </div>
                                            </div>
                                        )}

                                        <div
                                            onClick={() => setPaymentMethod('online')}
                                            className={`flex items-center gap-5 p-5 rounded-[20px] border-2 cursor-pointer transition-all duration-300 ${paymentMethod === 'online' ? 'border-primary bg-primary/5 shadow-md -translate-y-0.5' : 'border-gray-100 hover:border-gray-200 bg-gray-50 hover:bg-white'}`}
                                        >
                                            <div className="w-14 h-14 rounded-full bg-white border border-gray-100 shadow-sm flex items-center justify-center shrink-0">
                                                <CreditCard className="text-primary" size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex-1">
                                                <p className="font-black text-gray-900 text-[16px] md:text-[18px]">Pay Online (Razorpay)</p>
                                                <p className="text-[14px] text-gray-500 font-medium mt-1">UPI, Credit/Debit Cards, Netbanking</p>
                                            </div>
                                            <div className={`w-[26px] h-[26px] rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'online' ? 'border-primary bg-white ring-4 ring-primary/10' : 'border-gray-300 bg-white'}`}>
                                                {paymentMethod === 'online' && <div className="w-[12px] h-[12px] bg-primary rounded-full shadow-sm" />}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Loyalty Points Section */}
                                {availablePoints > 0 && (
                                    <div className="bg-gradient-to-br from-purple-50 to-white p-6 md:p-8 rounded-[24px] shadow-sm border border-purple-100 mb-4 max-w-2xl relative overflow-hidden group">
                                        <div className="absolute -right-10 -top-10 w-40 h-40 bg-purple-100/50 rounded-full blur-3xl pointer-events-none group-hover:bg-purple-200/50 transition-colors duration-700" />

                                        <div className="flex items-center gap-4 cursor-pointer relative z-10" onClick={() => setUsePoints(!usePoints)}>
                                            <div className={`w-8 h-8 rounded-xl border-2 flex items-center justify-center transition-all duration-300 shrink-0 ${usePoints ? 'bg-purple-600 border-purple-600 text-white shadow-md' : 'border-gray-300 bg-white hover:border-purple-300'}`}>
                                                {usePoints && <Check size={20} strokeWidth={3} />}
                                            </div>
                                            <div className="flex-1">
                                                <h3 className="font-black text-gray-900 flex items-center gap-2 text-[16px] md:text-[18px]">
                                                    <Star size={20} className="text-purple-600 fill-purple-100" /> Use Loyalty Points
                                                </h3>
                                                <p className="text-[14px] text-gray-600 font-medium mt-1">Available balance: <strong className="text-purple-700">{availablePoints}</strong> pts (= ₹{(availablePoints / 10).toFixed(2)})</p>
                                            </div>
                                        </div>

                                        {usePoints && (
                                            <div className="mt-6 pt-6 border-t border-purple-200/60 space-y-4 animate-in fade-in slide-in-from-top-2 relative z-10">
                                                <div>
                                                    <label className="text-[14px] font-black uppercase tracking-wider text-purple-900 block mb-3">Points to redeem</label>
                                                    <div className="flex gap-3">
                                                        <input
                                                            type="number"
                                                            className="flex-1 border-2 border-purple-200 p-4 rounded-xl outline-none focus:border-purple-600 focus:ring-4 focus:ring-purple-100 text-[18px] font-black text-gray-900 bg-white transition shadow-inner"
                                                            value={pointsToRedeem}
                                                            onChange={(e) => {
                                                                const val = Number(e.target.value)
                                                                if (val > maxRedeemablePoints) {
                                                                    setPointsToRedeem(maxRedeemablePoints)
                                                                } else {
                                                                    setPointsToRedeem(e.target.value === '' ? '' : val)
                                                                }
                                                            }}
                                                            placeholder={`Max allowed: ${maxRedeemablePoints} pts`}
                                                            min="0"
                                                            max={maxRedeemablePoints}
                                                        />
                                                        <button
                                                            onClick={() => setPointsToRedeem(maxRedeemablePoints)}
                                                            className="bg-purple-600 text-white px-6 py-4 rounded-xl text-[16px] font-bold shadow-md hover:bg-purple-700 hover:shadow-lg transition-all active:scale-95 shrink-0"
                                                        >
                                                            Use Max
                                                        </button>
                                                    </div>
                                                    <p className="text-[12px] text-purple-600/80 mt-3 font-bold flex items-center gap-1.5"><ShieldAlert size={14} /> Max redemption is 50% of subtotal. 10 pts = ₹1 discount.</p>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Desktop Actions */}
                                <div className="hidden lg:flex justify-between items-center max-w-2xl pt-4">
                                    <Button
                                        onClick={() => setStep(1)}
                                        variant="secondary"
                                        className="h-14 px-6 text-[15px] font-bold shadow-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl"
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back to Address
                                    </Button>
                                    <Button
                                        onClick={() => setStep(3)}
                                        variant="primary"
                                        size="lg"
                                        className="h-14 px-8 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)] rounded-2xl"
                                    >
                                        Review Order <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* STEP 3: CONFIRMATION (Desktop Only Content - Mobile handles differently) */}
                        {step === 3 && (
                            <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300 pb-20 lg:pb-0 hidden lg:block max-w-2xl">
                                {/* Order Summary Confirmation Block */}
                                <div className="bg-white p-8 rounded-[24px] shadow-sm border border-gray-100 relative overflow-hidden text-center">
                                    <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-primary via-blue-400 to-indigo-500" />
                                    <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mx-auto mb-6 mt-4">
                                        <CheckCircle size={40} strokeWidth={2.5} />
                                    </div>
                                    <h2 className="text-[28px] font-black text-gray-900 tracking-tight mb-2">Ready to Place Order</h2>
                                    <p className="text-[15px] font-medium text-gray-500 mb-8 max-w-sm mx-auto">Please review your delivery details and payment method below securely.</p>

                                    <div className="bg-gray-50/80 p-6 rounded-2xl border border-gray-200/60 text-left flex gap-6">
                                        <div className="flex-1">
                                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><MapPin size={16} className="text-gray-400" /> Delivery to</h3>
                                            <p className="text-gray-900 font-bold text-[15px] mb-1">{addresses.find(a => a.id === selectedAddressId)?.full_name}</p>
                                            <p className="text-gray-600 text-[14px] leading-relaxed line-clamp-3 font-medium">{addresses.find(a => a.id === selectedAddressId)?.address_line1}, {addresses.find(a => a.id === selectedAddressId)?.city}</p>
                                        </div>
                                        <div className="w-px bg-gray-200"></div>
                                        <div className="flex-1">
                                            <h3 className="text-[12px] font-black text-gray-400 uppercase tracking-widest mb-3 flex items-center gap-2"><CreditCard size={16} className="text-gray-400" /> Pay via</h3>
                                            <p className="text-gray-900 font-black text-[18px] bg-white px-4 py-3 rounded-xl border border-gray-200 shadow-sm inline-flex items-center gap-3 mt-1">
                                                {paymentMethod === 'cod' ? <Banknote className="text-success" size={24} /> : <CreditCard className="text-primary" size={24} />}
                                                {paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-between items-center pt-4">
                                    <Button
                                        onClick={() => setStep(2)}
                                        variant="secondary"
                                        className="h-14 px-6 text-[15px] font-bold shadow-sm bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-2xl"
                                    >
                                        <ArrowLeft size={18} className="mr-2" /> Back
                                    </Button>
                                    <Button
                                        onClick={handlePlaceOrder}
                                        disabled={submitting}
                                        isLoading={submitting}
                                        variant="primary"
                                        size="lg"
                                        className="h-14 px-10 text-[16px] shadow-[0_8px_25px_rgba(0,0,0,0.15)] rounded-2xl"
                                    >
                                        Place Order <ArrowRight size={20} className="ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )}

                        {/* Mobile Action Bar (Hidden on Desktop) */}
                        {!showAddressForm && step !== 3 && (
                            <div className="lg:hidden fixed bottom-[64px] md:bottom-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] pb-safe flex gap-3">
                                {step === 2 && (
                                    <Button
                                        onClick={() => setStep(1)}
                                        variant="secondary"
                                        className="w-14 h-14 shrink-0 shadow-sm bg-white border border-gray-200 text-gray-700"
                                    >
                                        <ArrowLeft size={20} />
                                    </Button>
                                )}
                                <Button
                                    fullWidth
                                    onClick={() => {
                                        if (step === 1) {
                                            if (!selectedAddressId) return alert('Please select an address');
                                            setStep(2)
                                        } else if (step === 2) {
                                            setStep(3)
                                        }
                                    }}
                                    disabled={step === 1 && !selectedAddressId}
                                    variant="primary"
                                    size="lg"
                                    className="h-14 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                                >
                                    {step === 1 ? 'Continue to Payment' : 'Review Order'} <ArrowRight size={18} className="ml-1" />
                                </Button>
                            </div>
                        )}

                        {/* Legacy Mobile Step 3 View (Rendered conditionally for mobile) */}
                        <div className="lg:hidden">
                            {step === 3 && (
                                <div className="space-y-6 animate-in fade-in pb-20">
                                    {/* Order Summary */}
                                    <div className="bg-white p-6 rounded-[20px] shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center relative overflow-hidden">
                                        <div className="absolute top-0 left-0 w-full h-1.5 bg-gradient-to-r from-primary via-blue-400 to-indigo-500" />
                                        <h2 className="text-3xl font-black text-gray-900 tracking-tight mt-2 mb-1">₹{total.toLocaleString()}</h2>
                                        <p className="text-[11px] font-bold text-gray-500 uppercase tracking-widest">Total to Pay</p>

                                        <div className="w-full mt-6 space-y-3 pt-6 border-t border-dashed border-gray-200 font-medium text-[14px]">
                                            <div className="flex justify-between text-gray-600 font-bold">
                                                <span>Item Total ({cart?.cart_items?.length} items)</span>
                                                <span>₹{subtotal.toLocaleString()}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600 font-bold">
                                                <span>Delivery</span>
                                                <span className={deliveryFee === 0 ? "text-success text-[12px] uppercase tracking-wide" : "text-gray-900"}>
                                                    {deliveryFee === 0 ? 'Free' : `₹${deliveryFee.toLocaleString()}`}
                                                </span>
                                            </div>
                                            {computedDiscount > 0 && (
                                                <div className="flex justify-between text-success font-black bg-success-light/30 px-3 py-2 rounded-lg mt-2 border border-success/10">
                                                    <span>Points Discount ({actualPointsUsed} pts)</span>
                                                    <span>- ₹{computedDiscount.toLocaleString()}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {total > 0 && Math.floor(total / 10) > 0 && (
                                        <div className="bg-gray-900 text-white p-4.5 rounded-[20px] shadow-md flex gap-4 items-center pl-5 border-l-4 border-yellow-400">
                                            <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm shrink-0">
                                                <Star size={24} className="text-yellow-400 fill-yellow-400" />
                                            </div>
                                            <div>
                                                <p className="text-[12px] uppercase tracking-wider text-gray-400 font-bold mb-0.5">Rewards Expected</p>
                                                <p className="text-[16px] font-bold leading-none">Earn {Math.floor(total / 10)} pts on delivery</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="bg-gray-50 p-5 rounded-[20px] border border-gray-200/60">
                                        <div className="mb-4">
                                            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Delivery to</h3>
                                            <p className="text-gray-900 font-bold text-[14px]">{addresses.find(a => a.id === selectedAddressId)?.full_name}</p>
                                            <p className="text-gray-600 text-[13px] leading-tight mt-1 line-clamp-2">{addresses.find(a => a.id === selectedAddressId)?.address_line1}</p>
                                        </div>
                                        <div>
                                            <h3 className="text-[11px] font-bold text-gray-500 uppercase tracking-widest mb-1">Pay via</h3>
                                            <p className="text-gray-900 font-bold text-[14px]">{paymentMethod === 'cod' ? 'Cash on Delivery' : 'Online Payment'}</p>
                                        </div>
                                    </div>

                                    <div className="fixed bottom-[64px] left-0 right-0 p-4 bg-white/95 backdrop-blur-md border-t border-gray-100 z-40 shadow-[0_-10px_15px_-3px_rgba(0,0,0,0.05)] pb-safe flex gap-3">
                                        <Button
                                            onClick={() => setStep(2)}
                                            variant="secondary"
                                            className="w-14 h-14 shrink-0 shadow-sm bg-white border border-gray-200"
                                        >
                                            <ArrowLeft size={20} />
                                        </Button>
                                        <Button
                                            fullWidth
                                            onClick={handlePlaceOrder}
                                            disabled={submitting}
                                            isLoading={submitting}
                                            variant="primary"
                                            size="lg"
                                            className="h-14 text-[16px] shadow-[0_8px_20px_rgba(0,0,0,0.12)]"
                                        >
                                            Place Order <ArrowRight size={18} className="ml-1" />
                                        </Button>
                                    </div>
                                    <Script src="https://checkout.razorpay.com/v1/checkout.js" />
                                </div>
                            )}
                        </div>

                    </div>

                    {/* RIGHT COLUMN: Order Summary Template (Sticky on Desktop) */}
                    <div className="hidden lg:block lg:w-[400px] xl:w-[450px] shrink-0">
                        <div className="lg:sticky lg:top-8 mt-2">
                            <div className="bg-white p-6 xl:p-8 rounded-[32px] shadow-sm border border-gray-100">
                                <h3 className="font-black text-[18px] text-gray-900 mb-6 border-b border-gray-100 pb-4">Order Summary</h3>

                                {/* Cart Preview Snippet */}
                                <div className="space-y-4 mb-6 max-h-[300px] overflow-y-auto pr-2 custom-scroll scrollbar-hide">
                                    {cart?.cart_items?.map((item: any) => (
                                        <div key={item.id} className="flex gap-4 items-center">
                                            <div className="w-16 h-16 bg-gray-50 rounded-xl border border-gray-100 overflow-hidden relative shrink-0">
                                                {item.products.images?.[0] ? (
                                                    <Image src={item.products.images[0]} fill alt="" className="object-cover" />
                                                ) : <div className="w-full h-full bg-gray-100" />}
                                                <span className="absolute -top-1 -right-1 bg-gray-900 text-white text-[10px] font-bold w-5 h-5 rounded-full flex items-center justify-center border-2 border-white">{item.quantity}</span>
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="font-bold text-[14px] text-gray-900 truncate">{item.products.name}</p>
                                                <p className="font-black text-[14px] text-gray-500 mt-0.5 text-primary">₹{(item.products.price * item.quantity).toLocaleString()}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="space-y-4 pt-6 border-t border-dashed border-gray-200">
                                    <div className="flex justify-between text-gray-600 font-medium text-[15px]">
                                        <span>Subtotal</span>
                                        <span className="text-gray-900">₹{subtotal.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-600 font-medium text-[15px]">
                                        <span>Delivery Fee</span>
                                        {deliveryFee === 0 ? (
                                            <span className="text-success font-bold flex items-center gap-1 bg-success-light/30 px-2 rounded-md">FREE</span>
                                        ) : (
                                            <span className="text-gray-900 font-bold">₹{deliveryFee.toLocaleString()}</span>
                                        )}
                                    </div>
                                    {computedDiscount > 0 && (
                                        <div className="flex justify-between text-success font-bold text-[15px] bg-success-light/20 p-2 -mx-2 rounded-lg border border-success/10">
                                            <span className="flex items-center gap-1.5"><Star size={14} className="fill-success" /> Points Discount</span>
                                            <span>- ₹{computedDiscount.toLocaleString()}</span>
                                        </div>
                                    )}
                                </div>

                                <div className="w-full h-[2px] bg-gray-100 my-5" />

                                <div className="flex justify-between items-end mb-6">
                                    <div>
                                        <span className="block text-gray-900 font-black text-[22px] tracking-tight mb-1">Total Pay</span>
                                        <span className="block text-[12px] text-gray-500 font-bold uppercase tracking-wider">Including all taxes</span>
                                    </div>
                                    <span className="text-gray-900 font-black text-[32px] leading-none tracking-tighter">₹{total.toLocaleString()}</span>
                                </div>

                                {/* Dynamic Place Order Button inside Summary for Desktop */}
                                {step === 3 && (
                                    <Button
                                        fullWidth
                                        onClick={handlePlaceOrder}
                                        disabled={submitting}
                                        isLoading={submitting}
                                        variant="primary"
                                        size="lg"
                                        className="h-16 text-[18px] shadow-[0_8px_30px_rgba(0,0,0,0.15)] rounded-2xl w-full"
                                    >
                                        Pay & Place Order <ArrowRight size={22} className="ml-2" />
                                    </Button>
                                )}

                                {total > 0 && Math.floor(total / 10) > 0 && (
                                    <div className="mt-5 bg-gradient-to-r from-gray-900 to-gray-800 text-white p-4 rounded-xl shadow-md flex gap-3 items-center border border-gray-700">
                                        <Star size={20} className="text-yellow-400 fill-yellow-400 shrink-0" />
                                        <div className="flex-1">
                                            <p className="text-[13px] font-medium leading-tight">Complete order to earn</p>
                                            <p className="text-[15px] font-black text-yellow-400">{Math.floor(total / 10)} Reward Points</p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <div className="mt-6 lg:mt-8 grid grid-cols-2 gap-3 text-[12px] font-bold text-gray-600">
                                <div className="flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-xl border border-gray-100 shadow-sm">
                                    <ShieldAlert size={16} className="text-emerald-500" /> Secure SSL
                                </div>
                                <div className="flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-xl border border-gray-100 shadow-sm">
                                    <CheckCircle size={16} className="text-blue-500" /> Trusted Store
                                </div>
                                <div className="flex items-center justify-center gap-2 bg-gray-50 py-3 rounded-xl border border-gray-100 shadow-sm col-span-2">
                                    <Banknote size={16} className="text-primary" /> 100% Buyer Protection
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            </div>

            {/* QA TEST MOCK RAZORPAY MODAL */}
            {showMockRazorpay && (
                <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="bg-blue-600 p-5 text-center text-white relative">
                            <h2 className="font-bold text-lg">QA Razorpay Simulator</h2>
                            <p className="text-xs opacity-80 font-medium tracking-wide">TEST ENVIRONMENT</p>
                        </div>
                        <div className="p-6 space-y-6">
                            <div className="text-center bg-gray-50 p-4 rounded-xl border">
                                <p className="text-gray-500 text-sm font-medium mb-1">Order ID</p>
                                <p className="font-mono text-sm font-bold text-gray-900">{mockOrderDetails?.rzOrderId}</p>
                            </div>
                            <div className="space-y-3">
                                <button
                                    onClick={async () => {
                                        const { verifyPayment } = await import('@/app/actions/payment')
                                        const res = await verifyPayment(mockOrderDetails.orderId, 'pay_mock_123', 'mock_signature')
                                        if (res.success) {
                                            router.push(`/${params.store}/shop/order/success/${mockOrderDetails.orderId}`)
                                        } else {
                                            alert("Mock Verification Failed")
                                            setShowMockRazorpay(false)
                                            setSubmitting(false)
                                        }
                                    }}
                                    className="w-full bg-green-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-green-200 active:scale-95 transition-transform"
                                >
                                    Simulate Success
                                </button>
                                <button
                                    onClick={() => {
                                        alert("Payment Failed")
                                        setShowMockRazorpay(false)
                                        setSubmitting(false)
                                    }}
                                    className="w-full bg-red-50 text-red-600 font-bold py-4 rounded-xl border border-red-100 active:scale-95 transition-transform"
                                >
                                    Simulate Failure
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
