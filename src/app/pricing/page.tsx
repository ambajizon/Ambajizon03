'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createAdminSubscriptionOrder, verifyAdminSubscriptionPayment } from '@/app/actions/payment'
import { Loader2, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import Script from 'next/script'

export default function PricingPage() {
    const router = useRouter()
    const [loadingPlan, setLoadingPlan] = useState<'setup' | 'yearly' | null>(null)

    const handleSubscribe = async (planType: 'setup' | 'yearly') => {
        setLoadingPlan(planType)
        try {
            const res = await createAdminSubscriptionOrder(planType)

            if (res.error) {
                toast.error(res.error)
                setLoadingPlan(null)
                return
            }

            const options = {
                key: res.keyId,
                amount: res.amount,
                currency: "INR",
                name: "Ambajizon Platform",
                description: planType === 'setup' ? "Store Setup & Onboarding" : "Yearly Subscription Renewal",
                order_id: res.razorpayOrderId,
                handler: async function (response: any) {
                    const verification = await verifyAdminSubscriptionPayment(
                        res.subId,
                        response.razorpay_payment_id,
                        response.razorpay_signature
                    )

                    if (verification.success) {
                        toast.success('Payment successful! Your store is now active.')
                        router.push('/dashboard')
                    } else {
                        toast.error(verification.error || 'Payment verification failed')
                        setLoadingPlan(null)
                    }
                },
                prefill: {
                    name: "Shopkeeper",
                    email: "shopkeeper@example.com",
                    contact: "9999999999"
                },
                theme: {
                    color: "#4F46E5"
                }
            };

            const rzp = new (window as any).Razorpay(options);
            rzp.on('payment.failed', function (response: any) {
                toast.error(response.error.description || 'Payment Failed')
                setLoadingPlan(null)
            });
            rzp.open();

        } catch (error) {
            console.error(error)
            toast.error('An error occurred during checkout setup.')
            setLoadingPlan(null)
        }
    }

    return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
            <Script src="https://checkout.razorpay.com/v1/checkout.js" />
            <div className="max-w-4xl w-full grid md:grid-cols-2 gap-8">
                <div className="bg-white p-8 rounded-2xl shadow-xl border-2 border-indigo-100 flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Onboarding Plan</h2>
                    <p className="text-gray-500 mb-6">Everything you need to set up your digital store.</p>
                    <div className="text-4xl font-bold text-indigo-600 mb-6">₹9,999</div>
                    <ul className="space-y-3 mb-8 flex-1">
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-indigo-600" /> Lifetime Setup & Branding</li>
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-indigo-600" /> 1 Year Platform Fee Included</li>
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-indigo-600" /> WhatsApp Commerce Suite</li>
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-indigo-600" /> Premium Phone Support</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('setup')}
                        disabled={loadingPlan !== null}
                        className="w-full bg-indigo-600 text-white py-3 rounded-xl font-bold hover:bg-indigo-700 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loadingPlan === 'setup' ? <Loader2 className="animate-spin" size={20} /> : null}
                        {loadingPlan === 'setup' ? 'Connecting to Gateway...' : 'Purchase Initial Setup'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 font-medium">Secured by Razorpay</p>
                </div>

                <div className="bg-white p-8 rounded-2xl shadow border flex flex-col">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Yearly Renewal</h2>
                    <p className="text-gray-500 mb-6">Keep your store running completely smooth.</p>
                    <div className="text-4xl font-bold text-gray-900 mb-6">₹6,999<span className="text-lg text-gray-400 font-normal">/year</span></div>
                    <ul className="space-y-3 mb-8 flex-1 opacity-80">
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-gray-600" /> Continual Platform Access</li>
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-gray-600" /> Automatic Feature Updates</li>
                        <li className="flex gap-2 items-center"><CheckCircle size={18} className="text-gray-600" /> Email & Ticket Support</li>
                    </ul>
                    <button
                        onClick={() => handleSubscribe('yearly')}
                        disabled={loadingPlan !== null}
                        className="w-full bg-gray-900 text-white py-3 rounded-xl font-bold hover:bg-gray-800 transition flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                        {loadingPlan === 'yearly' ? <Loader2 className="animate-spin" size={20} /> : null}
                        {loadingPlan === 'yearly' ? 'Connecting to Gateway...' : 'Renew Subscription'}
                    </button>
                    <p className="text-center text-xs text-gray-400 mt-3 font-medium">Secured by Razorpay</p>
                </div>
            </div>
        </div>
    )
}
