// ... imports
import { getStoreBySlug, getStoreCategories, getFeaturedProducts, getStoreOffers, getProductsBySection } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/components/storefront/StoreHeader'
import ProductCard from '@/components/storefront/ProductCard'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import { Flame, Star, Package, Clock, ChevronRight, TrendingUp, ShieldCheck, Truck, RefreshCcw, CreditCard } from 'lucide-react'

export default async function ShopPage({ params }: { params: { store: string } }) {
    const store = await getStoreBySlug(params.store)
    if (!store) return notFound()

    const [categories, allProducts, flashSaleProducts, exclusiveProducts, offers] = await Promise.all([
        getStoreCategories(store.id),
        getFeaturedProducts(store.id),
        getProductsBySection(store.id, 'flash_sale'),
        getProductsBySection(store.id, 'exclusive'),
        getStoreOffers(store.id),
    ])
    const activeOffer = offers.length > 0 ? offers[0] : null

    const themeConfig = (store as any).theme_config || {}
    const heroBannerUrl = store.hero_banner_url || themeConfig.hero_banner_url || null
    const showExclusive = themeConfig.show_exclusive !== false
    const showFlashSale = themeConfig.show_flash_sale !== false

    return (
        <div className="bg-gray-50 min-h-screen pb-24 md:pb-12">
            <StoreHeader
                storeId={store.id}
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logo_url}
                showBack={false}
            />

            {/* Hero Banner Area */}
            <div className="w-full relative h-[400px] md:h-[600px] overflow-hidden bg-[#101622]">
                {heroBannerUrl && (
                    <Image
                        src={heroBannerUrl}
                        alt="Banner"
                        fill
                        className="object-cover"
                        priority
                    />
                )}
                <div className="absolute inset-0 bg-gradient-to-t md:bg-gradient-to-r from-[#101622]/90 via-[#101622]/70 to-[#101622]/20 flex flex-col justify-end md:justify-center p-6 md:p-16 lg:px-24 max-w-[1400px] mx-auto w-full">
                    <div className="text-white w-full max-w-3xl">
                        {themeConfig.hero_subtitle && (
                            <span className="inline-block bg-primary/20 text-primary-light border border-primary/30 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4 md:mb-6">
                                {themeConfig.hero_subtitle}
                            </span>
                        )}
                        <h2 className="text-4xl md:text-6xl lg:text-7xl font-black font-sans leading-[1.05] tracking-tight drop-shadow-lg mb-4 md:mb-6">
                            {themeConfig.hero_title || store.name}
                        </h2>
                        <p className="text-[15px] md:text-xl lg:text-xl text-gray-300 font-medium leading-relaxed max-w-xl drop-shadow-md mb-8">
                            Upgrade your lifestyle with our curated collection of premium products. Explore the best quality deals today.
                        </p>
                        <div className="flex items-center gap-4">
                            <Link
                                href={`/${store.slug}/shop/search`}
                                className="bg-primary text-white font-bold py-3.5 px-8 rounded-lg shadow-lg hover:shadow-primary/30 hover:bg-primary/90 transition-all hover:-translate-y-1 active:scale-95"
                            >
                                Shop Now
                            </Link>
                            <Link
                                href={`/${store.slug}/shop/search`}
                                className="bg-white/10 backdrop-blur-sm border border-white/20 text-white font-bold py-3.5 px-8 rounded-lg hover:bg-white/20 transition-all active:scale-95"
                            >
                                View Deals
                            </Link>
                        </div>
                    </div>
                </div>
            </div>

            <main className="max-w-[1400px] mx-auto w-full pb-8 lg:px-8">

                {/* Festival Offer Row underneath Hero */}
                {activeOffer && activeOffer.banner_url && (
                    <div className="w-full mt-4 md:mt-8 px-4 md:px-6 lg:px-8">
                        <div className="relative rounded-[16px] md:rounded-[24px] overflow-hidden h-[100px] md:h-[180px] lg:h-[220px] bg-gray-200 shadow-sm border border-gray-100 group">
                            <Image
                                src={activeOffer.banner_url}
                                alt={activeOffer.title || 'Festival Offer'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                unoptimized={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/40 to-transparent flex items-center p-5 md:p-12">
                                <h3 className="text-white font-black text-xl md:text-4xl lg:text-5xl max-w-[70%] md:max-w-[50%] leading-tight drop-shadow-lg tracking-tight">
                                    {activeOffer.title}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* Categories Grid (Desktop) / Scroll (Mobile) */}
                {
                    categories.length > 0 && (
                        <section className="pt-6 md:pt-12 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                            <div className="flex items-center justify-between mb-5 md:mb-8">
                                <h3 className="text-[18px] md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Shop by Category</h3>
                            </div>

                            {/* Mobile: Horizontal Scroll (unchanged behavior, wrapped in responsive container) */}
                            <div className="md:hidden flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x relative z-10" style={{ maskImage: 'linear-gradient(to right, black 90%, transparent 100%)', WebkitMaskImage: 'linear-gradient(to right, black 90%, transparent 100%)' }}>
                                <Link
                                    href={`/${store.slug}/shop/search`}
                                    className="flex-shrink-0 w-[76px] flex flex-col items-center gap-2.5 snap-start active:scale-95 transition-transform"
                                >
                                    <div className="w-24 h-24 rounded-full p-2 bg-slate-200 border-2 border-transparent group-hover:border-primary transition-all">
                                        <div className="w-full h-full rounded-full bg-slate-300 flex items-center justify-center">
                                            <Package size={24} className="text-slate-500" />
                                        </div>
                                    </div>
                                    <span className="text-sm font-bold text-gray-900 w-full text-center mt-1">All Items</span>
                                </Link>

                                {categories.map((cat: any) => (
                                    <Link
                                        key={cat.id}
                                        href={`/${store.slug}/shop/category/${cat.id}`}
                                        className="flex-shrink-0 w-[76px] flex flex-col items-center gap-2.5 snap-start active:scale-95 transition-transform group"
                                    >
                                        <div className="w-24 h-24 rounded-full p-2 bg-slate-200 border-2 border-transparent group-hover:border-primary transition-all">
                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-slate-300 flex items-center justify-center">
                                                {cat.image_url ? (
                                                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                                                ) : (
                                                    <span className="text-gray-500 font-bold text-sm">{cat.name.substring(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-center font-bold text-gray-900 line-clamp-2 w-full mt-1">
                                            {cat.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>

                            {/* Desktop: Wrap Grid */}
                            <div className="hidden md:flex flex-wrap lg:grid lg:grid-cols-6 xl:grid-cols-8 gap-6 lg:gap-8">
                                <Link
                                    href={`/${store.slug}/shop/search`}
                                    className="w-[100px] lg:w-[120px] flex flex-col items-center gap-3 group mx-auto"
                                >
                                    <div className="w-24 h-24 md:w-32 md:h-32 rounded-full p-2 bg-slate-200 border-2 border-transparent group-hover:border-primary transition-all">
                                        <div className="w-full h-full rounded-full bg-slate-300 flex items-center justify-center">
                                            <Package size={32} className="text-slate-500 group-hover:text-primary transition-colors" strokeWidth={2} />
                                        </div>
                                    </div>
                                    <span className="text-sm text-center font-bold text-gray-900 group-hover:text-primary transition-colors mt-1">All Items</span>
                                </Link>

                                {categories.slice(0, 15).map((cat: any) => (
                                    <Link
                                        key={cat.id}
                                        href={`/${store.slug}/shop/category/${cat.id}`}
                                        className="w-[100px] lg:w-[120px] flex flex-col items-center gap-3 group mx-auto"
                                    >
                                        <div className="w-24 h-24 rounded-full bg-white border border-gray-100 p-1 shadow-[0_4px_12px_rgba(0,0,0,0.04)] relative group-hover:border-primary group-hover:shadow-[0_8px_20px_rgba(0,0,0,0.1)] transition-all duration-300 group-hover:scale-105">
                                            <div className="w-full h-full rounded-full overflow-hidden relative bg-gray-50 flex items-center justify-center">
                                                {cat.image_url ? (
                                                    <Image src={cat.image_url} alt={cat.name} fill className="object-cover group-hover:scale-110 transition-transform duration-500" />
                                                ) : (
                                                    <span className="text-gray-400 font-black text-xl lg:text-xl">{cat.name.substring(0, 2).toUpperCase()}</span>
                                                )}
                                            </div>
                                        </div>
                                        <span className="text-sm text-center font-medium text-gray-700 group-hover:text-gray-900 transition-colors line-clamp-2 w-full leading-tight">
                                            {cat.name}
                                        </span>
                                    </Link>
                                ))}
                            </div>
                        </section>
                    )
                }

                {/* Flash Sale Section */}
                {
                    showFlashSale && flashSaleProducts.length > 0 && (
                        <section className="mt-8 md:mt-12 py-10 md:py-16 bg-slate-100 w-full overflow-hidden border-y border-slate-200">
                            <div className="max-w-[1400px] mx-auto px-4 md:px-6 lg:px-8 w-full">
                                <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 md:mb-10 relative z-10 gap-4">
                                    <div className="flex flex-col sm:flex-row sm:items-center gap-4 md:gap-6">
                                        <h3 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tight text-gray-900">Flash Sale</h3>
                                        <div className="flex items-center gap-3">
                                            <span className="text-sm font-bold text-gray-400 uppercase tracking-widest">Ends In:</span>
                                            <div className="flex gap-2">
                                                <div className="bg-primary text-white font-mono font-bold text-lg md:text-xl w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded uppercase shadow-sm">
                                                    08
                                                </div>
                                                <div className="bg-primary text-white font-mono font-bold text-lg md:text-xl w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded uppercase shadow-sm">
                                                    24
                                                </div>
                                                <div className="bg-primary text-white font-mono font-bold text-lg md:text-xl w-10 md:w-12 h-10 md:h-12 flex items-center justify-center rounded uppercase shadow-sm">
                                                    56
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="hidden md:block">
                                        <Link href={`/${store.slug}/shop/search`} className="text-[15px] font-bold text-gray-600 hover:text-primary flex items-center transition-colors">
                                            View All <ChevronRight size={20} className="ml-1" strokeWidth={2.5} />
                                        </Link>
                                    </div>
                                </div>

                                <div className="flex md:grid gap-4 md:gap-5 lg:gap-6 overflow-x-auto md:overflow-visible pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 scrollbar-hide snap-x relative z-10 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                    {flashSaleProducts.slice(0, 5).map((product: any) => (
                                        <div key={product.id} className="min-w-[200px] md:min-w-0 snap-start shrink-0">
                                            <ProductCard product={product} storeSlug={store.slug} />
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </section>
                    )
                }

                {/* Exclusive Section */}
                {
                    showExclusive && exclusiveProducts.length > 0 && (
                        <section className="pt-8 md:pt-16 px-4 md:px-6 lg:px-8 max-w-7xl mx-auto w-full">
                            <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-gray-100 pb-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-warning/10 flex items-center justify-center shrink-0">
                                        <Star size={24} className="text-warning fill-warning" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Exclusive Picks</h3>
                                        <p className="text-[13px] md:text-[15px] text-gray-500 font-medium mt-1">Curated specially for you</p>
                                    </div>
                                </div>
                                <Link href={`/${store.slug}/shop/search`} className="hidden md:flex text-[15px] font-bold text-primary items-center hover:bg-primary/5 px-4 py-2 rounded-full transition-colors">
                                    View all <ChevronRight size={18} className="ml-0.5" />
                                </Link>
                                <Link href={`/${store.slug}/shop/search`} className="md:hidden text-[13px] font-bold text-primary flex items-center hover:underline h-full mb-1">
                                    See all <ChevronRight size={14} className="ml-0.5" />
                                </Link>
                            </div>
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-6 lg:gap-8">
                                {exclusiveProducts.map((product: any) => (
                                    <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                                ))}
                            </div>
                        </section>
                    )
                }

                {/* All Products Grid */}
                <section className="pt-8 md:pt-16 px-4 md:px-6 lg:px-0 max-w-7xl mx-auto w-full">
                    <div className="w-full">
                        <div className="flex items-end justify-between mb-6 md:mb-10 border-b border-gray-100 pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 md:w-12 md:h-12 rounded-full bg-success/10 flex items-center justify-center shrink-0">
                                    <TrendingUp size={24} className="text-success" />
                                </div>
                                <div>
                                    <h3 className="text-xl md:text-2xl lg:text-3xl font-black text-gray-900 tracking-tight">Just For You</h3>
                                    <p className="text-[13px] md:text-[15px] text-gray-500 font-medium mt-1">Explore our entire catalogue</p>
                                </div>
                            </div>
                        </div>

                        {allProducts.length > 0 ? (
                            <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5 xl:gap-6">
                                {allProducts.map((product: any) => (
                                    <ProductCard key={product.id} product={product} storeSlug={store.slug} />
                                ))}
                            </div>
                        ) : (
                            <div className="py-20 md:py-32 text-center bg-white rounded-[24px] border border-dashed border-gray-200">
                                <div className="w-20 h-20 md:w-24 md:h-24 bg-gray-50 flex items-center justify-center rounded-full mx-auto mb-6">
                                    <Package size={40} className="text-gray-300 md:w-12 md:h-12" />
                                </div>
                                <h3 className="text-[18px] md:text-2xl font-black text-gray-900 mb-2">No products yet</h3>
                                <p className="text-[14px] md:text-[16px] text-gray-500 max-w-md mx-auto">This store currently doesn't have any products available in its catalogue. Check back soon!</p>
                            </div>
                        )}
                    </div>
                </section>
            </main>

            {/* Trust Badges Section */}
            <section className="bg-slate-50 border-t border-slate-200 py-16">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 lg:gap-8">
                        <div className="bg-primary/5 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 hover:shadow-sm transition-shadow">
                            <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <ShieldCheck size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Genuine Products</h4>
                                <p className="text-sm text-slate-500 mt-1">100% original items with international warranty.</p>
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 hover:shadow-sm transition-shadow">
                            <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <Truck size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Fast Delivery</h4>
                                <p className="text-sm text-slate-500 mt-1">Free shipping on orders over $100 within 48 hours.</p>
                            </div>
                        </div>
                        <div className="bg-primary/5 rounded-xl p-6 flex flex-col md:flex-row items-center md:items-start text-center md:text-left gap-4 hover:shadow-sm transition-shadow">
                            <div className="w-14 h-14 shrink-0 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                                <CreditCard size={28} />
                            </div>
                            <div>
                                <h4 className="font-bold text-lg text-slate-900">Secure Payment</h4>
                                <p className="text-sm text-slate-500 mt-1">PCI-DSS compliant encrypted transactions.</p>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Premium Footer Area (Mobile + Desktop 4-column) */}
            <div className="bg-slate-950 text-slate-50 pt-16 lg:pt-20 pb-16 lg:pb-20">
                <div className="max-w-[1400px] mx-auto px-6 lg:px-8">
                    <div className="flex flex-col lg:flex-row gap-12 lg:gap-20">
                        {/* Column 1: Brand Info */}
                        <div className="lg:w-[320px] shrink-0 text-center lg:text-left space-y-5">
                            <div className="flex flex-col lg:flex-row items-center justify-center lg:justify-start gap-4 mb-6">
                                {store.logo_url ? (
                                    <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white shadow-sm p-0.5">
                                        <div className="relative w-full h-full rounded-md overflow-hidden">
                                            <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
                                        </div>
                                    </div>
                                ) : (
                                    <div className="w-12 h-12 rounded-lg bg-primary flex items-center justify-center text-xl font-black text-white shadow-sm">
                                        {store.name.charAt(0)}
                                    </div>
                                )}
                                <h4 className="font-black text-2xl text-white tracking-tight">{store.name}</h4>
                            </div>
                            <p className="text-[14px] text-slate-400 leading-relaxed max-w-sm mx-auto lg:mx-0">
                                {store.footer_text || 'The ultimate destination for premium enthusiasts. We curate only the best performing and most aesthetic items.'}
                            </p>
                            <div className="flex items-center justify-center lg:justify-start gap-4 pt-2">
                                <CreditCard size={24} className="text-slate-500" />
                                <ShieldCheck size={24} className="text-slate-500" />
                            </div>
                        </div>

                        {/* Column 2, 3, 4: Links (Desktop & Mobile 3-column Layout) */}
                        <div className="grid grid-cols-2 lg:grid-cols-3 flex-1 gap-10 lg:gap-8 text-center lg:text-left">
                            <div>
                                <h5 className="font-bold text-white mb-6 text-[16px] tracking-wide text-sm lg:text-base">Store Info</h5>
                                <ul className="space-y-4">
                                    <li><Link href={`/${store.slug}/shop/dynamic/our-story`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Our Story</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/find-a-store`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Find a Store</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/career`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Career</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/affiliates`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Affiliates</Link></li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-bold text-white mb-6 text-[16px] tracking-wide text-sm lg:text-base">Support</h5>
                                <ul className="space-y-4">
                                    <li><Link href={`/${store.slug}/shop/orders`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Order Status</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/shipping-and-returns`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Shipping & Returns</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/privacy-policy`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Privacy Policy</Link></li>
                                    <li><Link href={`/${store.slug}/shop/dynamic/terms-of-service`} className="text-[13px] text-slate-400 hover:text-white transition-colors">Terms of Service</Link></li>
                                </ul>
                            </div>
                            <div className="col-span-2 lg:col-span-1">
                                <h5 className="font-bold text-white mb-6 text-[16px] tracking-wide text-sm lg:text-base">Need Help?</h5>
                                <p className="text-[13px] text-slate-400 mb-6 max-w-xs mx-auto lg:mx-0">Contact our experts anytime. We are available 24/7.</p>

                                {store.whatsapp_number && (
                                    <a href={`https://wa.me/91${store.whatsapp_number.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer"
                                        className="w-full max-w-[220px] mx-auto lg:mx-0 flex items-center justify-center gap-2 bg-[#25D366] text-white font-bold h-11 rounded hover:bg-green-600 transition shadow-[0_4px_15px_rgba(37,211,102,0.2)] hover:shadow-[0_6px_20px_rgba(37,211,102,0.3)] active:scale-95 text-[14px]">
                                        <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" /></svg>
                                        <span>WhatsApp Support</span>
                                    </a>
                                )}
                                {store.phone_number && (
                                    <div className="flex items-center justify-center lg:justify-start gap-3 mt-5 text-slate-300">
                                        <Truck size={18} className="text-slate-500" />
                                        <span className="font-medium text-sm">+91 {store.phone_number.replace(/\D/g, '')}</span>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="mt-16 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-slate-500 font-medium">
                            &copy; {new Date().getFullYear()} {store.name} Store. All rights reserved.
                        </p>
                        <div className="flex gap-2">
                            <div className="w-8 h-5 bg-slate-800 rounded"></div>
                            <div className="w-8 h-5 bg-slate-800 rounded"></div>
                            <div className="w-8 h-5 bg-slate-800 rounded"></div>
                            <div className="w-8 h-5 bg-slate-800 rounded"></div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Mobile Bottom Nav */}
            <MobileBottomNav storeSlug={store.slug} />
        </div>
    )
}
