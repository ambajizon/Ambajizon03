import Link from 'next/link'
import {
    ArrowRight, Store, Smartphone, BarChart3, Globe, ShieldCheck,
    Truck, Tag, Users, Clock, QrCode, CreditCard, LayoutDashboard, Menu, X, ChevronRight, CheckCircle
} from 'lucide-react'

export default function LandingPage() {
    return (
        <div className="min-h-screen w-full overflow-x-hidden bg-gray-50 flex flex-col font-sans selection:bg-[#FF6F00] selection:text-white">

            {/* Navigation */}
            <nav className="border-b bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="bg-[#1A237E] p-2.5 rounded-xl text-white shadow-md">
                            <Store size={26} />
                        </div>
                        <span className="text-2xl font-bold tracking-tight text-[#1A237E]">Ambajizon</span>
                    </div>
                    {/* Desktop Menu */}
                    <div className="hidden md:flex items-center gap-8">
                        <Link href="#how-it-works" className="text-gray-600 hover:text-[#1A237E] font-medium transition">How It Works</Link>
                        <Link href="#features" className="text-gray-600 hover:text-[#1A237E] font-medium transition">Features</Link>
                        <Link href="#pricing" className="text-gray-600 hover:text-[#1A237E] font-medium transition">Pricing</Link>
                        <div className="flex items-center gap-4 ml-4">
                            <Link
                                href="/auth/login"
                                className="border-2 border-[#1A237E] text-[#1A237E] px-6 py-2 rounded-full font-bold hover:bg-blue-50 transition"
                            >
                                Login
                            </Link>
                            <Link
                                href="/auth/register?role=shopkeeper"
                                className="bg-[#1A237E] text-white px-6 py-2.5 rounded-full font-bold hover:bg-blue-900 transition shadow-lg shadow-blue-900/20"
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
                        <button className="text-gray-900 focus:outline-none p-1">
                            <Menu size={28} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* SECTION 1 — HERO */}
            <section className="relative overflow-hidden bg-[#1A237E] text-white pt-20 pb-32">
                {/* Decorative background circles */}
                <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 opacity-20">
                    <div className="absolute -top-[20%] -right-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-[#FF6F00] to-transparent blur-3xl"></div>
                    <div className="absolute -bottom-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-gradient-to-tr from-blue-400 to-transparent blur-3xl"></div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 flex flex-col items-center text-center">
                    <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight mb-6 leading-tight">
                        Turn Every Tourist Into a <br className="hidden md:block" />
                        <span className="text-[#FF6F00] relative inline-block">
                            Repeat Customer
                            <svg className="absolute w-full h-3 -bottom-1 left-0 text-[#FF6F00]/30" viewBox="0 0 100 10" preserveAspectRatio="none">
                                <path d="M0 5 Q 50 10 100 5" stroke="currentColor" strokeWidth="4" fill="none" />
                            </svg>
                        </span>
                    </h1>
                    <p className="text-xl md:text-2xl text-blue-100 max-w-3xl mb-10 leading-relaxed">
                        Give your shop a digital identity. One QR code. Your own online store. Delivery anywhere in India.
                    </p>

                    <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
                        <Link
                            href="/auth/register?role=shopkeeper"
                            className="flex items-center justify-center gap-2 bg-[#FF6F00] text-white px-8 py-4 rounded-full text-lg font-bold hover:bg-orange-600 transition shadow-xl shadow-orange-900/30 transform hover:-translate-y-1"
                        >
                            Start Free Trial <ArrowRight size={20} />
                        </Link>
                        <Link
                            href="#how-it-works"
                            className="flex items-center justify-center gap-2 bg-transparent text-white border-2 border-white/30 px-8 py-4 rounded-full text-lg font-bold hover:bg-white/10 transition"
                        >
                            See How It Works
                        </Link>
                    </div>

                    <div className="mt-8 text-blue-200 text-lg">
                        Already have an account? <Link href="/auth/login" className="text-white font-bold hover:underline transition">Login here &rarr;</Link>
                    </div>

                    <div className="mt-12 flex flex-col md:flex-row items-center justify-center gap-6 text-sm font-medium text-blue-200">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-[#FF6F00]" /> 15 Day Free Trial
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-[#FF6F00]" /> No Technical Skills Needed
                        </div>
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-[#FF6F00]" /> Setup in 5 Minutes
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 2 — PROBLEM (Pain Points) */}
            <section className="py-24 bg-white relative -mt-10 rounded-t-[3rem] z-20 shadow-xl">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Sound Familiar?</h2>
                        <div className="w-24 h-1 bg-[#FF6F00] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                        <div className="bg-gray-50 p-8 rounded-2xl hover:bg-red-50 transition border border-gray-100 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">😔</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Tourist Leaves, Sale Ends</h3>
                            <p className="text-gray-600">Customers love your products but can't reorder once they go home.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl hover:bg-blue-50 transition border border-gray-100 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">📱</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">WhatsApp is Not a Shop</h3>
                            <p className="text-gray-600">Managing catalog photos and orders on WhatsApp is chaotic and unprofessional.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl hover:bg-purple-50 transition border border-gray-100 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">🔗</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">No Online Presence</h3>
                            <p className="text-gray-600">You post on Instagram but customers can't actually buy directly from you.</p>
                        </div>
                        <div className="bg-gray-50 p-8 rounded-2xl hover:bg-green-50 transition border border-gray-100 group">
                            <div className="text-4xl mb-4 group-hover:scale-110 transition-transform">💸</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Losing Repeat Business</h3>
                            <p className="text-gray-600">80% of tourists would reorder if they could simply find you again online.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 3 — SOLUTION (How It Works) */}
            <section id="how-it-works" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">How ShopVCard Works</h2>
                        <p className="text-xl text-gray-600">Simple as handing a visiting card.</p>
                        <div className="w-24 h-1 bg-[#1A237E] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
                        {/* Connecting Line (Desktop only) */}
                        <div className="hidden md:block absolute top-12 left-[10%] w-[80%] h-0.5 bg-gray-200 z-0"></div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-gray-50 mb-6">🏪</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">1. Setup Your Store</h3>
                            <p className="text-gray-600">Add your products, photos, and store details in minutes.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-gray-50 mb-6">📲</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">2. Get Your QR Card</h3>
                            <p className="text-gray-600">Download your unique QR code and print it on your visiting card.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center text-5xl shadow-lg border-4 border-gray-50 mb-6">🤝</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">3. Give to Tourists</h3>
                            <p className="text-gray-600">Hand the card to every customer who visits your physical shop.</p>
                        </div>

                        <div className="relative z-10 flex flex-col items-center text-center">
                            <div className="w-24 h-24 bg-[#1A237E] rounded-full flex items-center justify-center text-5xl shadow-lg shadow-blue-900/40 border-4 border-gray-50 mb-6">📦</div>
                            <h3 className="text-xl font-bold text-[#1A237E] mb-2">4. Receive Orders Forever</h3>
                            <p className="text-gray-600">Customers scan, shop, and you deliver anywhere in India.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* SECTION 4 — FEATURES */}
            <section id="features" className="py-24 bg-white">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Everything Your Shop Needs</h2>
                        <p className="text-xl text-gray-600">Powerful tools, simple interface.</p>
                        <div className="w-24 h-1 bg-[#1A237E] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-12">
                        <FeatureBlock icon={<Store />} title="Your Own Online Store" desc="Branded storefront with your logo, colors and products." />
                        <FeatureBlock icon={<QrCode />} title="QR Visiting Card" desc="One scan opens your beautiful mobile shop instantly." />
                        <FeatureBlock icon={<CreditCard />} title="Accept Payments Online" desc="Razorpay, PayU integration. Money direct to your account." />

                        <FeatureBlock icon={<ShieldCheck />} title="COD Support" desc="Cash on delivery option for customers who prefer it." />
                        <FeatureBlock icon={<LayoutDashboard />} title="Order Management" desc="Track and manage all orders from one simple dashboard." />
                        <FeatureBlock icon={<Users />} title="Customer CRM" desc="Know your customers, their history and preferences." />

                        <FeatureBlock icon={<Tag />} title="Marketing Tools" desc="Coupons, festival offers and WhatsApp reminders." />
                        <FeatureBlock icon={<Truck />} title="Logistics Integration" desc="Shiprocket & Delhivery ready. Ship anywhere in India." />
                        <FeatureBlock icon={<BarChart3 />} title="Analytics & Reports" desc="Know your best products and top customers instantly." />

                        <FeatureBlock icon={<Smartphone />} title="Mobile First PWA" desc="Customers install your store directly on their phone home screen." />
                        <FeatureBlock icon={<Globe />} title="Custom Domain" desc="Connect your own domain name like rajeshhandicrafts.com." />
                        <FeatureBlock icon={<Menu />} title="Multi Category Catalog" desc="Organize products in categories and subcategories with images." />
                    </div>
                </div>
            </section>

            {/* SECTION 5 — PRICING */}
            <section id="pricing" className="py-24 bg-gray-50">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Simple, Honest Pricing</h2>
                        <p className="text-xl text-gray-600">No hidden charges. No commission.</p>
                        <div className="w-24 h-1 bg-[#FF6F00] mx-auto rounded-full mt-6"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto items-center">

                        {/* STARTER CARD */}
                        <div className="bg-white rounded-3xl p-8 border border-gray-200 shadow-sm relative">
                            <div className="text-sm font-bold text-[#1A237E] uppercase tracking-wider mb-2">One Time Setup</div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-extrabold text-gray-900">₹9,999</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="text-gray-700">Complete store setup</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="text-gray-700">QR code visiting card</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="text-gray-700">Unlimited products</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="text-gray-700">Payment gateway integration</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="text-gray-700">Logistics integration</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-green-500" size={20} /> <span className="font-bold text-gray-900">15 day free trial included</span></li>
                            </ul>
                            <Link href="/auth/register?role=shopkeeper" className="block w-full text-center bg-gray-100 text-gray-900 py-4 rounded-xl font-bold hover:bg-gray-200 transition">
                                Start Free Trial
                            </Link>
                        </div>

                        {/* ANNUAL CARD (Highlighted) */}
                        <div className="bg-[#1A237E] rounded-3xl p-8 border border-blue-800 shadow-2xl relative transform md:-scale-y-100 md:scale-y-100 md:scale-105 z-10">
                            <div className="absolute top-0 right-8 transform -translate-y-1/2 bg-[#FF6F00] text-white px-4 py-1 rounded-full text-sm font-bold shadow-lg">
                                Most Popular
                            </div>
                            <div className="text-sm font-bold text-blue-200 uppercase tracking-wider mb-2">After First Year</div>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-5xl font-extrabold text-white">₹6,999</span>
                                <span className="text-blue-200 font-medium">/ year</span>
                            </div>
                            <ul className="space-y-4 mb-8">
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">Everything in Starter</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">All new features included</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">Priority support</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">Marketing tools</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">Advanced CRM</span></li>
                                <li className="flex items-center gap-3"><CheckCircle className="text-[#FF6F00]" size={20} /> <span className="text-gray-100">Custom domain support</span></li>
                            </ul>
                            <Link href="/auth/register?role=shopkeeper" className="block w-full text-center bg-[#FF6F00] text-white py-4 rounded-xl font-bold hover:bg-orange-600 transition shadow-lg shadow-orange-900/20">
                                Get Started
                            </Link>
                        </div>
                    </div>

                    <p className="text-center text-gray-500 mt-10 font-medium max-w-lg mx-auto">
                        ₹9,999 one time + ₹6,999/year renewal. <br />
                        <span className="text-gray-900 font-bold">No commission on your sales. Ever.</span>
                    </p>
                </div>
            </section>

            {/* SECTION 6 — FAQ */}
            <section className="py-24 bg-white">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Frequently Asked Questions</h2>
                        <div className="w-24 h-1 bg-[#1A237E] mx-auto rounded-full"></div>
                    </div>

                    <div className="space-y-6">
                        <FaqItem q="Do I need technical knowledge?" a="No. If you can use WhatsApp, you can use ShopVCard. Our team sets up everything for you in one visit to your shop." />
                        <FaqItem q="How do customers find my store?" a="Through the QR code on your visiting card. Customer scans it, your store opens instantly on their phone." />
                        <FaqItem q="Who handles payment and delivery?" a="You do, directly. We connect your own Razorpay account and logistics partner. Money goes straight to you. We never touch your money." />
                        <FaqItem q="What happens after 15 day trial?" a="Pay ₹9,999 one time to activate. Then ₹6,999 per year to continue. No surprise charges ever." />
                        <FaqItem q="Can customers order from another city?" a="Yes! That's the whole point. Tourist from Mumbai visits your Ambaji shop, goes home, orders again. You ship to their home. Repeat business forever." />
                        <FaqItem q="What if I have many products?" a="No limit on products. Add as many as you want with multiple images, categories and subcategories." />
                        <FaqItem q="Is my store data safe?" a="Yes. Your store, your customers, your data. We never share or sell your customer information." />
                        <FaqItem q="Do you take commission on sales?" a="Never. Zero commission. You keep 100% of every sale. We only charge the annual subscription fee." />
                    </div>
                </div>
            </section>

            {/* SECTION 7 — TESTIMONIALS */}
            <section className="py-24 bg-gray-50 border-t border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold text-gray-900 mb-4">Shopkeepers Love ShopVCard</h2>
                        <div className="w-24 h-1 bg-[#FF6F00] mx-auto rounded-full"></div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <TestimonialCard
                            quote="Tourists from Mumbai and Delhi now order from me every month. My repeat sales increased 3x after using ShopVCard."
                            name="Rajesh Patel"
                            shop="Rajesh Handicrafts"
                            loc="Ambaji, Gujarat"
                        />
                        <TestimonialCard
                            quote="Setup was done in one visit. Now I get orders while I sleep. Best investment for my shop."
                            name="Priya Sharma"
                            shop="Priya Silk House"
                            loc="Varanasi, UP"
                        />
                        <TestimonialCard
                            quote="My customers scan the QR and order from home. I ship with Shiprocket. Very easy system."
                            name="Mohammed Ali"
                            shop="Ali Jewellers"
                            loc="Jaipur, Rajasthan"
                        />
                    </div>
                </div>
            </section>


            {/* SECTION 8 — CTA BANNER */}
            <section className="bg-[#1A237E] py-20 border-t-4 border-[#FF6F00]">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                    <h2 className="text-4xl md:text-5xl font-extrabold text-white mb-6">Ready to Get Your First Online Order?</h2>
                    <p className="text-xl text-blue-200 mb-10">Join 500+ tourist shopkeepers already using ShopVCard</p>

                    <Link
                        href="/auth/register?role=shopkeeper"
                        className="inline-block bg-white text-[#1A237E] px-10 py-5 rounded-full text-xl font-bold hover:bg-gray-100 transition shadow-2xl hover:shadow-white/20 transform hover:-translate-y-1"
                    >
                        Start Your Free Trial Today
                    </Link>
                    <p className="mt-6 text-sm text-blue-300 font-medium">15 days free. No credit card needed.</p>
                </div>
            </section>

            {/* SECTION 9 — FOOTER */}
            <footer className="bg-gray-900 text-gray-400 py-16 border-t border-gray-800">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex flex-col items-center md:items-start gap-4">
                        <div className="flex items-center gap-2 text-white text-2xl font-bold tracking-tight">
                            <Store className="text-[#FF6F00]" size={24} /> Ambajizon
                        </div>
                        <p className="text-sm">Empowering Local Indian Retailers.</p>
                    </div>

                    <div className="flex flex-wrap justify-center gap-x-8 gap-y-4 text-sm font-medium">
                        <Link href="#" className="hover:text-white transition">About Us</Link>
                        <Link href="#pricing" className="hover:text-white transition">Pricing</Link>
                        <Link href="#" className="hover:text-white transition">Contact</Link>
                        <Link href="#" className="hover:text-white transition">Privacy Policy</Link>
                        <Link href="#" className="hover:text-white transition">Terms of Service</Link>
                    </div>

                    <div className="flex gap-4">
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#FF6F00] hover:text-white transition">IG</a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-[#1A237E] hover:text-white transition">FB</a>
                        <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center hover:bg-green-600 hover:text-white transition">WA</a>
                    </div>
                </div>
                <div className="text-center text-sm mt-12 pt-8 border-t border-gray-800 max-w-7xl mx-auto px-4">
                    © 2026 Ambajizon. All rights reserved.
                </div>
            </footer>
        </div>
    )
}

