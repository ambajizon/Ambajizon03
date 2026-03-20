import { getStoreBySlug, getProductsByCategory, getStoreSubcategories, getStoreCategories } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import StoreHeader from '@/components/storefront/StoreHeader'
import ProductCard from '@/components/storefront/ProductCard'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import Link from 'next/link'
import { Package, Filter, ChevronRight } from 'lucide-react'

export default async function CategoryPage({ params, searchParams }: { params: { store: string, id: string }, searchParams: { sub?: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) notFound()

    const subcategoryId = searchParams.sub;

    // Fetch categories to find the current one's name
    const allCategories = await getStoreCategories(store.id)
    const currentCategory = allCategories.find((c: any) => c.id === params.id)

    // Fetch products (filtered by subcategory if applicable)
    let products = await getProductsByCategory(store.id, params.id)
    if (subcategoryId) {
        products = products.filter((p: any) => p.subcategory_id === subcategoryId);
    }

    const subcategories = await getStoreSubcategories(params.id)

    return (
        <div className="bg-sf-bg min-h-screen pb-32">
            <StoreHeader
                storeId={store.id}
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logo_url}
                showBack={true}
            />

            <main className="max-w-[1400px] mx-auto w-full p-4 md:p-8 lg:px-10">
                {/* Breadcrumbs */}
                <div className="flex items-center gap-2 text-[12px] font-bold text-sf-muted uppercase tracking-wider mb-6">
                    <Link href={`/${store.slug}/shop`} className="hover:text-sf-accent transition-colors">Store</Link>
                    <ChevronRight size={14} className="text-gray-300" />
                    <span className="text-sf-dark">{currentCategory?.name || 'Category'}</span>
                </div>

                <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
                    <div>
                        <h1 className="text-3xl md:text-5xl font-black text-sf-dark font-display tracking-tight mb-2">
                            {currentCategory?.name || 'Products'}
                        </h1>
                        <p className="text-[14px] text-sf-muted font-medium">
                            Discover our curated collection of {currentCategory?.name || 'exclusive products'}
                        </p>
                    </div>

                    {products.length > 0 && (
                        <div className="text-[13px] font-bold text-sf-muted bg-sf-surface border border-sf-border px-4 py-2 rounded-full shadow-sm w-fit">
                            {products.length} Products Found
                        </div>
                    )}
                </div>

                {/* Subcategories Scrollable Pill List */}
                {subcategories.length > 0 && (
                    <div className="mb-10">
                        <div className="flex items-center gap-2 mb-4">
                            <Filter size={16} className="text-sf-accent" />
                            <h2 className="text-[13px] font-black text-sf-dark uppercase tracking-widest">Filter by Subcategory</h2>
                        </div>
                        <div className="flex gap-2.5 overflow-x-auto pb-4 hide-scrollbar snap-x">
                            <Link
                                href={`/${store.slug}/shop/category/${params.id}`}
                                className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[14px] font-bold border transition-all active:scale-95 snap-start
                                    ${!subcategoryId
                                        ? 'bg-sf-dark text-white border-sf-dark shadow-md'
                                        : 'bg-sf-surface text-sf-muted border-sf-border hover:border-sf-dark/30 shadow-sm'}`}
                            >
                                All Items
                            </Link>
                            {subcategories.map((sub: any) => (
                                <Link
                                    key={sub.id}
                                    href={`/${store.slug}/shop/category/${params.id}?sub=${sub.id}`}
                                    className={`flex-shrink-0 px-6 py-2.5 rounded-full text-[14px] font-bold border transition-all active:scale-95 snap-start
                                        ${subcategoryId === sub.id
                                            ? 'bg-sf-dark text-white border-sf-dark shadow-md'
                                            : 'bg-sf-surface text-sf-muted border-sf-border hover:border-sf-dark/30 shadow-sm'}`}
                                >
                                    {sub.name}
                                </Link>
                            ))}
                        </div>
                    </div>
                )}

                {products.length > 0 ? (
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4 md:gap-6">
                        {products.map((product: any) => (
                            <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                        ))}
                    </div>
                ) : (
                    <div className="bg-sf-surface rounded-3xl border border-sf-border shadow-card p-16 text-center max-w-lg mx-auto mt-12">
                        <div className="w-20 h-20 bg-sf-bg rounded-full flex items-center justify-center mx-auto mb-6 text-sf-muted shadow-inner">
                            <Package size={36} className="stroke-[1.2px]" />
                        </div>
                        <h3 className="text-xl font-black text-sf-dark mb-2 font-display">No products here yet</h3>
                        <p className="text-[14px] text-sf-muted font-medium mb-1">We're still curating this category.</p>
                        <p className="text-[12px] text-sf-muted/60 mb-8 capitalize opacity-80">Store: {store.name}</p>
                        <Link href={`/${store.slug}/shop`} className="inline-block bg-sf-dark text-white px-8 py-3 rounded-full font-bold shadow-md hover:bg-sf-dark/90 active:scale-95 transition-all">
                            Back to Store
                        </Link>
                    </div>
                )}
            </main>

            <MobileBottomNav storeSlug={store.slug} />
        </div>
    )
}

