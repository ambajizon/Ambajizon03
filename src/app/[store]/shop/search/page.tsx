'use client'

import { useState, useEffect } from 'react'
import { getStoreBySlug, getStoreProducts } from '@/app/actions/storefront'
import ProductCard from '@/components/storefront/ProductCard'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import { Search as SearchIcon, X, ArrowLeft } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'

export default function SearchPage({ params }: { params: { store: string } }) {
    const router = useRouter()
    const searchParams = useSearchParams()
    const initialQuery = searchParams.get('q') || ''

    const [query, setQuery] = useState(initialQuery)
    const [results, setResults] = useState<any[]>([])
    const [loading, setLoading] = useState(false)
    const [storeId, setStoreId] = useState('')

    useEffect(() => {
        getStoreBySlug(params.store).then(store => {
            if (store) setStoreId(store.id)
        })
    }, [params.store])

    useEffect(() => {
        if (query.length > 2 && storeId) {
            handleSearch()
        } else if (query.length === 0) {
            setResults([])
        }
    }, [query, storeId])

    async function handleSearch() {
        setLoading(true)
        const products = await getStoreProducts(storeId)
        const filtered = products.filter((p: any) =>
            p.name.toLowerCase().includes(query.toLowerCase()) ||
            (p.description && p.description.toLowerCase().includes(query.toLowerCase()))
        )
        setResults(filtered)
        setLoading(false)
    }

    return (
        <div className="min-h-screen bg-sf-bg pb-24">
            {/* Search Header */}
            <div className="sticky top-0 bg-sf-surface/90 backdrop-blur-md border-b border-sf-border px-4 py-4 flex items-center gap-4 z-40 shadow-sm">
                <Link href={`/${params.store}/shop`} className="text-sf-muted shrink-0 p-1.5 -ml-1 rounded-full hover:bg-sf-bg transition-all active:scale-90">
                    <ArrowLeft size={24} strokeWidth={2.5} />
                </Link>
                <div className="flex-1 relative group">
                    <SearchIcon className="absolute left-4 top-1/2 -translate-y-1/2 text-sf-muted group-focus-within:text-sf-accent transition-colors" size={20} />
                    <input
                        className="w-full pl-12 pr-12 py-3.5 bg-sf-bg border border-sf-border rounded-[18px] outline-none focus:ring-4 focus:ring-sf-accent/5 focus:border-sf-accent/30 text-[16px] font-medium text-sf-dark placeholder:text-sf-muted transition-all"
                        placeholder="What are you looking for?"
                        autoFocus
                        value={query}
                        onChange={e => {
                            setQuery(e.target.value)
                            router.replace(`/${params.store}/shop/search?q=${e.target.value}`)
                        }}
                    />
                    {query && (
                        <button
                            onClick={() => {
                                setQuery('')
                                setResults([])
                                router.replace(`/${params.store}/shop/search`)
                            }}
                            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-sf-muted p-1.5 rounded-full hover:bg-sf-border transition-all active:scale-90"
                        >
                            <X size={18} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="bg-sf-surface rounded-2xl overflow-hidden border border-sf-border animate-pulse shadow-sm">
                                <div className="aspect-square bg-sf-bg" />
                                <div className="p-4 space-y-3">
                                    <div className="h-3.5 bg-sf-bg rounded w-3/4" />
                                    <div className="h-4.5 bg-sf-bg rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <p className="text-[13px] text-sf-muted mb-6 font-bold uppercase tracking-wider pl-1">Found {results.length} item{results.length !== 1 ? 's' : ''}</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
                            {results.map(p => (
                                <ProductCard key={p.id} product={p} storeSlug={params.store} />
                            ))}
                        </div>
                    </>
                ) : query.length > 2 ? (
                    <div className="text-center py-32 flex flex-col items-center justify-center bg-sf-surface rounded-[32px] border border-sf-border shadow-card mt-4 mx-2">
                        <div className="w-24 h-24 bg-sf-bg rounded-full flex items-center justify-center text-4xl mb-8 border border-sf-border shadow-inner">
                            🔎
                        </div>
                        <h3 className="text-2xl font-black text-sf-dark mb-3 font-display">No results for "{query}"</h3>
                        <p className="text-sf-muted font-medium max-w-[280px] leading-relaxed">Try adjusting your search or check for typos.</p>
                    </div>
                ) : (
                    <div className="text-center py-32 flex flex-col items-center justify-center bg-sf-surface rounded-[32px] border border-sf-border shadow-card mt-4 mx-2">
                        <div className="w-24 h-24 bg-sf-bg rounded-full flex items-center justify-center text-4xl mb-8 border border-sf-border shadow-inner">
                            ✨
                        </div>
                        <h3 className="text-2xl font-black text-sf-dark mb-3 font-display">Search our collection</h3>
                        <p className="text-sf-muted font-medium max-w-[280px] leading-relaxed">Enter a keyword to discover our exclusive premium products.</p>
                    </div>
                )}
            </div>

            <MobileBottomNav storeSlug={params.store} />
        </div>
    )
}
