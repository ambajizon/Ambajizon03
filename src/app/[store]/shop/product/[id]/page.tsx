import { getStoreBySlug, getProductById } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import StoreHeader from '@/components/storefront/StoreHeader'
import Image from 'next/image'
import { Check, ShieldCheck, ArrowLeft, Truck, CreditCard, Zap, TrendingUp, ChevronRight, Minus, Plus } from 'lucide-react'
import AddToCartButton from '@/components/storefront/AddToCartButton'
import ShareButton from '@/components/storefront/ShareButton'
import WishlistButton from '@/components/storefront/WishlistButton'
import ExpandableText from '@/components/storefront/ExpandableText'
import Link from 'next/link'
import { Badge } from '@/components/ui/Badge'

export default async function ProductDetailPage({ params }: { params: { store: string, id: string } }) {
    const store = await getStoreBySlug(params.store)
    const product = await getProductById(params.id)

    if (!store || !product) notFound()

    const discount = product.mrp ? Math.round(((product.mrp - product.price) / product.mrp) * 100) : 0
    const badgeKey = product.badge?.toLowerCase() || 'none'
    const badgeType = ['new', 'hot', 'sale', 'limited', 'bestseller', 'trending'].includes(badgeKey) ? (
        badgeKey === 'bestseller' ? 'success' : 'error'
    ) : 'primary'

    return (
        <div className="bg-white min-h-screen pb-32">
            {/* Desktop StoreHeader */}
            <div className="hidden md:block">
                <StoreHeader
                    storeId={store.id}
                    storeName={store.name}
                    storeSlug={store.slug}
                    logoUrl={store.logo_url}
                    showBack={true}
                />
            </div>

            <main className="max-w-[1400px] mx-auto w-full md:px-6 lg:px-8 mt-4 md:mt-8 pb-32">
                <div className="bg-white md:rounded-[32px] lg:rounded-3xl md:shadow-card lg:shadow-none overflow-hidden border border-gray-100/0 md:border-gray-100 lg:border-none flex flex-col md:flex-row lg:grid lg:grid-cols-2 lg:gap-16 min-h-[600px] lg:items-start">

                    {/* LEFT COLUMN: Image Gallery */}
                    <div className="w-full md:w-1/2 lg:w-full bg-gray-50/50 relative md:border-r border-gray-100 lg:border-none shrink-0 lg:sticky lg:top-[140px]">
                        {/* Mobile Floating Top Bar Over Image */}
                        <div className="md:hidden absolute top-0 left-0 right-0 z-50 flex justify-between items-center p-4">
                            <Link href={`/${store.slug}/shop`} className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center text-gray-900 active:scale-95 transition">
                                <ArrowLeft size={22} />
                            </Link>
                            <ShareButton
                                title={product.name}
                                text={product.description || `Check out ${product.name} at ${store.name}`}
                                url={`https://ambajizon.in/${params.store}/shop/product/${product.id}`}
                                className="w-10 h-10 bg-white/80 backdrop-blur-md shadow-sm rounded-full flex items-center justify-center active:scale-95 transition"
                                iconClassName="text-gray-900"
                            />
                        </div>

                        {/* Main Image Slider */}
                        <div className="w-full aspect-[4/3] md:aspect-auto md:h-[600px] lg:h-[560px] lg:aspect-square relative overflow-hidden group lg:rounded-2xl lg:border lg:border-gray-100 bg-white">
                            {product.images && product.images.length > 0 ? (
                                <div className="flex overflow-x-auto snap-x snap-mandatory scrollbar-hide h-full w-full custom-scroll scroll-smooth">
                                    {product.images.map((img: string, i: number) => (
                                        <div key={i} id={`product-img-${i}`} className="flex-shrink-0 w-full h-full relative snap-center">
                                            <Image src={img} alt={product.name} fill className="object-cover lg:object-contain transition-transform duration-700 md:group-hover:scale-105" priority={i === 0} />
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-gray-400 bg-gray-100/80 font-medium">No Image</div>
                            )}

                            {/* Mobile Gallery Dots Indicators */}
                            {product.images && product.images.length > 1 && (
                                <div className="absolute bottom-4 md:bottom-6 left-0 right-0 flex lg:hidden justify-center gap-1.5 z-10">
                                    {product.images.map((_: string, i: number) => (
                                        <div key={i} className={`h-1.5 md:h-2 rounded-full transition-all duration-300 ${i === 0 ? 'w-5 md:w-6 bg-gray-900 shadow-sm' : 'w-1.5 md:w-2 bg-gray-400/50 hover:bg-gray-400'}`} />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* Desktop Thumbnails */}
                        {product.images && product.images.length > 1 && (
                            <div className="hidden lg:grid grid-cols-5 gap-3 mt-4">
                                {product.images.map((img: string, i: number) => (
                                    <a href={`#product-img-${i}`} key={i} className="aspect-square relative rounded-lg border-2 border-transparent hover:border-primary overflow-hidden bg-white shadow-sm transition-all focus:border-primary">
                                        <Image src={img} alt={`${product.name} thumbnail ${i + 1}`} fill className="object-cover" />
                                    </a>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* RIGHT COLUMN: Content Area */}
                    <div className="w-full md:w-1/2 lg:w-full flex flex-col pt-6 md:pt-10 px-5 md:px-10 lg:px-0 pb-10">
                        {/* Top Context row (Desktop) */}
                        <div className="hidden lg:flex justify-between items-center mb-8">
                            <div className="text-[13px] font-medium text-rt-muted flex items-center gap-2">
                                <Link href={`/${store.slug}/shop`} className="hover:text-rt-primary transition-colors">Home</Link>
                                <span className="text-gray-300">/</span>
                                <span className="text-rt-text font-semibold truncate max-w-[200px]">{product.name}</span>
                            </div>

                            <ShareButton
                                title={product.name}
                                text={product.description || `Check out ${product.name} at ${store.name}`}
                                url={`https://ambajizon.in/${params.store}/shop/product/${product.id}`}
                                className="w-11 h-11 bg-sf-surface hover:bg-gray-50 border border-gray-100 shadow-sm rounded-full flex items-center justify-center transition-all active:scale-95"
                                iconClassName="text-sf-muted hover:text-sf-dark"
                            />
                        </div>

                        {/* Mobile Back Button Context */}
                        <div className="hidden md:flex lg:hidden justify-between items-center mb-6">
                            <Link href={`/${store.slug}/shop`} className="text-sm font-bold text-gray-500 hover:text-gray-900 flex items-center gap-1 transition-colors">
                                <ArrowLeft size={16} /> Back to shop
                            </Link>
                        </div>

                        {/* Brand pill */}
                        <div className="inline-flex items-center bg-amber-50 text-amber-800 text-[11px] font-semibold px-3 py-1 rounded-full border border-amber-200 mb-3">
                            {store.name}
                        </div>

                        {/* HOT Badge + Title */}
                        {badgeKey !== 'none' && (
                            <div className="mb-3">
                                <span className="inline-block bg-rt-sale text-white text-[11px] font-semibold px-3 py-1 rounded-full uppercase tracking-wide">
                                    {product.badge}
                                </span>
                            </div>
                        )}
                        <h1 className="text-[26px] md:text-[28px] font-bold text-rt-text leading-[1.3] mb-5">
                            {product.name}
                        </h1>

                        {/* Ratings Placeholder */}
                        <div className="flex items-center gap-2 mb-6">
                            <div className="flex items-center text-[#FF9900]">
                                {[1, 2, 3, 4].map(i => (
                                    <svg key={i} className="w-4 h-4 fill-current" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                                ))}
                                <svg className="w-4 h-4 fill-[#E9ECEF]" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            </div>
                            <span className="text-[14px] text-gray-500 font-medium">4.5 (24 ratings)</span>
                        </div>

                        {/* Price Row */}
                        <div className="flex flex-col gap-3 mb-8 py-6 border-t border-b border-rt-border">
                            <div className="flex items-baseline gap-3">
                                <span className="text-[32px] font-extrabold text-rt-text tracking-tighter leading-none">₹{product.price.toLocaleString()}</span>
                                {product.mrp && product.mrp > product.price && (
                                    <span className="text-[18px] text-gray-400 line-through font-normal leading-none">₹{product.mrp.toLocaleString()}</span>
                                )}
                            </div>
                            {product.mrp && product.mrp > product.price && (
                                <div className="inline-flex items-center bg-[#DCFCE7] text-[#15803D] px-3 py-1 rounded-full w-fit">
                                    <span className="text-[12px] font-semibold">SAVE {discount}% TODAY</span>
                                </div>
                            )}
                        </div>

                        {/* Mobile Description (Hidden on Desktop) */}
                        <div className="mb-8 lg:hidden">
                            <h3 className="font-black text-[16px] md:text-[18px] text-gray-900 mb-3 border-b border-gray-100 pb-2">About this item</h3>
                            <div className="text-[15px] md:text-[16px] text-gray-700 leading-relaxed font-medium md:leading-[1.7]">
                                <ExpandableText text={product.description || 'No description available for this product.'} />
                            </div>
                        </div>

                        {/* Dispatch Status */}
                        <div className="flex items-center gap-2.5 text-[14px] font-semibold px-4 py-2.5 bg-[#F0FDF4] text-[#15803D] w-fit rounded-[8px] border border-[#BBF7D0] mb-6">
                            {product.stock > 0 ? (
                                <>
                                    <div className="w-2 h-2 rounded-full bg-[#15803D] animate-pulse shrink-0" />
                                    <span>Ready for Instant Dispatch</span>
                                </>
                            ) : (
                                <span className="text-rt-sale">Out of Stock</span>
                            )}
                        </div>

                        {/* Qty + Add to Cart */}
                        <div className="hidden md:flex flex-col gap-3 mb-6">
                            <div className="flex items-center gap-3">
                                <div className="h-12 border border-rt-border rounded-[10px] flex items-center justify-between px-2 font-semibold shadow-sm min-w-[120px]">
                                    <button className="w-9 h-9 flex items-center justify-center text-rt-muted hover:text-rt-text transition-colors rounded-lg hover:bg-rt-surface"><Minus size={16} /></button>
                                    <span className="text-[18px] font-semibold text-rt-text px-3">1</span>
                                    <button className="w-9 h-9 flex items-center justify-center text-rt-muted hover:text-rt-text transition-colors rounded-lg hover:bg-rt-surface"><Plus size={16} /></button>
                                </div>
                                <div className="flex-1 h-[52px]">
                                    <AddToCartButton
                                        storeSlug={store.slug}
                                        storeId={store.id}
                                        productId={product.id}
                                        stock={product.stock}
                                        large={true}
                                    />
                                </div>
                            </div>
                            <div className="w-full h-[48px]">
                                <AddToCartButton
                                    storeSlug={store.slug}
                                    storeId={store.id}
                                    productId={product.id}
                                    stock={product.stock}
                                    large={true}
                                    buyNow={true}
                                />
                            </div>
                        </div>

                        {/* Desktop Trust Bar Content (Premium layout) */}
                        <div className="hidden lg:grid grid-cols-2 gap-x-8 gap-y-6 mt-10 pt-10 border-t border-sf-border">
                            {[
                                { icon: <ShieldCheck size={24} className="text-amber-600" />, bg: 'bg-amber-50', title: 'Genuine Items', desc: '100% Quality Guaranteed' },
                                { icon: <Truck size={24} className="text-emerald-600" />, bg: 'bg-emerald-50', title: 'Express Shipping', desc: 'Fast safe delivery to door' },
                                { icon: <CreditCard size={24} className="text-blue-600" />, bg: 'bg-blue-50', title: 'Secure Checkout', desc: 'Encrypted safe payments' },
                                { icon: <Zap size={24} className="text-orange-600" />, bg: 'bg-orange-50', title: 'Easy Returns', desc: '7 days return policy' },
                            ].map((item, idx) => (
                                <div key={idx} className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl ${item.bg} flex items-center justify-center shrink-0 shadow-sm border border-black/5`}>
                                        {item.icon}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-[13px] font-bold text-sf-dark leading-none pb-1">{item.title}</span>
                                        <span className="text-[12px] text-sf-muted">{item.desc}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Mobile Trust Badges */}
                        <div className="lg:hidden grid grid-cols-2 gap-3 md:gap-4 mb-8">
                            <div className="flex flex-col md:flex-row items-center md:justify-start justify-center gap-3 text-[13px] md:text-[14px] text-gray-700 bg-emerald-50/50 p-4 md:p-5 rounded-2xl border border-emerald-100 shadow-sm text-center md:text-left">
                                <ShieldCheck className="text-emerald-500 shrink-0 md:w-7 md:h-7" size={24} strokeWidth={2.5} />
                                <span className="font-black text-emerald-900 leading-tight">Secure checkout</span>
                            </div>
                            {product.stock > 0 ? (
                                <div className="flex flex-col md:flex-row items-center md:justify-start justify-center gap-3 text-[13px] md:text-[14px] text-gray-700 bg-blue-50/50 p-4 md:p-5 rounded-2xl border border-blue-100 shadow-sm text-center md:text-left">
                                    <Check className="text-blue-500 shrink-0 md:w-7 md:h-7" size={24} strokeWidth={2.5} />
                                    <span className="font-black text-blue-900 leading-tight">In Stock & Ready</span>
                                </div>
                            ) : (
                                <div className="flex flex-col md:flex-row items-center md:justify-start justify-center gap-3 text-[13px] md:text-[14px] text-gray-700 bg-red-50/50 p-4 md:p-5 rounded-2xl border border-red-100 shadow-sm text-center md:text-left">
                                    <div className="w-6 h-6 rounded-full bg-error flex items-center justify-center shrink-0">
                                        <div className="w-3 h-0.5 bg-white rounded-full"></div>
                                    </div>
                                    <span className="font-black text-error leading-tight">Out of Stock</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* BELOW FOLD (Desktop Only) */}
                <div className="hidden lg:block mt-24">
                    <div className="grid grid-cols-1 md:grid-cols-[2fr_1fr] gap-12">
                        {/* Description */}
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Product Description</h3>
                            <div className="prose prose-gray max-w-none text-gray-600">
                                {product.description ? (
                                    <div dangerouslySetInnerHTML={{ __html: product.description.replace(/\n/g, '<br/>') }} />
                                ) : (
                                    <p>No detailed description provided by the seller.</p>
                                )}
                            </div>
                        </div>

                        {/* Reviews Placeholder */}
                        <div>
                            <h3 className="text-2xl font-black text-gray-900 mb-6 pb-4 border-b border-gray-100">Customer Reviews</h3>
                            <div className="bg-gray-50 rounded-2xl p-8 text-center border border-gray-100">
                                <div className="text-5xl mb-4">⭐</div>
                                <h4 className="font-bold text-gray-900 text-lg mb-2">No reviews yet</h4>
                                <p className="text-gray-500 text-sm">Be the first to review this product!</p>
                            </div>
                        </div>
                    </div>

                    {/* Related Products Placeholder */}
                    <div className="mt-24">
                        <div className="flex items-end justify-between mb-8 border-b border-sf-border pb-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-orange-50 flex items-center justify-center">
                                    <TrendingUp size={22} className="text-orange-500" />
                                </div>
                                <div>
                                    <h3 className="text-2xl md:text-3xl font-black text-sf-dark tracking-tight font-display">You might also like</h3>
                                    <p className="text-[14px] text-sf-muted font-medium mt-0.5">Customers also viewed these products</p>
                                </div>
                            </div>
                            <Link href={`/${store.slug}/shop`} className="text-[15px] font-bold text-sf-accent flex items-center hover:underline">
                                View store <ChevronRight size={18} />
                            </Link>
                        </div>
                        {/* Empty placeholder for grid to show intention */}
                        <div className="grid grid-cols-4 gap-6">
                            <div className="h-[300px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-col gap-2">
                                <span className="text-gray-400">Loading relation...</span>
                            </div>
                            <div className="h-[300px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-col gap-2">
                                <span className="text-gray-400">Loading relation...</span>
                            </div>
                            <div className="h-[300px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-col gap-2">
                                <span className="text-gray-400">Loading relation...</span>
                            </div>
                            <div className="h-[300px] rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-center flex-col gap-2">
                                <span className="text-gray-400">Loading relation...</span>
                            </div>
                        </div>
                    </div>
                </div>
            </main>

            {/* Mobile Sticky Bottom Bar (Only visible on small screens) */}
            <div className="md:hidden fixed bottom-[64px] left-0 right-0 bg-white/95 backdrop-blur-md border-t border-gray-100 p-3 px-5 flex items-center justify-between gap-4 z-50 shadow-[0_-10px_30px_-10px_rgba(0,0,0,0.15)] pb-safe">
                {/* Left side: Price summary & Wishlist */}
                <div className="flex items-center gap-4 shrink-0">
                    <div className="hidden min-[380px]:block">
                        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block leading-none mb-1">Total Price</span>
                        <span className="text-xl font-black text-gray-900 leading-none block tracking-tight">₹{product.price.toLocaleString()}</span>
                    </div>
                    <div className="w-12 h-12 bg-gray-50 border border-gray-200 rounded-full flex items-center justify-center shrink-0 shadow-inner active:scale-95 transition-transform group">
                        <WishlistButton storeId={store.id} productId={product.id} />
                    </div>
                </div>

                {/* Right side: Add to Cart & Buy Now */}
                <div className="flex-1 max-w-[280px] ml-auto h-12 flex gap-2">
                    <AddToCartButton
                        storeSlug={store.slug}
                        storeId={store.id}
                        productId={product.id}
                        stock={product.stock}
                        large={true}
                    />
                    <AddToCartButton
                        storeSlug={store.slug}
                        storeId={store.id}
                        productId={product.id}
                        stock={product.stock}
                        large={true}
                        buyNow={true}
                    />
                </div>
            </div>
        </div>
    )
}
