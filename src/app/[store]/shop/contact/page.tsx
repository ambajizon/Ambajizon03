import { getStoreBySlug } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, MapPin, Phone, MessageCircle, Mail } from 'lucide-react'

export async function generateMetadata({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) return { title: 'Store Not Found' }

    return {
        title: `Contact Us | ${store.name}`,
        description: `Get in touch with ${store.name}`
    }
}

export default async function ContactPage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)

    if (!store) {
        notFound()
    }

    const contactContent = store.contact_page_text || `We'd love to hear from you. Please reach out to us using any of the contact methods below.`

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 w-full max-w-[1000px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <Link href={`/${store.slug}/shop`} className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">Contact Us</span>
                </nav>

                <div className="mb-10 text-center">
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
                        Get in Touch
                    </h1>
                    <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                        Have a question about our products or your order? We're here to help.
                    </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* Left Column: Custom Message */}
                    <div className="lg:col-span-7 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 md:p-10">
                        <h2 className="text-2xl font-bold text-gray-900 mb-6">Contact Information</h2>
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap mb-10">
                            {contactContent}
                        </div>

                        {store.location_url && (
                            <div className="mt-8 border-t border-gray-100 pt-8">
                                <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                    <MapPin className="text-blue-600" size={20} />
                                    Visit Our Store
                                </h3>
                                <a
                                    href={store.location_url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-medium px-6 py-3 rounded-xl transition-colors"
                                >
                                    Open in Google Maps
                                </a>
                            </div>
                        )}
                    </div>

                    {/* Right Column: Contact Methods */}
                    <div className="lg:col-span-5 space-y-4">
                        {store.whatsapp_number && (
                            <a
                                href={`https://wa.me/${store.whatsapp_number}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-[#25D366] hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-[#25D366]/10 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <MessageCircle className="text-[#25D366] w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">WhatsApp Support</p>
                                    <p className="text-lg font-bold text-gray-900">+{store.whatsapp_number}</p>
                                </div>
                            </a>
                        )}

                        {store.phone_number && (
                            <a
                                href={`tel:${store.phone_number}`}
                                className="flex items-center gap-4 bg-white p-6 rounded-2xl shadow-sm border border-gray-100 hover:border-blue-500 hover:shadow-md transition-all group"
                            >
                                <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center shrink-0 group-hover:scale-110 transition-transform">
                                    <Phone className="text-blue-600 w-6 h-6" />
                                </div>
                                <div>
                                    <p className="text-sm font-medium text-gray-500 mb-1">Call Us</p>
                                    <p className="text-lg font-bold text-gray-900">{store.phone_number}</p>
                                </div>
                            </a>
                        )}

                        <div className="flex items-start gap-4 bg-gray-900 text-white p-6 rounded-2xl shadow-sm mt-8">
                            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <Mail className="text-white w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-400 mb-1">Need immediate help?</p>
                                <p className="text-base text-gray-200">The fastest way to reach us is via WhatsApp. Our team usually responds within a few hours.</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}
