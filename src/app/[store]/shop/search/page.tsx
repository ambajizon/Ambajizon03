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
        <div className="min-h-screen bg-gray-50 pb-24">
            {/* Search Header */}
            <div className="sticky top-0 bg-white border-b px-4 py-3 flex items-center gap-3 z-40 shadow-sm">
                <Link href={`/${params.store}/shop`} className="text-gray-500 shrink-0 p-1 -ml-1 rounded-full hover:bg-gray-100 transition active:scale-90">
                    <ArrowLeft size={24} />
                </Link>
                <div className="flex-1 relative">
                    <SearchIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input
                        className="w-full pl-10 pr-10 py-3 bg-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-primary/20 text-base"
                        placeholder="Search for products..."
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
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1 rounded-full hover:bg-gray-200 transition"
                        >
                            <X size={16} />
                        </button>
                    )}
                </div>
            </div>

            {/* Results */}
            <div className="p-4">
                {loading ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="bg-white rounded-2xl overflow-hidden border border-gray-100 animate-pulse">
                                <div className="aspect-square bg-gray-200" />
                                <div className="p-3 space-y-2">
                                    <div className="h-3 bg-gray-200 rounded w-3/4" />
                                    <div className="h-4 bg-gray-200 rounded w-1/2" />
                                </div>
                            </div>
                        ))}
                    </div>
                ) : results.length > 0 ? (
                    <>
                        <p className="text-sm text-gray-500 mb-4 font-medium">{results.length} result{results.length !== 1 ? 's' : ''} for &ldquo;{query}&rdquo;</p>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {results.map(p => (
                                <ProductCard key={p.id} product={p} storeSlug={params.store} />
                            ))}
                        </div>
                    </>
                ) : query.length > 2 ? (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center text-4xl mb-6 border border-gray-100 shadow-inner">
                            🔍
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">No products found</h3>
                        <p className="text-gray-500 font-medium max-w-[220px]">We couldn't find anything matching "{query}"</p>
                    </div>
                ) : (
                    <div className="text-center py-24 flex flex-col items-center justify-center">
                        <div className="w-20 h-20 bg-blue-50 rounded-full flex items-center justify-center text-4xl mb-6 border border-blue-100 shadow-inner">
                            🎯
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">What are you looking for?</h3>
                        <p className="text-gray-500 font-medium max-w-[220px]">Type at least 3 characters to search the catalog.</p>
                    </div>
                )}
            </div>

            <MobileBottomNav storeSlug={params.store} />
        </div>
    )
}
