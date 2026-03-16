import { getStoreBySlug } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'

// Define the valid policy slugs and map them to their display titles and corresponding DB column names
const policyConfig = {
    'terms-conditions': { title: 'Terms & Conditions', field: 'terms_conditions' },
    'privacy-policy': { title: 'Privacy Policy', field: 'privacy_policy' },
    'returns-policy': { title: 'Returns & Cancellations', field: 'returns_policy' },
    'refunds-policy': { title: 'Refunds Policy', field: 'refunds_policy' },
    'shipping-policy': { title: 'Shipping Policy', field: 'shipping_policy' },
    'disclaimer': { title: 'Disclaimer', field: 'disclaimer' },
} as const;

type PolicySlug = keyof typeof policyConfig;

interface PolicyPageProps {
    params: {
        store: string
        slug: string
    }
}

export async function generateMetadata({ params }: PolicyPageProps) {
    const storeData = await getStoreBySlug(params.store)
    if (!storeData) return { title: 'Not Found' }

    const config = policyConfig[params.slug as PolicySlug]
    const title = config ? config.title : 'Policy'

    return {
        title: `${title} | ${storeData.name}`,
    }
}

export default async function StorePolicyPage({ params }: PolicyPageProps) {
    const store = await getStoreBySlug(params.store)

    // Validate store and policy slug
    if (!store) notFound()

    const config = policyConfig[params.slug as PolicySlug]
    if (!config) notFound()

    // Retrieve the specific policy content
    const content = store[config.field] as string | null

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
            {/* Minimal Header */}
            <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
                <div className="max-w-3xl mx-auto px-6 h-16 flex items-center justify-between">
                    <Link
                        href={`/${store.slug}/shop`}
                        className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors text-sm font-medium"
                    >
                        <ArrowLeft size={16} />
                        Back to Store
                    </Link>
                    <span className="font-bold text-slate-800 tracking-tight">{store.name}</span>
                </div>
            </header>

            {/* Content Area */}
            <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12 md:py-20">
                <article className="bg-white rounded-2xl shadow-sm border border-slate-200 p-8 md:p-12">
                    <header className="mb-10 text-center md:text-left">
                        <h1 className="text-3xl md:text-4xl font-black text-slate-900 tracking-tight mb-4">
                            {config.title}
                        </h1>
                        <p className="text-sm text-slate-500 font-medium">
                            Last updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                        </p>
                    </header>

                    <div className="prose prose-slate max-w-none prose-headings:font-bold prose-headings:tracking-tight prose-a:text-indigo-600 hover:prose-a:text-indigo-500">
                        {content ? (
                            <div className="whitespace-pre-wrap leading-relaxed text-slate-700">
                                {content}
                            </div>
                        ) : (
                            <div className="bg-slate-50 border border-slate-200 rounded-lg p-6 text-center">
                                <p className="text-slate-500">
                                    This policy has not been configured by the store owner yet.
                                </p>
                            </div>
                        )}
                    </div>
                </article>
            </main>

            {/* Minimal Footer */}
            <footer className="py-8 text-center border-t border-slate-200">
                <p className="text-xs text-slate-500 font-medium tracking-wide">
                    &copy; {new Date().getFullYear()} {store.name}. ALL RIGHTS RESERVED.
                </p>
            </footer>
        </div>
    )
}
