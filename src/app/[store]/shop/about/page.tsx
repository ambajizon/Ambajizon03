import { getStoreBySlug } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ChevronRight, Info } from 'lucide-react'

export async function generateMetadata({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) return { title: 'Store Not Found' }

    return {
        title: `About Us | ${store.name}`,
        description: `Learn more about ${store.name}`
    }
}

export default async function AboutPage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)

    if (!store) {
        notFound()
    }

    // Default text if nothing is set
    const aboutContent = store.about_page_text || `Welcome to ${store.name}. We are dedicated to providing you with the best products and customer experience. Explore our collection and discover quality items curated just for you.`

    return (
        <main className="min-h-screen bg-gray-50 flex flex-col">
            <div className="flex-1 w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-16">

                {/* Breadcrumb */}
                <nav className="flex items-center gap-2 text-[13px] text-gray-500 mb-8 overflow-x-auto whitespace-nowrap hide-scrollbar">
                    <Link href={`/${store.slug}/shop`} className="hover:text-primary transition-colors">Home</Link>
                    <ChevronRight size={14} />
                    <span className="text-gray-900 font-medium">About Us</span>
                </nav>

                {/* Main Content Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                    {/* Header Banner */}
                    <div className="bg-primary/5 py-10 px-6 md:px-12 text-center border-b border-gray-100">
                        <div className="w-16 h-16 bg-white rounded-full flex items-center justify-center shadow-sm mx-auto mb-4">
                            <Info className="w-8 h-8 text-primary" />
                        </div>
                        <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight mb-2">
                            About {store.name}
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Our Story & Mission
                        </p>
                    </div>

                    {/* Text Body */}
                    <div className="p-6 md:p-12">
                        <div className="prose prose-blue max-w-none text-gray-700 leading-relaxed md:text-lg whitespace-pre-wrap">
                            {aboutContent}
                        </div>
                    </div>
                </div>

            </div>
        </main>
    )
}
