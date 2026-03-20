import Link from 'next/link'
import Image from 'next/image'
import {
    ArrowRight, Store, Smartphone, BarChart3, Globe, ShieldCheck,
    Truck, Tag, Users, Clock, QrCode, CreditCard, LayoutDashboard, Menu, X, ChevronRight, CheckCircle,
    Star, Play, Zap, Target, Award, Heart
} from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gradient-to-br from-slate-50 via-white to-blue-50 flex flex-col font-sans selection:bg-[#FF6F00] selection:text-white">

            {/* Navigation */}
            <nav className="bg-white/80 backdrop-blur-xl border-b border-gray-200/50 sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <Image
                            src="https://res.cloudinary.com/dtqohicc4/image/upload/v1774006506/ShaktiQR_Logo_crfnjq.png"
                            alt="ShaktiQR Logo"
                            width={160}
                            height={52}
                            className="h-12 w-auto object-contain"
                            priority
                        />
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-gray-700 hover:text-[#1A237E] font-semibold transition-all duration-300 hover:scale-105">How It Works</Link>
                        <Link href="#features" className="text-gray-700 hover:text-[#1A237E] font-semibold transition-all duration-300 hover:scale-105">Features</Link>
                        <Link href="#pricing" className="text-gray-700 hover:text-[#1A237E] font-semibold transition-all duration-300 hover:scale-105">Pricing</Link>
                        <div className="flex items-center gap-4 ml-6">
                            <Link
                                href="/auth/login"
                                className="border-2 border-[#1A237E] text-[#1A237E] px-6 py-2.5 rounded-full font-bold hover:bg-blue-50 transition-all duration-300 hover:shadow-lg"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/register?role=shopkeeper"
                                className="bg-gradient-to-r from-[#1A237E] to-[#3949AB] text-white px-6 py-2.5 rounded-full font-bold hover:shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:-translate-y-0.5"
                            >
                                Start Free Trial
                            </Link>
                        </div>
                    </div>
                    {/* Mobile Menu Actions */}
                    <div className="flex items-center gap-4 md:hidden">
                        <Link href="/auth/login" className="text-[#1A237E] font-bold text-sm">
                            Login
                        </Link>
                        <button className="text-gray-900 focus:outline-none p-2 hover:bg-gray-100 rounded-lg transition-colors">
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECTION 1 â€” HERO */}
            <section className="relative overflow-hidden bg-gradient-to-br from-[#1A237E] via-[#3949AB] to-[#5E35B1] text-white pt-24 pb-40">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-[#FF6F00]/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-blue-400/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-purple-400/10 rounded-full blur-2xl animate-spin" style={{animationDuration: '20s'}}></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid lg:grid-cols-2 gap-12 items-center">
                        <div className="text-center lg:text-left">
                            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-sm font-medium mb-6 border border-white/20">
                                <Zap size={16} className="text-[#FF6F00]" />
                                <span>Transform Your Shop Online</span>
                            </div>
                            <h1 className="text-5xl md:text-7xl font-black tracking-tight mb-8 leading-tight">
                                Turn Every Tourist Into a
                                <span className="block text-[#FF6F00] relative">
                                    Repeat Customer
                                    <svg className="absolute w-full h-4 -bottom-2 left-0 text-[#FF6F00]/30" viewBox="0 0 100 12" preserveAspectRatio="none">
                                        <path d="M0 6 Q 50 12 100 6" stroke="currentColor" strokeWidth="3" fill="none" />
                                    </svg>
                                </span>
                            </h1>
                            <p className="text-xl md:text-2xl text-blue-100 max-w-2xl mb-10 leading-relaxed">
                                Give your shop a digital identity. One QR code. Your own online store. Delivery anywhere in India.
                            </p>

                            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start mb-8">
                                <Link
                                    href="/auth/register?role=shopkeeper"
                                    className="group flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] text-white px-8 py-4 rounded-2xl text-lg font-bold hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1"
                                >
                                    Start Free Trial <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                                <Link
                                    href="#how-it-works"
                                    className="group flex items-center justify-center gap-3 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 px-8 py-4 rounded-2xl text-lg font-bold hover:bg-white/20 transition-all duration-300"
                                >
                                    <Play size={20} className="group-hover:scale-110 transition-transform" />
                                    See How It Works
                                </Link>
                            </div>

                            <div className="text-blue-200 text-lg">
                                Already have an account? <Link href="/auth/login" className="text-white font-bold hover:underline transition-colors">Login here &rarr;</Link>
                            </div>
                        </div>

                        <div className="relative">
                            {/* Mockup of mobile app */}
                            <div className="relative mx-auto w-80 h-[600px] bg-gradient-to-br from-gray-900 to-gray-800 rounded-[3rem] shadow-2xl border-8 border-gray-700 overflow-hidden">
                                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 w-20 h-6 bg-gray-700 rounded-full"></div>
                                <div className="p-6 pt-12 h-full bg-gradient-to-b from-blue-50 to-white">
                                    <div className="text-center mb-6">
                                        <div className="w-16 h-16 bg-gradient-to-r from-[#1A237E] to-[#3949AB] rounded-2xl mx-auto mb-4 flex items-center justify-center">
                                            <Store size={32} className="text-white" />
                                        </div>
                                        <h3 className="font-bold text-gray-900">ShaktiQR Store</h3>
                                        <p className="text-sm text-gray-600">Your Online Shop</p>
                                    </div>
                                    <div className="space-y-4">
                                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                                                    <Tag size={20} className="text-red-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">Handicraft Item</p>
                                                    <p className="text-sm text-gray-600">â‚¹299</p>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-white p-4 rounded-xl shadow-sm border">
                                            <div className="flex items-center gap-3">
                                                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                                                    <QrCode size={20} className="text-blue-500" />
                                                </div>
                                                <div>
                                                    <p className="font-semibold text-gray-900">QR Code Access</p>
                                                    <p className="text-sm text-gray-600">Scan to Shop</p>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <CheckCircle size={24} className="text-[#FF6F00] mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">15 Day Free Trial</h3>
                            <p className="text-blue-100 text-sm">No credit card required</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <Target size={24} className="text-[#FF6F00] mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">No Technical Skills</h3>
                            <p className="text-blue-100 text-sm">Setup in 5 minutes</p>
                        </div>
                        <div className="bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20">
                            <Award size={24} className="text-[#FF6F00] mx-auto mb-3" />
                            <h3 className="font-bold text-white mb-2">Zero Commission</h3>
                            <p className="text-blue-100 text-sm">Keep 100% of sales</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2 â€” PROBLEM (Pain Points) */}
            <section className="py-24 bg-white relative">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">The Problem Every Shopkeeper Faces</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Tourists visit your shop, love your products, but can't reorder once they leave. Sound familiar?</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] mx-auto rounded-full mt-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="group bg-gradient-to-br from-red-50 to-red-100 p-8 rounded-3xl hover:shadow-2xl hover:shadow-red-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-red-200/50">
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">ðŸ˜”</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Tourist Leaves, Sale Ends</h3>
                            <p className="text-gray-700 leading-relaxed">Customers love your products but can't reorder once they go home.</p>
                        </div>
                        <div className="group bg-gradient-to-br from-blue-50 to-blue-100 p-8 rounded-3xl hover:shadow-2xl hover:shadow-blue-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-blue-200/50">
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">ðŸ“±</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">WhatsApp is Not a Shop</h3>
                            <p className="text-gray-700 leading-relaxed">Managing catalog photos and orders on WhatsApp is chaotic and unprofessional.</p>
                        </div>
                        <div className="group bg-gradient-to-br from-purple-50 to-purple-100 p-8 rounded-3xl hover:shadow-2xl hover:shadow-purple-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-purple-200/50">
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">ðŸ”—</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">No Online Presence</h3>
                            <p className="text-gray-700 leading-relaxed">You post on Instagram but customers can't actually buy directly from you.</p>
                        </div>
                        <div className="group bg-gradient-to-br from-green-50 to-green-100 p-8 rounded-3xl hover:shadow-2xl hover:shadow-green-500/10 transition-all duration-300 transform hover:-translate-y-2 border border-green-200/50">
                            <div className="text-5xl mb-6 group-hover:scale-110 transition-transform duration-300">ðŸ’¸</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-3">Losing Repeat Business</h3>
                            <p className="text-gray-700 leading-relaxed">80% of tourists would reorder if they could simply find you again online.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3 â€” SOLUTION (How It Works) */}
            <section id="how-it-works" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">How ShaktiQR Works</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Simple as handing a visiting card. Powerful as your own e-commerce store.</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#3949AB] mx-auto rounded-full mt-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-24 left-[12.5%] w-[75%] h-0.5 bg-gradient-to-r from-[#1A237E] to-[#3949AB] z-0 opacity-30"></div>

                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-blue-500/25 group-hover:scale-110 transition-all duration-300 mb-6">
                                    ðŸª
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold text-sm">1</div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Setup Your Store</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">Add your products, photos, and store details in minutes with our guided setup.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-blue-500/25 group-hover:scale-110 transition-all duration-300 mb-6">
                                    ðŸ“²
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold text-sm">2</div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Get Your QR Card</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">Download your unique QR code and print it on your visiting card.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-blue-500/25 group-hover:scale-110 transition-all duration-300 mb-6">
                                    ðŸ¤
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-[#FF6F00] rounded-full flex items-center justify-center text-white font-bold text-sm">3</div>
                            </div>
                            <h3 className="text-2xl font-bold text-gray-900 mb-3">Give to Tourists</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">Hand the card to every customer who visits your physical shop.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center group">
                            <div className="relative">
                                <div className="w-32 h-32 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] rounded-full flex items-center justify-center text-6xl shadow-2xl shadow-orange-500/25 group-hover:scale-110 transition-all duration-300 mb-6">
                                    ðŸ“¦
                                </div>
                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-white rounded-full flex items-center justify-center text-[#FF6F00] font-bold text-sm border-2 border-[#FF6F00]">4</div>
                            </div>
                            <h3 className="text-2xl font-bold text-[#FF6F00] mb-3">Receive Orders Forever</h3>
                            <p className="text-gray-600 leading-relaxed max-w-xs">Customers scan, shop, and you deliver anywhere in India. Repeat business forever.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4 â€” FEATURES */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Everything Your Shop Needs</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">Powerful tools designed specifically for tourist shopkeepers. No technical skills required.</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#3949AB] mx-auto rounded-full mt-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <FeatureCard
                            icon={<Store className="text-[#1A237E]" />}
                            title="Your Own Online Store"
                            desc="Branded storefront with your logo, colors and products. Mobile-first design that works perfectly on phones."
                            gradient="from-blue-50 to-blue-100"
                            border="border-blue-200"
                        />
                        <FeatureCard
                            icon={<QrCode className="text-[#FF6F00]" />}
                            title="QR Visiting Card"
                            desc="One scan opens your beautiful mobile shop instantly. No app download required."
                            gradient="from-orange-50 to-orange-100"
                            border="border-orange-200"
                        />
                        <FeatureCard
                            icon={<CreditCard className="text-green-600" />}
                            title="Accept Payments Online"
                            desc="Razorpay integration. Money goes directly to your account. COD option available."
                            gradient="from-green-50 to-green-100"
                            border="border-green-200"
                        />
                        <FeatureCard
                            icon={<ShieldCheck className="text-purple-600" />}
                            title="COD Support"
                            desc="Cash on delivery option for customers who prefer traditional payment methods."
                            gradient="from-purple-50 to-purple-100"
                            border="border-purple-200"
                        />
                        <FeatureCard
                            icon={<LayoutDashboard className="text-indigo-600" />}
                            title="Order Management"
                            desc="Track and manage all orders from one simple dashboard. Real-time notifications."
                            gradient="from-indigo-50 to-indigo-100"
                            border="border-indigo-200"
                        />
                        <FeatureCard
                            icon={<Users className="text-pink-600" />}
                            title="Customer CRM"
                            desc="Know your customers, their history and preferences. Build lasting relationships."
                            gradient="from-pink-50 to-pink-100"
                            border="border-pink-200"
                        />
                        <FeatureCard
                            icon={<Tag className="text-red-600" />}
                            title="Marketing Tools"
                            desc="Coupons, festival offers and WhatsApp reminders. Boost your sales effortlessly."
                            gradient="from-red-50 to-red-100"
                            border="border-red-200"
                        />
                        <FeatureCard
                            icon={<Truck className="text-teal-600" />}
                            title="Logistics Integration"
                            desc="Shiprocket & Delhivery ready. Ship anywhere in India with tracking."
                            gradient="from-teal-50 to-teal-100"
                            border="border-teal-200"
                        />
                        <FeatureCard
                            icon={<BarChart3 className="text-cyan-600" />}
                            title="Analytics & Reports"
                            desc="Know your best products and top customers instantly. Make data-driven decisions."
                            gradient="from-cyan-50 to-cyan-100"
                            border="border-cyan-200"
                        />
                        <FeatureCard
                            icon={<Smartphone className="text-violet-600" />}
                            title="Mobile First PWA"
                            desc="Customers can install your store directly on their phone home screen."
                            gradient="from-violet-50 to-violet-100"
                            border="border-violet-200"
                        />
                        <FeatureCard
                            icon={<Globe className="text-emerald-600" />}
                            title="Custom Domain"
                            desc="Connect your own domain name like rajeshhandicrafts.com for professional branding."
                            gradient="from-emerald-50 to-emerald-100"
                            border="border-emerald-200"
                        />
                        <FeatureCard
                            icon={<Menu className="text-amber-600" />}
                            title="Multi Category Catalog"
                            desc="Organize products in categories and subcategories with images. Easy navigation."
                            gradient="from-amber-50 to-amber-100"
                            border="border-amber-200"
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 5 â€” PRICING */}
            <section id="pricing" className="py-24 bg-gradient-to-br from-gray-50 to-blue-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Simple, Honest Pricing</h2>
                        <p className="text-xl text-gray-600 max-w-3xl mx-auto">No hidden charges. No commission. Just transparent pricing that works for your business.</p>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] mx-auto rounded-full mt-8"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-5xl mx-auto items-start">

                        {/* STARTER CARD */}
                        <div className="group bg-white rounded-3xl p-8 border-2 border-gray-200 shadow-lg hover:shadow-2xl hover:shadow-gray-500/10 transition-all duration-300 transform hover:-translate-y-2">
                            <div className="text-center mb-8">
                                <div className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">One Time Setup</div>
                                <div className="flex items-baseline justify-center gap-2 mb-6">
                                    <span className="text-6xl font-black text-gray-900">â‚¹9,999</span>
                                </div>
                                <p className="text-gray-600">Complete store setup + 15 day free trial</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700">Complete store setup</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700">QR code visiting card</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700">Unlimited products</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700">Payment gateway integration</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700">Logistics integration</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500 flex-shrink-0" size={20} /> <span className="text-gray-700 font-bold">15 day free trial included</span></li>
                            </ul>
                            <Link href="/auth/register?role=shopkeeper" className="block w-full text-center bg-gray-100 text-gray-900 py-4 rounded-2xl font-bold hover:bg-gray-200 transition-all duration-300 transform hover:scale-105">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* ANNUAL CARD (Highlighted) */}
                        <div className="group bg-gradient-to-br from-[#1A237E] to-[#3949AB] rounded-3xl p-8 border-2 border-blue-300 shadow-2xl shadow-blue-500/25 relative transform md:scale-105 z-10 hover:shadow-3xl hover:shadow-blue-500/30 transition-all duration-300">
                            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] text-white px-6 py-2 rounded-2xl text-sm font-bold shadow-lg">
                                Most Popular
                            </div>
                            <div className="text-center mb-8">
                                <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">After First Year</div>
                                <div className="flex items-baseline justify-center gap-2 mb-6">
                                    <span className="text-6xl font-black text-white">â‚¹6,999</span>
                                    <span className="text-blue-200 font-medium text-lg">/ year</span>
                                </div>
                                <p className="text-blue-100">Everything included + all future features</p>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">Everything in Starter</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">All new features included</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">Priority support</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">Marketing tools</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">Advanced CRM</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00] flex-shrink-0" size={20} /> <span className="text-gray-100">Custom domain support</span></li>
                            </ul>
                            <Link href="/auth/register?role=shopkeeper" className="block w-full text-center bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] text-white py-4 rounded-2xl font-bold hover:shadow-xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:scale-105">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <div className="text-center mt-12">
                        <p className="text-gray-600 font-medium max-w-lg mx-auto">
                            â‚¹9,999 one time + â‚¹6,999/year renewal. <br />
                            <span className="text-gray-900 font-bold text-lg">No commission on your sales. Ever.</span>
                        </p>
                    </div>
                </div>
            </section>

            {/* SECTION 6 â€” FAQ */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Frequently Asked Questions</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#1A237E] to-[#3949AB] mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-6">
                        <FaqItem q="Do I need technical knowledge?" a="No. If you can use WhatsApp, you can use ShaktiQR. Our team sets up everything for you in one visit to your shop." />
                        <FaqItem q="How do customers find my store?" a="Through the QR code on your visiting card. Customer scans it, your store opens instantly on their phone." />
                        <FaqItem q="Who handles payment and delivery?" a="You do, directly. We connect your own Razorpay account and logistics partner. Money goes straight to you. We never touch your money." />
                        <FaqItem q="What happens after 15 day trial?" a="Pay â‚¹9,999 one time to activate. Then â‚¹6,999 per year to continue. No surprise charges ever." />
                        <FaqItem q="Can customers order from another city?" a="Yes! That's the whole point. Tourist from Mumbai visits your Ambaji shop, goes home, orders again. You ship to their home. Repeat business forever." />
                        <FaqItem q="What if I have many products?" a="No limit on products. Add as many as you want with multiple images, categories and subcategories." />
                        <FaqItem q="Is my store data safe?" a="Yes. Your store, your customers, your data. We never share or sell your customer information." />
                        <FaqItem q="Do you take commission on sales?" a="Never. Zero commission. You keep 100% of every sale. We only charge the annual subscription fee." />
                    </div>
                </div>
            </section>

            {/* SECTION 7 â€” TESTIMONIALS */}
            <section className="py-24 bg-gradient-to-br from-gray-50 to-blue-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl md:text-5xl font-black text-gray-900 mb-6">Shopkeepers Love ShaktiQR</h2>
                        <div className="w-24 h-1 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Tourists from Mumbai and Delhi now order from me every month. My repeat sales increased 3x after using ShaktiQR."
                            name="Rajesh Patel"
                            shop="Rajesh Handicrafts"
                            loc="Ambaji, Gujarat"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="Setup was done in one visit. Now I get orders while I sleep. Best investment for my shop."
                            name="Priya Sharma"
                            shop="Priya Silk House"
                            loc="Varanasi, UP"
                            rating={5}
                        />
                        <TestimonialCard
                            quote="My customers scan the QR and order from home. I ship with Shiprocket. Very easy system."
                            name="Mohammed Ali"
                            shop="Ali Jewellers"
                            loc="Jaipur, Rajasthan"
                            rating={5}
                        />
                    </div>
                </div>
            </section>

            {/* SECTION 8 â€” CTA BANNER */}
            <section className="bg-gradient-to-r from-[#1A237E] via-[#3949AB] to-[#5E35B1] py-24 border-t-4 border-[#FF6F00]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <div className="mb-8">
                        <Heart size={48} className="text-[#FF6F00] mx-auto mb-4" />
                    </div>
                    <h2 className="text-4xl md:text-6xl font-black text-white mb-6">Ready to Get Your First Online Order?</h2>
                    <p className="text-xl text-blue-200 mb-10 max-w-2xl mx-auto">Join 500+ tourist shopkeepers already using ShaktiQR. Start your free trial today.</p>

                    <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
                        <Link
                            href="/auth/register?role=shopkeeper"
                            className="inline-flex items-center justify-center gap-3 bg-gradient-to-r from-[#FF6F00] to-[#FF8F00] text-white px-10 py-5 rounded-2xl text-xl font-bold hover:shadow-2xl hover:shadow-orange-500/25 transition-all duration-300 transform hover:-translate-y-1"
                        >
                            Start Your Free Trial Today <ArrowRight size={24} />
                        </Link>
                    </div>
                    <p className="text-sm text-blue-300 font-medium">15 days free. No credit card needed. Cancel anytime.</p>
                </div>
            </section>

            {/* SECTION 9 â€” FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <Image
                            src="https://res.cloudinary.com/dtqohicc4/image/upload/v1774006506/ShaktiQR_Logo_crfnjq.png"
                            alt="ShaktiQR Logo"
                            width={140}
                            height={46}
                            className="h-10 w-auto object-contain brightness-0 invert"
                        />
                        <p className="text-sm text-center md:text-left">Empowering Local Indian Retailers with Digital Solutions.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
                        <Link href="#" className="hover:text-white transition-colors">About Us</Link>
                        <Link href="#pricing" className="hover:text-white transition-colors">Pricing</Link>
                        <Link href="#" className="hover:text-white transition-colors">Contact</Link>
                        <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
                    </div>

                    <div className="flex gap-4">
                        <a href="#" className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-[#FF6F00] hover:text-white transition-all duration-300 hover:scale-110">IG</a>
                        <a href="#" className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-[#1A237E] hover:text-white transition-all duration-300 hover:scale-110">FB</a>
                        <a href="#" className="w-12 h-12 rounded-2xl bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all duration-300 hover:scale-110">WA</a>
                    </div>
                </div>
                <div className="text-center text-sm mt-12 pt-8 border-t border-gray-800 max-w-7xl mx-auto px-4">
                    Â© 2026 ShaktiQR. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

function FeatureCard({ icon, title, desc, gradient, border }: { icon: React.ReactNode, title: string, desc: string, gradient: string, border: string }) {
    return (
        <div className={`group bg-gradient-to-br ${gradient} p-8 rounded-3xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border ${border} hover:border-opacity-50`}>
            <div className={`w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-all duration-300`}>
                {icon}
            </div>
            <h4 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-[#1A237E] transition-colors">{title}</h4>
            <p className="text-gray-700 leading-relaxed">{desc}</p>
        </div>
    )
}

function TestimonialCard({ quote, name, shop, loc, rating }: { quote: string, name: string, shop: string, loc: string, rating: number }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-lg border border-gray-100 flex flex-col h-full hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1">
            <div className="flex text-yellow-400 mb-6">
                {[...Array(rating)].map((_, i) => (
                    <Star key={i} size={20} fill="currentColor" />
                ))}
            </div>
            <p className="text-gray-700 italic flex-grow mb-6 leading-relaxed text-lg">"{quote}"</p>
            <div>
                <div className="font-bold text-gray-900 text-lg">{name}</div>
                <div className="text-sm font-medium text-[#1A237E]">{shop}</div>
                <div className="text-xs text-gray-500">{loc}</div>
            </div>
        </div>
    )
}

function FaqItem({ q, a }: { q: string, a: string }) {
    return (
        <details className="group bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-200 open:bg-white open:shadow-xl transition-all duration-300 hover:shadow-lg">
            <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900 hover:text-[#1A237E] transition-colors">
                {q}
                <span className="relative ml-1.5 h-6 w-6 flex-shrink-0">
                    <ChevronRight className="absolute inset-0 h-6 w-6 opacity-100 transition-transform duration-300 group-open:rotate-90 group-open:text-[#FF6F00]" />
                </span>
            </summary>
            <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                {a}
            </div>
        </details>
    )
}
