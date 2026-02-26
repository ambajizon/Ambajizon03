'use client'

import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Store, Image as ImageIcon, MapPin, CheckCircle } from 'lucide-react'
import ImageCropUpload from '@/components/ImageCropUpload'
import { saveStoreSetup } from '@/app/actions/store'
import { revalidateStore } from '@/app/actions/storefront'

// Validation Schema
const setupSchema = z.object({
    name: z.string().min(3, 'Store name must be at least 3 characters'),
    slug: z.string().min(3, 'Slug must be at least 3 characters').regex(/^[a-z0-9-]+$/, 'Slug can only contain lowercase letters, numbers, and hyphens'),
    logo_url: z.string().optional(),
    whatsapp_number: z.string().optional(),
    phone_number: z.string().optional(),
    shop_timing: z.string().optional(),
    location_url: z.string().optional(),
})

type SetupFormValues = z.infer<typeof setupSchema>

const steps = [
    { id: 1, name: 'Basic Info', icon: Store },
    { id: 2, name: 'Store Logo', icon: ImageIcon },
    { id: 3, name: 'Contact', icon: MapPin },
    { id: 4, name: 'Location', icon: MapPin },
]

export default function StoreSetupWizard() {
    const [currentStep, setCurrentStep] = useState(1)
    const [loading, setLoading] = useState(false)
    const router = useRouter()
    const supabase = createClient()

    const form = useForm<SetupFormValues>({
        resolver: zodResolver(setupSchema),
        defaultValues: {
            name: '',
            slug: '',
            logo_url: '',
            whatsapp_number: '',
            phone_number: '',
            shop_timing: '',
            location_url: '',
        },
        mode: 'onChange'
    })

    // Auto-generate slug from name
    const updateSlug = (name: string) => {
        const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        form.setValue('slug', slug, { shouldValidate: true })
    }

    const onSubmit = async (data: SetupFormValues) => {
        setLoading(true)
        try {
            const res = await saveStoreSetup(data)
            if (res?.error) {
                alert('Failed to save store: ' + res.error)
            } else {
                if (data.slug) {
                    await revalidateStore(data.slug)
                }
                router.push('/dashboard')
                router.refresh()
            }
        } catch (error: any) {
            alert('Failed to save store: ' + error.message)
        } finally {
            setLoading(false)
        }
    }

    const nextStep = async () => {
        let isValid = false
        if (currentStep === 1) isValid = await form.trigger(['name', 'slug'])
        if (currentStep === 2) isValid = true
        if (currentStep === 3) isValid = true

        if (isValid) setCurrentStep((prev) => prev + 1)
    }

    const prevStep = () => setCurrentStep((prev) => prev - 1)

    return (
        <div className="mx-auto max-w-2xl rounded-xl bg-white p-8 shadow-lg">
            {/* Stepper */}
            <div className="mb-8 flex flex-wrap items-center justify-between gap-y-4">
                {steps.map((step) => {
                    const isCompleted = currentStep > step.id
                    const isCurrent = currentStep === step.id
                    return (
                        <div key={step.id} className="flex flex-col items-center flex-1 min-w-[60px]">
                            <button
                                type="button"
                                onClick={() => { if (isCompleted) setCurrentStep(step.id) }}
                                disabled={!isCompleted && !isCurrent}
                                className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-colors ${isCompleted ? 'border-green-500 bg-green-500 text-white cursor-pointer hover:bg-green-600' :
                                    isCurrent ? 'border-blue-600 bg-blue-600 text-white shadow-lg shadow-blue-600/30' :
                                        'border-gray-200 bg-gray-50 text-gray-400 cursor-not-allowed'
                                    }`}
                            >
                                {isCompleted ? <CheckCircle size={20} /> : <step.icon size={18} />}
                            </button>
                            <span className={`mt-2 text-[10px] sm:text-xs font-bold text-center ${isCompleted ? 'text-green-600' :
                                isCurrent ? 'text-blue-600' :
                                    'text-gray-400'
                                }`}>
                                {step.name}
                            </span>
                        </div>
                    )
                })}
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Step 1: Basic Info */}
                {currentStep === 1 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Store Name</label>
                            <input
                                {...form.register('name', {
                                    onChange: (e) => updateSlug(e.target.value)
                                })}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="e.g. Gujarat Heritage"
                            />
                            {form.formState.errors.name && (
                                <p className="mt-1 text-xs text-red-500">{form.formState.errors.name.message}</p>
                            )}
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Store URL Slug</label>
                            <div className="flex rounded-md shadow-sm">
                                <span className="inline-flex items-center rounded-l-md border border-r-0 border-gray-300 bg-gray-50 px-3 text-gray-500 sm:text-sm">
                                    ambajizon.in/
                                </span>
                                <input
                                    {...form.register('slug')}
                                    className="block w-full min-w-0 flex-1 rounded-none rounded-r-md border border-gray-300 px-3 py-2 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                />
                            </div>
                            {form.formState.errors.slug && (
                                <p className="mt-1 text-xs text-red-500">{form.formState.errors.slug.message}</p>
                            )}
                        </div>
                    </div>
                )}

                {/* Step 2: Store Logo */}
                {currentStep === 2 && (
                    <div className="space-y-6 animate-in fade-in slide-in-from-right-4">
                        <ImageCropUpload
                            label="Store Logo"
                            aspectRatio={1}
                            recommendedSize="400x400px"
                            value={form.watch('logo_url')}
                            onChange={(url) => form.setValue('logo_url', url)}
                            folder={`ambajizon/${form.getValues('slug') || 'temp'}/logo`}
                        />
                    </div>
                )}

                {/* Step 3: Contact */}
                {currentStep === 3 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">WhatsApp Number</label>
                            <input
                                {...form.register('whatsapp_number')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Phone Number</label>
                            <input
                                {...form.register('phone_number')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="+91 9876543210"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Shop Timing</label>
                            <input
                                {...form.register('shop_timing')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="Mon-Sat: 10AM - 9PM"
                            />
                        </div>
                    </div>
                )}

                {/* Step 4: Location */}
                {currentStep === 4 && (
                    <div className="space-y-4 animate-in fade-in slide-in-from-right-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700">Google Maps Location URL</label>
                            <input
                                {...form.register('location_url')}
                                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                                placeholder="https://maps.google.com/..."
                            />
                        </div>
                    </div>
                )}

                {/* Navigation Buttons */}
                <div className="mt-8 flex justify-between border-t pt-4">
                    <button
                        type="button"
                        onClick={prevStep}
                        disabled={currentStep === 1 || loading}
                        className={`rounded-md px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50 ${currentStep === 1 ? 'invisible' : ''}`}
                    >
                        Back
                    </button>

                    {currentStep < 4 ? (
                        <button
                            type="button"
                            onClick={nextStep}
                            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500"
                        >
                            Next
                        </button>
                    ) : (
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center rounded-md bg-green-600 px-6 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 disabled:opacity-70"
                        >
                            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                            Complete Setup
                        </button>
                    )}
                </div>
            </form>
        </div>
    )
}