function FeatureBlock({ icon, title, desc }: { icon: React.ReactNode, title: string, desc: string }) {
    return (
        <div className="flex flex-col items-start p-2">
            <div className="text-[#1A237E] p-3 bg-blue-50 rounded-xl mb-4">
                {icon}
            </div>
            <h4 className="text-lg font-bold text-gray-900 mb-2">{title}</h4>
            <p className="text-gray-600 text-sm leading-relaxed">{desc}</p>
        </div>
    )
}

function TestimonialCard({ quote, name, shop, loc }: { quote: string, name: string, shop: string, loc: string }) {
    return (
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-gray-100 flex flex-col h-full">
            <div className="flex text-yellow-400 mb-6">
                ⭐⭐⭐⭐⭐
            </div>
            <p className="text-gray-700 italic flex-grow mb-6 leading-relaxed">"{quote}"</p>
            <div>
                <div className="font-bold text-gray-900">{name}</div>
                <div className="text-sm font-medium text-[#1A237E]">{shop}</div>
                <div className="text-xs text-gray-500">{loc}</div>
            </div>
        </div>
    )
}

function FaqItem({ q, a }: { q: string, a: string }) {
    return (
        <details className="group bg-gray-50 rounded-2xl border border-gray-200 open:bg-white open:shadow-md transition-all duration-300">
            <summary className="flex cursor-pointer items-center justify-between p-6 font-bold text-gray-900">
                {q}
                <span className="relative ml-1.5 h-5 w-5 flex-shrink-0">
                    <ChevronRight className="absolute inset-0 h-5 w-5 opacity-100 transition-transform duration-300 group-open:rotate-90 group-open:text-[#FF6F00]" />
                </span>
            </summary>
            <div className="px-6 pb-6 pt-0 text-gray-600 leading-relaxed">
                {a}
            </div>
        </details>
    )
}
