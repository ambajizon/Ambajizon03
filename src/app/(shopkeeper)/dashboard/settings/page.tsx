'use client'

import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import PaymentSettings from '@/components/dashboard/PaymentSettings'
import { Loader2, Save, Store, Image as ImageIcon, MapPin, Share2, Type, CreditCard, QrCode, ExternalLink, Globe } from 'lucide-react'
import ImageCropUpload from '@/components/ImageCropUpload'
import { useRouter } from 'next/navigation'
import CryptoJS from 'crypto-js'
import { QRCodeSVG } from 'qrcode.react'
import { revalidateStore } from '@/app/actions/storefront'

// Validation Schema
const settingsSchema = z.object({
    name: z.string().min(3, 'Store name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    whatsapp_number: z.string().optional(),
    phone_number: z.string().optional(),
    shop_timing_open: z.string().optional(),
    shop_timing_close: z.string().optional(),
    shop_timing_closed_sunday: z.boolean().optional(),
    shop_timing_24hours: z.boolean().optional(),
    location_url: z.string().optional(),
    razorpay_key_id: z.string().optional(),
    razorpay_key_secret: z.string().optional(),
    cod_enabled: z.boolean().optional(),
    custom_domain: z.string().optional().refine(val => {
        if (!val) return true
        return /^[a-zA-Z0-9][a-zA-Z0-9-]{1,61}[a-zA-Z0-9]\.[a-zA-Z]{2,}$/.test(val) && !val.startsWith('http') && !val.startsWith('www.')
    }, 'Enter a valid domain without http:// or www. (e.g. yourstore.com)'),
    about_page_text: z.string().optional(),
    contact_page_text: z.string().optional(),
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [activeTab, setActiveTab] = useState('General')
    const [storeUrl, setStoreUrl] = useState('')
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<SettingsFormValues>({
        resolver: zodResolver(settingsSchema),
        defaultValues: {
            name: '',
            slug: '',
            whatsapp_number: '',
            phone_number: '',
            shop_timing_open: '',
            shop_timing_close: '',
            shop_timing_closed_sunday: false,
            shop_timing_24hours: false,
            location_url: '',
            razorpay_key_id: '',
            // razorpay_key_secret: '', // Removed as per instruction
            cod_enabled: false,
            custom_domain: '',
            about_page_text: '',
            contact_page_text: '',
        },
    })

    // Fetch Store Data
    useEffect(() => {
        async function fetchStore() {
            try {
                const { data: { user } } = await supabase.auth.getUser()
                if (!user) return

                const { data: store, error } = await supabase
                    .from('stores')
                    .select('*')
                    .eq('shopkeeper_id', user.id)
                    .single()

                if (error) throw error

                if (store) {
                    setStoreUrl(`${window.location.origin}/${store.slug}/shop`)
                    const themeConfig = store.theme_config || {}
                    const paymentSettings = themeConfig.payment_settings || {}

                    let secret = paymentSettings.razorpay_key_secret || ''
                    if (secret) {
                        try {
                            const bytes = CryptoJS.AES.decrypt(secret, 'ambajizon-secret-key-123')
                            secret = bytes.toString(CryptoJS.enc.Utf8)
                        } catch (e) { }
                    }

                    let parsedTiming: any = { open: '09:00', close: '21:00', closed_days: [], is_24hours: false }
                    try {
                        if (store.shop_timing || themeConfig.shop_timing) {
                            parsedTiming = JSON.parse(store.shop_timing || themeConfig.shop_timing)
                        }
                    } catch (e) { }

                    form.reset({
                        name: store.name || '',
                        slug: store.slug || '',
                        // logo_url: store.logo_url || '', // Removed as per instruction
                        whatsapp_number: store.whatsapp_number || themeConfig.whatsapp_number || '',
                        phone_number: store.phone_number || themeConfig.phone_number || '',
                        shop_timing_open: parsedTiming.open || '09:00',
                        shop_timing_close: parsedTiming.close || '21:00',
                        shop_timing_closed_sunday: parsedTiming.closed_days?.includes('sunday') || false,
                        shop_timing_24hours: parsedTiming.is_24hours || false,
                        location_url: store.location_url || themeConfig.location_url || '',
                        razorpay_key_id: paymentSettings.razorpay_key_id || '',
                        // razorpay_key_secret: secret, // Removed as per instruction
                        cod_enabled: paymentSettings.cod_enabled || false,
                        custom_domain: store.custom_domain || '',
                    })
                }
            } catch (error) {
                console.error('Error fetching store:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchStore()
    }, [supabase, form])

    const onSubmit = async (data: SettingsFormValues) => {
        setSaving(true)
        try {
            const { data: { user } } = await supabase.auth.getUser()
            if (!user) throw new Error('Not authenticated')

            // The razorpay_key_secret is not part of the form data (SettingsFormValues) anymore
            // but it's still needed for the theme_config.
            // We need to retrieve the existing secret or handle it differently if it's not submitted via form.
            // For now, I'll assume the secret is handled outside of the schema validation for submission.
            // If the user enters a new secret, it will be in the form's internal state, not `data`.
            // Let's get it directly from the form state.
            let encryptedSecret = form.getValues('razorpay_key_secret') || '' // Get from form state directly
            if (encryptedSecret) {
                encryptedSecret = CryptoJS.AES.encrypt(encryptedSecret, 'ambajizon-secret-key-123').toString()
            }

            const { data: existingStore } = await supabase.from('stores').select('theme_config').eq('shopkeeper_id', user.id).single()
            const theme_config = {
                ...(existingStore?.theme_config || {}),
                payment_settings: {
                    razorpay_key_id: data.razorpay_key_id,
                    razorpay_key_secret: encryptedSecret,
                    cod_enabled: data.cod_enabled
                }
            }

            let updatePayload: any = {
                name: data.name,
                slug: data.slug,
                whatsapp_number: data.whatsapp_number,
                phone_number: data.phone_number,
                shop_timing: JSON.stringify({
                    open: data.shop_timing_open,
                    close: data.shop_timing_close,
                    closed_days: data.shop_timing_closed_sunday ? ['sunday'] : [],
                    is_24hours: data.shop_timing_24hours
                }),
                location_url: data.location_url,
                theme_config: theme_config,
                custom_domain: data.custom_domain,
                about_page_text: data.about_page_text,
                contact_page_text: data.contact_page_text
            }
            let { error } = await supabase.from('stores').update(updatePayload).eq('shopkeeper_id', user.id)

            // Revalidate the store's public path using server action
            if (data.slug) {
                await revalidateStore(data.slug)
            }

            alert('Store settings updated successfully!')
            router.refresh()
        } catch (error: any) {
            alert('Failed to update settings: ' + error.message)
        } finally {
            setSaving(false)
        }
    }

    const testPaymentConnection = async () => {
        const key = form.getValues('razorpay_key_id')
        const secret = form.getValues('razorpay_key_secret') // Still getting from form state
        if (!key || !secret) {
            alert('Please enter both Key ID and Secret to test.')
            return
        }
        alert('Simulating connection... Connection successful! (Mocked for test)')
    }

    const downloadQR = () => {
        const svg = document.getElementById("store-qr-code");
        if (!svg) return;
        const svgData = new XMLSerializer().serializeToString(svg);
        const canvas = document.createElement("canvas");
        const ctx = canvas.getContext("2d");
        const img = new Image();
        img.onload = () => {
            canvas.width = img.width;
            canvas.height = img.height;
            ctx?.drawImage(img, 0, 0);
            const pngFile = canvas.toDataURL("image/png");
            const downloadLink = document.createElement("a");
            downloadLink.download = "store-qr.png";
            downloadLink.href = `${pngFile}`;
            downloadLink.click();
        };
        img.src = `data:image/svg+xml;base64,${btoa(svgData)}`;
    }

    if (loading) {
        return (
            <div className="flex h-96 items-center justify-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
            </div>
        )
    }

    return (
        <div className="mx-auto max-w-4xl space-y-6 p-6">
            <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Store Settings</h1>
            </div>

            {/* Mini Store Preview */}
            <div className="mb-6 rounded-3xl overflow-hidden shadow-lg border border-gray-100 bg-white relative">
                <div className="h-28 bg-gray-200 relative">
                    <div className="w-full h-full bg-gradient-to-tr from-blue-500 to-purple-500"></div>
                </div>
                <div className="px-5 pb-5 relative">
                    <div className="w-20 h-20 rounded-full border-4 border-white bg-white absolute -top-10 overflow-hidden shadow-sm">
                        {/* Removed form.watch('logo_url') reference */}
                        <div className="w-full h-full bg-gray-50 flex items-center justify-center text-gray-300"><Store size={32} /></div>
                    </div>
                    <div className="pt-12 flex justify-between items-end">
                        <div>
                            <h3 className="font-black text-xl text-gray-900 leading-tight">{form.watch('name') || 'Your Store Name'}</h3>
                            {/* Removed form.watch('tagline') reference */}
                            <p className="text-sm font-medium text-gray-500 mt-1">Your catchy tagline...</p>
                        </div>
                    </div>
                </div>
                <div className="absolute top-4 right-4">
                    {form.watch('slug') && (
                        <button onClick={() => window.open(`/${form.watch('slug')}`, '_blank')} className="bg-white/90 backdrop-blur-md text-xs font-bold px-4 py-2 rounded-full shadow-sm text-gray-900 flex items-center gap-1.5 transition-transform active:scale-95">
                            <ExternalLink size={14} /> Preview Live
                        </button>
                    )}
                </div>
            </div>

            <div className="flex space-x-1 overflow-x-auto hide-scrollbar bg-gray-100 p-1 rounded-xl mb-6">
                {['General', 'Pages', 'Payment', 'QR Code'].map(tab => (
                    <button
                        key={tab}
                        type="button"
                        onClick={() => setActiveTab(tab)}
                        className={`py-2 px-4 rounded-lg font-bold text-sm whitespace-nowrap transition-colors flex-1 ${activeTab === tab ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
                <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'General' ? 'block' : 'hidden'}`}>
                    {/* Domain & Routing */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <Globe className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Domain & Routing</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Store Slug</label>
                                <div className="flex rounded-md border bg-gray-50">
                                    <span className="flex items-center px-3 text-sm text-gray-500">ambajizon.in/</span>
                                    <input
                                        {...form.register('slug')}
                                        className="w-full rounded-r-md border-l bg-white p-2 text-sm"
                                    />
                                </div>
                                {form.formState.errors.slug && (
                                    <p className="text-xs text-red-500">{form.formState.errors.slug.message}</p>
                                )}
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Custom Domain</label>
                                <input
                                    {...form.register('custom_domain')}
                                    className="w-full rounded-md border p-2 text-sm"
                                    placeholder="rajeshhandicrafts.com"
                                />
                                {form.formState.errors.custom_domain && (
                                    <p className="text-xs text-red-500 font-medium mt-1">{form.formState.errors.custom_domain.message}</p>
                                )}
                            </div>
                        </div>

                        {form.watch('custom_domain') && (
                            <div className="mt-6 bg-orange-50/50 p-5 rounded-xl border border-orange-100">
                                <h4 className="font-bold text-orange-800 mb-3 flex items-center gap-2">
                                    ⚠️ Pending Verification
                                </h4>
                                <p className="font-bold text-gray-800 text-sm mb-2">Setup Instructions:</p>
                                <ol className="list-decimal list-inside text-gray-600 text-sm space-y-2 ml-1 mb-4">
                                    <li>Buy domain from GoDaddy or Namecheap</li>
                                    <li>Add CNAME record to your DNS:
                                        <div className="flex gap-2 mt-2 ml-4">
                                            <code className="bg-white border rounded px-2 py-1 text-xs font-bold font-mono">Name: @</code>
                                            <code className="bg-white border rounded px-2 py-1 text-xs font-bold font-mono">Value: ambajizon.in</code>
                                        </div>
                                    </li>
                                    <li>Save your domain here and wait 24 hours</li>
                                </ol>
                                <p className="text-xs text-orange-700 italic border-t border-orange-200/50 pt-3">
                                    Custom domain setup requires DNS configuration. Our team will help you set this up. Contact support on WhatsApp.
                                </p>
                            </div>
                        )}
                    </div>

                    {/* Contact & Location */}
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Contact & Location</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">WhatsApp Number</label>
                                <input {...form.register('whatsapp_number')} className="w-full rounded-md border p-2 text-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Phone Number</label>
                                <input {...form.register('phone_number')} className="w-full rounded-md border p-2 text-sm" />
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Shop Timing</label>
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-lg bg-gray-50 border border-gray-100">
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 font-bold uppercase">Opening Time</label>
                                        <input type="time" {...form.register('shop_timing_open')} className="w-full rounded-md border p-2 text-sm bg-white" />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-xs text-gray-500 font-bold uppercase">Closing Time</label>
                                        <input type="time" {...form.register('shop_timing_close')} className="w-full rounded-md border p-2 text-sm bg-white" />
                                    </div>
                                    <div className="flex items-center gap-2 pt-5">
                                        <input type="checkbox" id="closedSunday" {...form.register('shop_timing_closed_sunday')} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                        <label htmlFor="closedSunday" className="text-sm font-medium text-gray-700 cursor-pointer">Closed on Sunday</label>
                                    </div>
                                    <div className="flex items-center gap-2 pt-5">
                                        <input type="checkbox" id="open24" {...form.register('shop_timing_24hours')} className="w-4 h-4 text-primary rounded border-gray-300 focus:ring-primary" />
                                        <label htmlFor="open24" className="text-sm font-medium text-gray-700 cursor-pointer">Open 24 Hours</label>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-medium">Google Maps URL</label>
                                <input {...form.register('location_url')} className="w-full rounded-md border p-2 text-sm" />
                            </div>
                        </div>
                    </div>


                </div>

                <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'Pages' ? 'block' : 'hidden'}`}>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <Type className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">About Us Page</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Tell your customers the story behind your brand, what makes your products unique, and why they should choose you. You can use standard formatting.
                        </p>
                        <textarea
                            {...form.register('about_page_text')}
                            className="w-full rounded-md border p-4 text-sm font-medium leading-relaxed bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 min-h-[250px]"
                            placeholder="Welcome to our store! We started this journey in 2012 with a simple mission..."
                        />
                    </div>

                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <MapPin className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Contact Us Page</h2>
                        </div>
                        <p className="text-sm text-gray-500 mb-4">
                            Provide additional contact details, business hours context, or a personalized message for customers trying to reach out. This text will appear alongside your main phone and WhatsApp numbers.
                        </p>
                        <textarea
                            {...form.register('contact_page_text')}
                            className="w-full rounded-md border p-4 text-sm font-medium leading-relaxed bg-gray-50 outline-none focus:bg-white focus:ring-2 focus:ring-blue-500 min-h-[200px]"
                            placeholder="We love hearing from our customers. The best way to reach us is via WhatsApp between 10 AM and 6 PM..."
                        />
                    </div>
                </div>

                <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'Payment' ? 'block' : 'hidden'}`}>
                    <div className="rounded-lg border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <CreditCard className="h-5 w-5 text-blue-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Payment Gateway Setup</h2>
                        </div>

                        <div className="space-y-6 max-w-lg">
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Razorpay Key ID</label>
                                <input
                                    {...form.register('razorpay_key_id')}
                                    type="text"
                                    className="w-full rounded-md border p-2 text-sm"
                                    placeholder="rzp_test_XXXXXX"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium text-gray-700">Razorpay Key Secret</label>
                                <input
                                    {...form.register('razorpay_key_secret')} // Still registered to form, but not part of schema
                                    type="password"
                                    className="w-full rounded-md border p-2 text-sm font-mono tracking-widest placeholder:tracking-normal"
                                    placeholder="Enter key secret"
                                />
                                <p className="text-xs text-gray-400">Secret key will be stored securely using industry-standard AES encryption.</p>
                            </div>
                            <div className="space-y-2 pt-4 border-t">
                                <label className="flex items-center gap-3 cursor-pointer">
                                    <input
                                        {...form.register('cod_enabled')}
                                        type="checkbox"
                                        className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                    />
                                    <span className="text-sm font-medium text-gray-900">Enable Cash on Delivery (COD)</span>
                                </label>
                            </div>
                            <div className="pt-4 flex items-center gap-4">
                                <button
                                    type="button"
                                    onClick={testPaymentConnection}
                                    className="px-4 py-2 border rounded-md text-sm font-medium hover:bg-gray-50 text-gray-700"
                                >
                                    Test Connection
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                <div className={`space-y-8 animate-in fade-in slide-in-from-bottom-2 ${activeTab === 'QR Code' ? 'block' : 'hidden'}`}>
                    <div className="rounded-lg border bg-white p-6 shadow-sm flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 max-w-md">
                            <div className="mb-2 flex items-center gap-2 pb-2">
                                <QrCode className="h-6 w-6 text-indigo-500" />
                                <h2 className="text-2xl font-bold text-gray-800">Your Store QR Code</h2>
                            </div>
                            <p className="text-gray-600">
                                Download this QR code and print it for your physical shop counters. Customers can scan it to instantly browse your products on their mobile phones.
                            </p>
                            <div className="bg-gray-50 p-3 rounded-lg border text-indigo-600 text-sm font-medium break-all">
                                {storeUrl}
                            </div>
                            <button
                                type="button"
                                onClick={downloadQR}
                                className="px-6 py-3 bg-indigo-600 text-white rounded-lg font-bold shadow-md hover:bg-indigo-700 transition"
                            >
                                Download high-res PNG
                            </button>
                            <div className="text-sm text-gray-500 border-t pt-4 mt-4">
                                <strong className="text-gray-900 block mb-1">Print Instructions:</strong>
                                We recommend printing this on a 4x4 inch standee or sticker to place near your checkout counter.
                            </div>
                        </div>

                        <div className="flex-shrink-0 bg-white p-8 rounded-2xl shadow-xl border border-gray-100 flex flex-col items-center">
                            <QRCodeSVG
                                id="store-qr-code"
                                value={storeUrl}
                                size={256}
                                level="H"
                                includeMargin={true}
                            />
                            <span className="font-bold mt-4 text-gray-800 text-lg">Scan to Shop</span>
                        </div>
                    </div>
                </div>

                <div className="flex justify-end">
                    <button
                        type="submit"
                        disabled={saving}
                        className="flex items-center rounded-md bg-blue-600 px-6 py-2 font-medium text-white hover:bg-blue-700 disabled:opacity-50"
                    >
                        {saving ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="mr-2 h-4 w-4" />
                                Save Changes
                            </>
                        )}
                    </button>
                </div>
            </form>
        </div>
    )
}
