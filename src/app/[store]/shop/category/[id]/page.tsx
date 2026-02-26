import { getStoreBySlug, getProductsByCategory, getStoreSubcategories } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import StoreHeader from '@/components/storefront/StoreHeader'
import ProductCard from '@/components/storefront/ProductCard'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import Link from 'next/link'
import { Package } from 'lucide-react'

export default async function CategoryPage({ params, searchParams }: { params: { store: string, id: string }, searchParams: { sub?: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) notFound()

    const subcategoryId = searchParams.sub;

    // Fetch products (filtered by subcategory if applicable)
    let products = await getProductsByCategory(store.id, params.id)
    if (subcategoryId) {
        products = products.filter((p: any) => p.subcategory_id === subcategoryId);
    }

    const subcategories = await getStoreSubcategories(params.id)

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <StoreHeader
                storeId={store.id}
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logo_url}
                showBack={true}
            />

            <div className="p-4">
                {/* Subcategories Scrollable Pill List */}
                {subcategories.length > 0 && (
                    <div className="mb-6">
                        <h2 className="text-sm font-bold text-gray-700 mb-3">Shop by Subcategory</h2>
                        <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide snap-x">
                            <Link
                                href={`/${store.slug}/shop/category/${params.id}`}
                                className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border snap-start transition-colors ${!subcategoryId ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200'}`}
                            >
                                All
                            </Link>
                            {subcategories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/${store.slug}/shop/category/${params.id}?sub=${sub.id}`}
                                    className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium border snap-start transition-colors ${subcategoryId === sub.id ? 'bg-primary text-white border-primary' : 'bg-white text-gray-600 border-gray-200 hover:bg-gray-50'}`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                <h1 className="text-lg font-bold text-gray-900 mb-4">Products</h1>

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                        ))}
                    </div>
                ) : (
                    <div className="p-12 text-center">
                        <Package size={40} className="mx-auto text-gray-300 mb-3" />
                        <p className="text-gray-500 font-medium">No products yet</p>
                        <p className="text-gray-300 text-sm mt-1">Check back soon!</p>
                    </div>
                )}
            </div>

            <MobileBottomNav storeSlug={store.slug} />
        </div>
    )
}
