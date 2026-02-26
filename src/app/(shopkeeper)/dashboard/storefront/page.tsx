'use client'

import { useState, useEffect } from 'react'
import { getStoreSettings, updateStoreSettings } from '@/app/actions/store'
import ImageCropUpload from '@/components/ImageCropUpload'
import { Loader2, Save, Share2, Type } from 'lucide-react'
import { toast } from 'react-hot-toast'
import { SketchPicker } from 'react-color'
import { useStoreContext } from '@/context/StoreContext'

export default function StorefrontSettingsPage() {
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [store, setStore] = useState<any>(null)
    const [showColorPicker, setShowColorPicker] = useState(false)
    const [error, setError] = useState(false)
    const { updateStoreInfo } = useStoreContext()

    useEffect(() => {
        loadSettings()
    }, [])

    async function loadSettings() {
        try {
            const data = await getStoreSettings()
            const tc = data.theme_config || {}
            setStore({
                ...data,
                description: tc.description || data.description || '',
                hero_image_url: tc.hero_image_url || data.hero_image_url || '',
                hero_title: tc.hero_title || '',
                hero_subtitle: tc.hero_subtitle || '',
                hero_cta_text: tc.hero_cta_text || 'Shop Now',
                primary_color: tc.primary_color || '#3b82f6',
                font_style: tc.font_style || 'sans',
                show_flash_sale: tc.show_flash_sale || false,
                show_exclusive: tc.show_exclusive || false,
                show_sales_zone: tc.show_sales_zone || false,
                footer_text: data.footer_text || tc.footer_text || '',
                instagram: data.social_links?.instagram || tc.social_links?.instagram || '',
                facebook: data.social_links?.facebook || tc.social_links?.facebook || '',
                youtube: data.social_links?.youtube || tc.social_links?.youtube || '',
                x: data.social_links?.x || tc.social_links?.x || '',
            })
        } catch (error) {
            setError(true)
            toast.error('Failed to load settings')
        } finally {
            setIsLoading(false)
        }
    }

    async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
        e.preventDefault()
        if (!store) return

        setIsSaving(true)
        const formData = new FormData(e.currentTarget)

        // Append manual fields if needed (like color if not in input)
        formData.set('primary_color', store.primary_color)
        formData.set('logo_url', store.logo_url || '')
        formData.set('hero_image_url', store.hero_image_url || '')

        // Toggles
        formData.set('show_flash_sale', String(store.show_flash_sale))
        formData.set('show_exclusive', String(store.show_exclusive))
        formData.set('show_sales_zone', String(store.show_sales_zone))

        try {
            await updateStoreSettings(formData)

            // Instantly update the global Dashboard state
            updateStoreInfo({
                name: formData.get('name') as string,
                logo_url: formData.get('logo_url') as string
            })

            toast.success('Storefront settings saved!')
        } catch (error) {
            toast.error('Failed to save settings')
        } finally {
            setIsSaving(false)
        }
    }

    if (error) {
        return (
            <div className="flex h-96 flex-col items-center justify-center gap-4">
                <p className="text-red-500">Failed to load store settings.</p>
                <button
                    onClick={() => window.location.reload()}
                    className="rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800"
                >
                    Refresh Page
                </button>
            </div>
        )
    }

    if (isLoading || !store) {
        return (
            <div className="max-w-4xl space-y-8 p-6 animate-pulse">
                <div className="flex items-center justify-between">
                    <div className="h-8 w-48 rounded bg-gray-200"></div>
                    <div className="h-10 w-32 rounded bg-gray-200"></div>
                </div>

                {/* Branding Skeleton */}
                <div className="rounded-xl border bg-white p-6 space-y-6">
                    <div className="h-6 w-32 rounded bg-gray-200"></div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="h-32 w-32 rounded bg-gray-200"></div>
                        <div className="space-y-4">
                            <div className="h-10 w-full rounded bg-gray-200"></div>
                            <div className="h-10 w-full rounded bg-gray-200"></div>
                        </div>
                    </div>
                </div>

                {/* Hero Skeleton */}
                <div className="rounded-xl border bg-white p-6 space-y-6">
                    <div className="h-6 w-32 rounded bg-gray-200"></div>
                    <div className="h-48 w-full rounded bg-gray-200"></div>
                    <div className="grid gap-6 md:grid-cols-2">
                        <div className="h-10 w-full rounded bg-gray-200"></div>
                        <div className="h-10 w-full rounded bg-gray-200"></div>
                    </div>
                </div>
            </div>
        )
    }

    const previewFontClass = store.font_style === 'serif' ? 'font-serif' : store.font_style === 'mono' ? 'font-mono' : 'font-sans'

    return (
        <div className="flex h-[calc(100vh-4rem)] overflow-hidden">
            {/* Left Column: Form Settings */}
            <div className="w-full lg:w-1/2 overflow-y-auto p-6 border-r pb-24">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Storefront Settings</h1>
                    <button
                        type="submit"
                        form="settings-form"
                        disabled={isSaving}
                        className="flex items-center gap-2 rounded-lg bg-black px-4 py-2 text-white hover:bg-gray-800 disabled:opacity-50"
                    >
                        {isSaving ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                        Save Changes
                    </button>
                </div>

                <form id="settings-form" onSubmit={handleSubmit} className="space-y-8">
                    {/* Branding Section */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold border-b pb-2">Store Branding</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-2 block text-sm font-medium">Store Logo</label>
                                <ImageCropUpload
                                    label="Store Logo"
                                    aspectRatio={1}
                                    recommendedSize="400x400px"
                                    value={store.logo_url || ''}
                                    onChange={(url) => setStore({ ...store, logo_url: url })}
                                    folder={`ambajizon/${store.slug}/logo`}
                                />
                            </div>
                            <div className="space-y-4">
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Store Name</label>
                                    <input
                                        name="name"
                                        value={store.name}
                                        onChange={(e) => setStore({ ...store, name: e.target.value })}
                                        className="w-full rounded-lg border p-2"
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="mb-1 block text-sm font-medium">Tagline / Description</label>
                                    <input
                                        name="description"
                                        value={store.description}
                                        onChange={(e) => setStore({ ...store, description: e.target.value })}
                                        className="w-full rounded-lg border p-2"
                                    />
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Hero Section */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold border-b pb-2">Hero Section</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="md:col-span-2">
                                <label className="mb-2 block text-sm font-medium">Hero Banner Image</label>
                                <ImageCropUpload
                                    label="Hero Banner"
                                    aspectRatio={3}
                                    recommendedSize="1200x400px"
                                    value={store.hero_image_url || ''}
                                    onChange={(url) => setStore({ ...store, hero_image_url: url })}
                                    folder={`ambajizon/${store.slug}/banner`}
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Hero Title</label>
                                <input
                                    name="hero_title"
                                    value={store.hero_title}
                                    onChange={(e) => setStore({ ...store, hero_title: e.target.value })}
                                    placeholder="Welcome to my store"
                                    className="w-full rounded-lg border p-2"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Hero Subtitle</label>
                                <input
                                    name="hero_subtitle"
                                    value={store.hero_subtitle}
                                    onChange={(e) => setStore({ ...store, hero_subtitle: e.target.value })}
                                    placeholder="Best quality products..."
                                    className="w-full rounded-lg border p-2"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">CTA Button Text</label>
                                <input
                                    name="hero_cta_text"
                                    value={store.hero_cta_text}
                                    onChange={(e) => setStore({ ...store, hero_cta_text: e.target.value })}
                                    placeholder="Shop Now"
                                    className="w-full rounded-lg border p-2"
                                />
                            </div>
                        </div>
                    </section>

                    {/* Theme Settings */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold border-b pb-2">Theme Settings</h2>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div>
                                <label className="mb-1 block text-sm font-medium">Primary Color</label>
                                <div className="relative">
                                    <div
                                        className="flex cursor-pointer items-center gap-2 rounded-lg border p-2"
                                        onClick={() => setShowColorPicker(!showColorPicker)}
                                    >
                                        <div
                                            className="h-6 w-6 rounded-full border shadow-sm"
                                            style={{ backgroundColor: store.primary_color || '#3b82f6' }}
                                        />
                                        <span>{store.primary_color || '#3b82f6'}</span>
                                    </div>
                                    {showColorPicker && (
                                        <div className="absolute top-12 z-10 bg-white shadow-xl rounded-lg p-2 border">
                                            <div className="fixed inset-0 cursor-default" onClick={() => setShowColorPicker(false)} />
                                            <div className="relative z-20">
                                                <SketchPicker
                                                    color={store.primary_color || '#3b82f6'}
                                                    onChange={(color) => setStore({ ...store, primary_color: color.hex })}
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div>
                                <label className="mb-1 block text-sm font-medium">Font Style</label>
                                <select
                                    name="font_style"
                                    value={store.font_style}
                                    onChange={(e) => setStore({ ...store, font_style: e.target.value })}
                                    className="w-full rounded-lg border p-2"
                                >
                                    <option value="sans">Modern Sans (Inter)</option>
                                    <option value="serif">Classic Serif (Playfair)</option>
                                    <option value="mono">Technical (Mono)</option>
                                </select>
                            </div>
                        </div>
                    </section>

                    {/* Homepage Sections */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <h2 className="mb-4 text-lg font-semibold border-b pb-2">Homepage Sections Manager</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h3 className="font-medium">Flash Sale Section</h3>
                                    <p className="text-sm text-gray-500">Show a countdown timer for urgent deals</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={store.show_flash_sale || false}
                                        onChange={(e) => setStore({ ...store, show_flash_sale: e.target.checked })}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h3 className="font-medium">Exclusive Products</h3>
                                    <p className="text-sm text-gray-500">Highlight premium items</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={store.show_exclusive || false}
                                        onChange={(e) => setStore({ ...store, show_exclusive: e.target.checked })}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                </label>
                            </div>

                            <div className="flex items-center justify-between rounded-lg border p-4">
                                <div>
                                    <h3 className="font-medium">Sales Zone</h3>
                                    <p className="text-sm text-gray-500">Dedicated section for discounted items</p>
                                </div>
                                <label className="relative inline-flex cursor-pointer items-center">
                                    <input
                                        type="checkbox"
                                        checked={store.show_sales_zone || false}
                                        onChange={(e) => setStore({ ...store, show_sales_zone: e.target.checked })}
                                        className="peer sr-only"
                                    />
                                    <div className="peer h-6 w-11 rounded-full bg-gray-200 after:absolute after:left-[2px] after:top-[2px] after:h-5 after:w-5 after:rounded-full after:bg-white after:transition-all after:content-[''] peer-checked:bg-blue-600 peer-checked:after:translate-x-full peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300"></div>
                                </label>
                            </div>
                        </div>
                    </section>

                    {/* Social Links */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <Share2 className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Social Media</h2>
                        </div>
                        <div className="grid gap-6 md:grid-cols-2">
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Instagram URL</label>
                                <input name="instagram" value={store.instagram} onChange={(e) => setStore({ ...store, instagram: e.target.value })} className="w-full rounded-md border p-2 text-sm" placeholder="https://instagram.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">Facebook URL</label>
                                <input name="facebook" value={store.facebook} onChange={(e) => setStore({ ...store, facebook: e.target.value })} className="w-full rounded-md border p-2 text-sm" placeholder="https://facebook.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">YouTube URL</label>
                                <input name="youtube" value={store.youtube} onChange={(e) => setStore({ ...store, youtube: e.target.value })} className="w-full rounded-md border p-2 text-sm" placeholder="https://youtube.com/..." />
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium">X (Twitter) URL</label>
                                <input name="x" value={store.x} onChange={(e) => setStore({ ...store, x: e.target.value })} className="w-full rounded-md border p-2 text-sm" placeholder="https://x.com/..." />
                            </div>
                        </div>
                    </section>

                    {/* Footer */}
                    <section className="rounded-xl border bg-white p-6 shadow-sm">
                        <div className="mb-4 flex items-center gap-2 border-b pb-2">
                            <Type className="h-5 w-5 text-gray-500" />
                            <h2 className="text-lg font-semibold text-gray-800">Footer Content</h2>
                        </div>
                        <div className="space-y-2">
                            <label className="text-sm font-medium">Footer Text/Copyright</label>
                            <textarea name="footer_text" value={store.footer_text} onChange={(e) => setStore({ ...store, footer_text: e.target.value })} className="w-full rounded-md border p-2 text-sm" rows={3} />
                        </div>
                    </section>
                </form>
            </div>

            {/* Right Column: Live Preview */}
            <div className="hidden lg:flex w-1/2 bg-gray-50 items-center justify-center p-8 overflow-y-auto">
                <div className="w-full max-w-[375px] h-[667px] bg-white rounded-[2.5rem] shadow-2xl overflow-hidden border-8 border-gray-900 relative">
                    {/* Fake Header */}
                    <div className="absolute top-0 w-full h-14 bg-white/80 backdrop-blur-md z-10 border-b flex items-center px-4 justify-between">
                        <div className="flex items-center gap-2">
                            {store.logo_url ? <img src={store.logo_url} className="w-8 h-8 rounded-full object-cover" /> : <div className="w-8 h-8 rounded-full bg-gray-200" />}
                            <span className={`font-bold text-sm ${previewFontClass}`}>{store.name || 'Store Name'}</span>
                        </div>
                    </div>

                    <div className={`h-full overflow-y-auto pb-20 ${previewFontClass}`}>
                        {/* Hero Banner Area */}
                        <div className="h-[280px] bg-gray-200 relative pt-14">
                            {store.hero_image_url ? (
                                <img src={store.hero_image_url} className="absolute inset-0 w-full h-full object-cover" />
                            ) : null}
                            <div className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center p-6 text-center pt-14">
                                <h1 className="text-white text-3xl font-bold mb-2">{store.hero_title || 'Welcome'}</h1>
                                <p className="text-white text-sm mb-6">{store.hero_subtitle || 'Best quality products...'}</p>
                                <button
                                    className="px-8 py-3 rounded-full text-white text-sm font-semibold transition-transform hover:scale-105"
                                    style={{ backgroundColor: store.primary_color || '#3b82f6' }}
                                >
                                    {store.hero_cta_text || 'Shop Now'}
                                </button>
                            </div>
                        </div>

                        <div className="p-4 space-y-6">
                            {/* Flash Sale Preview */}
                            {store.show_flash_sale && (
                                <div>
                                    <div className="flex items-center justify-between mb-3">
                                        <h3 className="font-bold text-lg flex items-center gap-2">🔥 Flash Sale</h3>
                                        <span className="text-xs bg-red-100 text-red-600 px-2 py-1 rounded">01:45:22</span>
                                    </div>
                                    <div className="flex gap-3 overflow-x-hidden">
                                        {[1, 2].map((i) => (
                                            <div key={i} className="min-w-[140px] border rounded-lg p-2">
                                                <div className="bg-gray-100 h-24 rounded-md mb-2"></div>
                                                <div className="h-3 bg-gray-200 rounded w-2/3 mb-1"></div>
                                                <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Tags / Categories */}
                            <div className="flex gap-2">
                                <span className="px-3 py-1 bg-gray-100 text-xs rounded-full border">All Items</span>
                                <span
                                    className="px-3 py-1 text-white text-xs rounded-full"
                                    style={{ backgroundColor: store.primary_color || '#3b82f6' }}
                                >
                                    Featured
                                </span>
                            </div>

                            {/* Grid Products */}
                            <div className="grid grid-cols-2 gap-3 pb-8">
                                {[1, 2, 3, 4].map((i) => (
                                    <div key={i} className="border rounded-lg p-2 shadow-sm">
                                        <div className="bg-gray-100 h-32 rounded-md mb-2"></div>
                                        <div className="h-3 bg-gray-200 rounded w-3/4 mb-1"></div>
                                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

