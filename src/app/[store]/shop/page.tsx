import { getStoreBySlug, getStoreCategories, getFeaturedProducts, getStoreOffers, getProductsBySection } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import StoreHeader from '@/components/storefront/StoreHeader'
import ProductCard from '@/components/storefront/ProductCard'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import BackToTopButton from '@/components/storefront/BackToTopButton'
import { Star, Package, ChevronRight, TrendingUp, ShieldCheck, Truck, CreditCard, Zap, Tag, Sparkles } from 'lucide-react'

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
    const heroBannerUrl = store.hero_image_url || themeConfig.hero_image_url || null
    const showExclusive = themeConfig.show_exclusive !== false
    const showFlashSale = themeConfig.show_flash_sale !== false
    const storeTagline = themeConfig.tagline || store.footer_text || 'Premium products curated just for you. Shop with confidence.'

    return (
        <div className="bg-white min-h-screen pb-24 md:pb-12">
            <StoreHeader
                storeId={store.id}
                storeName={store.name}
                storeSlug={store.slug}
                logoUrl={store.logo_url}
                showBack={false}
            />

            {/* ── HERO ─────────────────────────────────────────────── */}
            <section style={{ background: 'linear-gradient(135deg, #FFF5F0 0%, #FFFFFF 60%)' }}>
                <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 md:py-20 lg:py-24 grid grid-cols-1 md:grid-cols-[60fr_40fr] gap-10 md:gap-12 items-center">
                    {/* Left 60% */}
                    <div className="sf-fade-up text-center md:text-left space-y-5 order-2 md:order-1">
                        {/* Eyebrow badge */}
                        <div className="inline-flex items-center gap-2 bg-[#FFF5F0] text-rt-primary text-[13px] font-semibold px-4 py-1.5 rounded-full border border-[#E8400C]/20">
                            🎉 FREE Shipping on ₹499+
                        </div>

                        <h1 className="text-[40px] md:text-[52px] lg:text-[60px] font-extrabold leading-[1.08] tracking-tight text-rt-text">
                            {themeConfig.hero_title || 'Explore 500+\nToys for Every Age'}
                        </h1>

                        <p className="text-[16px] text-rt-muted leading-relaxed max-w-lg mx-auto md:mx-0 font-medium">
                            {themeConfig.hero_subtitle || 'Handmade · LEGO · Games · Wooden · Educational'}
                        </p>

                        <div className="flex flex-col sm:flex-row items-center gap-3 justify-center md:justify-start">
                            <Link
                                href={`/${store.slug}/shop/search`}
                                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-rt-primary text-white font-bold py-3.5 px-8 rounded-[10px] shadow-lg hover:bg-rt-primary-dark hover:-translate-y-0.5 transition-all active:scale-95 text-[16px]"
                            >
                                Shop Now <ChevronRight size={18} />
                            </Link>
                            <Link
                                href={`/${store.slug}/shop/search`}
                                className="text-rt-accent underline underline-offset-2 font-medium text-[14px] hover:text-blue-700 transition-colors"
                            >
                                View Today&apos;s Deals
                            </Link>
                        </div>

                        {/* Trust row */}
                        <div className="flex items-center gap-4 justify-center md:justify-start text-[13px] text-rt-muted font-medium flex-wrap pt-1">
                            <span className="flex items-center gap-1.5"><ShieldCheck size={14} className="text-rt-success shrink-0" /> {allProducts.length > 0 ? `${allProducts.length}+` : '9k+'} Products</span>
                            <span className="text-rt-border">|</span>
                            <span className="flex items-center gap-1.5"><Truck size={14} className="text-rt-primary shrink-0" /> Free Shipping ₹499+</span>
                            <span className="text-rt-border">|</span>
                            <span className="flex items-center gap-1.5"><Zap size={14} className="text-amber-500 shrink-0" /> 2-3 Day Delivery</span>
                        </div>
                    </div>

                    {/* Right 40%: hero image */}
                    <div className="relative order-1 md:order-2 flex items-center justify-center">
                        {heroBannerUrl ? (
                            <div className="relative w-full aspect-[4/3] max-w-md mx-auto">
                                <Image
                                    src={heroBannerUrl}
                                    alt={store.name}
                                    fill
                                    priority
                                    className="object-contain drop-shadow-2xl"
                                />
                            </div>
                        ) : (
                            <div className="w-full max-w-sm aspect-square rounded-3xl bg-gradient-to-br from-orange-50 to-amber-100 flex items-center justify-center mx-auto border border-orange-100">
                                <div className="grid grid-cols-2 gap-5 p-8">
                                    {['🚂', '🎯', '🧩', '🪀'].map((emoji, i) => (
                                        <div key={i} className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center text-4xl shadow-rt-card hover:shadow-rt-card-hover hover:-translate-y-1 transition-all cursor-default">
                                            {emoji}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            <main className="max-w-[1280px] mx-auto w-full pb-8 px-6 lg:px-8">

                {/* Festival Offer Banner */}
                {activeOffer && activeOffer.banner_url && (
                    <div className="w-full mt-8 md:mt-10">
                        <div className="relative rounded-2xl overflow-hidden h-[100px] md:h-[180px] bg-gray-200 shadow-rt-card group">
                            <Image
                                src={activeOffer.banner_url}
                                alt={activeOffer.title || 'Festival Offer'}
                                fill
                                className="object-cover transition-transform duration-700 group-hover:scale-105"
                                unoptimized={true}
                            />
                            <div className="absolute inset-0 bg-gradient-to-r from-gray-900/80 via-gray-900/30 to-transparent flex items-center p-6 md:p-12">
                                <h3 className="text-white font-bold text-xl md:text-4xl max-w-[70%] leading-tight drop-shadow-lg">
                                    {activeOffer.title}
                                </h3>
                            </div>
                        </div>
                    </div>
                )}

                {/* ── Categories ─────────────────────────────────────────── */}
                {categories.length > 0 && (
                    <section className="pt-10 md:pt-14">
                        <div className="flex items-center justify-between mb-6">
                            <div>
                                <h2 className="text-2xl font-bold text-rt-text">Shop by Category</h2>
                                <div className="mt-1 w-12 h-[3px] bg-rt-primary rounded-full" />
                                <p className="text-[14px] text-rt-muted mt-2">Explore 500+ toys by age, type or brand</p>
                            </div>
                            <Link href={`/${store.slug}/shop/search`} className="hidden md:flex items-center gap-1.5 text-rt-primary font-semibold text-[14px] hover:text-rt-primary-dark transition-colors">
                                View All <ChevronRight size={16} />
                            </Link>
                        </div>

                        {/* Category grid — rectangular cards */}
                        <div className="flex gap-3 md:grid md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 overflow-x-auto md:overflow-visible pb-4 md:pb-0 hide-scrollbar snap-x">
                            {/* All */}
                            <Link
                                href={`/${store.slug}/shop/search`}
                                className="flex-shrink-0 w-[130px] md:w-auto h-[90px] md:h-[100px] rounded-2xl bg-rt-primary text-white flex flex-col items-center justify-center gap-2 snap-start hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 group"
                            >
                                <Package size={24} className="text-white" strokeWidth={2.5} />
                                <span className="font-semibold text-[12px] uppercase tracking-wide">All Toys</span>
                            </Link>

                            {categories.map((cat: any, i: number) => {
                                const bgs = [
                                    'from-amber-100 to-yellow-50 shadow-amber-100',
                                    'from-blue-100 to-sky-50 shadow-blue-100',
                                    'from-pink-100 to-rose-50 shadow-pink-100',
                                    'from-emerald-100 to-green-50 shadow-emerald-100',
                                    'from-yellow-100 to-lime-50 shadow-yellow-100',
                                    'from-violet-100 to-purple-50 shadow-violet-100',
                                ]
                                const bg = bgs[i % bgs.length]
                                return (
                                    <Link
                                        key={cat.id}
                                        href={`/${store.slug}/shop/category/${cat.id}`}
                                        className={`flex-shrink-0 w-[130px] md:w-auto h-[90px] md:h-[100px] rounded-2xl bg-gradient-to-br ${bg} border border-rt-border flex flex-col items-center justify-center gap-2 snap-start hover:-translate-y-1 hover:shadow-lg transition-all active:scale-95 group`}
                                    >
                                        <div className="w-10 h-10 bg-white/70 rounded-xl overflow-hidden relative">
                                            {cat.image_url ? (
                                                <Image src={cat.image_url} alt={cat.name} fill className="object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-rt-text/50 font-bold text-sm">
                                                    {cat.name.substring(0, 2).toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <span className="font-semibold text-[12px] text-rt-text text-center line-clamp-1 truncate w-full px-2">{cat.name}</span>
                                    </Link>
                                )
                            })}
                        </div>
                    </section>
                )}

                {/* ── Flash Sale ────────────────────────────────────────────── */}
                {showFlashSale && flashSaleProducts.length > 0 && (
                    <section className="mt-10 md:mt-14 py-10 md:py-12 bg-rt-surface border-y border-rt-border overflow-hidden">
                        <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
                            <div className="flex items-center justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-2 mb-1">
                                        <Zap size={20} className="text-rt-primary" />
                                        <h2 className="text-2xl font-bold text-rt-text">Flash Sale</h2>
                                    </div>
                                    <div className="w-12 h-[3px] bg-rt-primary rounded-full" />
                                    <p className="text-[14px] text-rt-muted mt-2">Limited time premium deals</p>
                                </div>
                                <Link href={`/${store.slug}/shop/search`} className="text-[14px] font-semibold text-rt-primary flex items-center gap-1 hover:text-rt-primary-dark transition-colors">
                                    View All <ChevronRight size={16} />
                                </Link>
                            </div>
                            <div className="flex md:grid gap-4 overflow-x-auto md:overflow-visible pb-2 md:pb-0 scrollbar-hide snap-x md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
                                {flashSaleProducts.slice(0, 5).map((product: any, i: number) => (
                                    <div key={product.id} className="min-w-[200px] md:min-w-0 snap-start shrink-0">
                                        <ProductCard product={product} storeSlug={store.slug} index={i} />
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>
                )}

                {/* ── Exclusive Picks ───────────────────────────────────────── */}
                {showExclusive && exclusiveProducts.length > 0 && (
                    <section className="pt-10 md:pt-14">
                        <div className="flex items-end justify-between mb-6 pb-4">
                            <div>
                                <div className="flex items-center gap-2 mb-1">
                                    <Star size={20} className="text-amber-500 fill-amber-400" />
                                    <h2 className="text-2xl font-bold text-rt-text">Exclusive Picks</h2>
                                </div>
                                <div className="w-12 h-[3px] bg-rt-primary rounded-full" />
                                <p className="text-[14px] text-rt-muted mt-2">Curated specially for your childhood</p>
                            </div>
                            <Link href={`/${store.slug}/shop/search`} className="text-[14px] font-semibold text-rt-primary flex items-center gap-0.5 hover:text-rt-primary-dark transition-colors">
                                View all <ChevronRight size={17} />
                            </Link>
                        </div>
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 md:gap-5">
                            {exclusiveProducts.map((product: any, i: number) => (
                                <ProductCard key={product.id} product={product} storeSlug={store.slug} index={i} />
                            ))}
                        </div>
                    </section>
                )}

                {/* ── Promotional Banner ────────────────────────────────────── */}
                {allProducts.length > 0 && (
                    <div className="mt-10 md:mt-14 rounded-2xl overflow-hidden" style={{ background: 'linear-gradient(135deg, #E8400C 0%, #B52E08 100%)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 min-h-[160px] md:min-h-[200px]">
                            <div className="p-7 md:p-10 flex flex-col justify-center gap-4">
                                <span className="inline-block bg-white/20 text-white text-[11px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-full w-fit">
                                    🔥 Hot Deals
                                </span>
                                <h2 className="text-[28px] md:text-[34px] font-bold text-white leading-tight">
                                    Shop Smarter, <span className="text-yellow-200">Not Harder</span>
                                </h2>
                                <p className="text-orange-100 text-[14px] max-w-xs">
                                    Browse our latest arrivals — fresh styles added daily, just for you.
                                </p>
                                <Link href={`/${store.slug}/shop/search`}
                                    className="inline-flex items-center gap-2 bg-white text-rt-primary font-bold py-3 px-6 rounded-[10px] w-fit text-[14px] hover:bg-orange-50 transition-colors active:scale-95">
                                    Browse All <ChevronRight size={16} />
                                </Link>
                            </div>
                            {heroBannerUrl && (
                                <div className="hidden md:block relative overflow-hidden">
                                    <Image src={heroBannerUrl} alt="Promo" fill className="object-cover opacity-50" />
                                    <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse at right, transparent 40%, #B52E08 100%)' }} />
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* ── Just For You (all products) ───────────────────────────── */}
                <section className="pt-10 md:pt-14">
                    <div className="flex items-end justify-between mb-6 pb-4">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <TrendingUp size={20} className="text-rt-success" />
                                <h2 className="text-2xl font-bold text-rt-text">Just For You</h2>
                            </div>
                            <div className="w-12 h-[3px] bg-rt-primary rounded-full" />
                            <p className="text-[14px] text-rt-muted mt-2">Explore our entire world of play</p>
                        </div>
                    </div>

                    {allProducts.length > 0 ? (
                        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-4 lg:gap-5">
                            {allProducts.map((product: any, i: number) => (
                                <ProductCard key={product.id} product={product} storeSlug={store.slug} index={i} />
                            ))}
                        </div>
                    ) : (
                        <div className="py-20 text-center bg-rt-surface rounded-2xl border border-dashed border-rt-border">
                            <div className="text-5xl mb-4">🛍️</div>
                            <h3 className="text-[18px] font-bold text-rt-text mb-2">No products yet</h3>
                            <p className="text-[14px] text-rt-muted max-w-md mx-auto mb-6">
                                This store is getting ready. Check back soon for amazing products!
                            </p>
                            <Link href={`/${store.slug}/shop/search`}
                                className="inline-flex items-center gap-2 bg-rt-primary text-white font-bold py-3 px-6 rounded-[10px] text-sm hover:bg-rt-primary-dark transition-colors">
                                Browse All
                            </Link>
                        </div>
                    )}
                </section>
            </main>

            {/* ── Help Section ─────────────────────────────────────────────── */}
            <section className="bg-white border-y border-sf-border mt-10 md:mt-16 py-10 md:py-14">
                <div className="max-w-[1400px] mx-auto px-5 md:px-8 lg:px-12">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="text-center md:text-left space-y-3">
                            <h3 className="text-2xl font-black text-sf-dark font-display">Need Help Choosing?</h3>
                            <p className="text-sf-muted font-medium max-w-sm">Our toy experts are here to help you find the perfect gift for every age and occasion.</p>
                        </div>
                        <div className="flex items-center gap-4 flex-wrap justify-center">
                            {store.whatsapp_number && (
                                <a
                                    href={`https://wa.me/91${store.whatsapp_number.replace(/\D/g, '')}`}
                                    className="inline-flex items-center gap-3 bg-[#25D366] text-white font-bold py-4 px-8 rounded-2xl shadow-xl hover:-translate-y-1 transition-all active:scale-95"
                                >
                                    <Zap size={20} fill="white" />
                                    Chat with an Expert
                                </a>
                            )}
                            <Link href={`/${store.slug}/shop/search`} className="inline-flex items-center gap-2 font-bold text-sf-dark hover:underline">
                                Browse Catalog <ChevronRight size={18} />
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            <footer style={{ background: '#111827' }} className="border-t border-white/5 text-slate-50 pt-14 pb-10">
                <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-10 lg:gap-14 mb-12">
                        {/* Brand column */}
                        <div className="col-span-2 md:col-span-1 space-y-5">
                            <div className="flex items-center gap-3">
                                {store.logo_url ? (
                                    <div className="relative w-10 h-10 rounded-xl overflow-hidden bg-white/10 border border-white/10 shrink-0">
                                        <Image src={store.logo_url} alt={store.name} fill className="object-cover" />
                                    </div>
                                ) : (
                                    <div className="w-10 h-10 rounded-xl bg-rt-primary flex items-center justify-center text-lg font-bold text-white shrink-0">
                                        {store.name.charAt(0)}
                                    </div>
                                )}
                                <h4 className="font-bold text-xl text-white">{store.name}</h4>
                            </div>
                            <p className="text-[13px] text-slate-400 leading-relaxed">
                                {store.footer_text || 'Premium toys curated with love and delivered with care.'}
                            </p>
                            <div className="flex items-center gap-3">
                                {['fb', 'ig', 'tw'].map(s => (
                                    <div key={s} className="w-9 h-9 rounded-lg bg-white/5 border border-white/5 flex items-center justify-center text-slate-400 hover:text-white hover:bg-rt-primary/20 hover:border-rt-primary/30 transition-all cursor-pointer text-[11px] font-bold uppercase tracking-wide">
                                        {s}
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Store Discovery */}
                        <div>
                            <h5 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">Discover</h5>
                            <ul className="space-y-3">
                                {[
                                    { label: 'All Products', path: 'search' },
                                    { label: 'Our Story', path: 'our-story' },
                                    { label: 'Bulk Orders', path: 'bulk' },
                                    { label: 'Contact Us', path: 'contact' },
                                ].map(({ label, path }) => (
                                    <li key={path}>
                                        <Link href={`/${store.slug}/shop/${path}`}
                                            className="text-[13px] text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                            <div className="w-1 h-1 rounded-full bg-rt-primary scale-0 group-hover:scale-100 transition-transform" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Customer Care */}
                        <div>
                            <h5 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">Support</h5>
                            <ul className="space-y-3">
                                {[
                                    { label: 'Terms of Service', path: 'terms-conditions' },
                                    { label: 'Privacy Policy', path: 'privacy-policy' },
                                    { label: 'Shipping & Returns', path: 'returns-policy' },
                                    { label: 'Help Center', path: 'help' },
                                ].map(({ label, path }) => (
                                    <li key={path}>
                                        <Link href={`/${store.slug}/policies/${path}`}
                                            className="text-[13px] text-slate-400 hover:text-white transition-colors flex items-center gap-2 group">
                                            <div className="w-1 h-1 rounded-full bg-rt-primary scale-0 group-hover:scale-100 transition-transform" />
                                            {label}
                                        </Link>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {/* Contact / WhatsApp */}
                        <div>
                            <h5 className="text-[11px] font-semibold uppercase tracking-[0.15em] text-slate-500 mb-5">Contact</h5>
                            <p className="text-[13px] text-slate-400 mb-4 leading-relaxed">Need help? Chat with us on WhatsApp for quick support.</p>
                            {store.whatsapp_number && (
                                <a
                                    href={`https://wa.me/91${store.whatsapp_number.replace(/\D/g, '')}`}
                                    className="inline-flex items-center gap-2 bg-[#25D366] text-white font-semibold py-2.5 px-5 rounded-[10px] text-[13px] hover:bg-[#20B858] transition-colors active:scale-95"
                                >
                                    <Zap size={15} fill="white" /> Chat with Us
                                </a>
                            )}
                        </div>
                    </div>

                    {/* Bottom bar */}
                    <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                        <p className="text-[12px] text-slate-500">&copy; {new Date().getFullYear()} {store.name}. All rights reserved.</p>
                        <div className="flex gap-2">
                            {['UPI', 'Card', 'Net Banking', 'COD'].map(m => (
                                <div key={m} className="h-7 px-2.5 bg-white/5 border border-white/5 rounded-lg flex items-center justify-center text-[9px] font-bold tracking-widest text-slate-500 uppercase">
                                    {m}
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </footer>

            <BackToTopButton />
            <MobileBottomNav storeSlug={store.slug} />
        </div>
    )
}
