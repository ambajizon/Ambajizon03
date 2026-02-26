import { getStoreBySlug } from '@/app/actions/storefront'
import { notFound } from 'next/navigation'
import AnalyticsRecorder from '@/components/AnalyticsRecorder'
import MobileBottomNav from '@/components/storefront/MobileBottomNav'
import PwaRegister from '@/components/PwaRegister'
import { Metadata } from 'next'
import { Inter, Playfair_Display, Lato, Montserrat, Open_Sans, Roboto, Poppins } from 'next/font/google'
import { Store as StoreIcon, Phone, MessageCircle } from 'lucide-react'

// Font loaders
const inter = Inter({ subsets: ['latin'], variable: '--font-theme' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-theme' })
const lato = Lato({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-theme' })
const montserrat = Montserrat({ subsets: ['latin'], variable: '--font-theme' })
const openSans = Open_Sans({ subsets: ['latin'], variable: '--font-theme' })
const roboto = Roboto({ weight: ['400', '700'], subsets: ['latin'], variable: '--font-theme' })
const poppins = Poppins({ weight: ['400', '600', '700'], subsets: ['latin'], variable: '--font-theme' })

const fonts: Record<string, any> = {
    inter,
    playfair,
    lato,
    montserrat,
    'open-sans': openSans,
    roboto,
    poppins
}

type Props = {
    children: React.ReactNode
    params: { store: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
    const store = await getStoreBySlug(params.store)
    if (!store) return { title: 'Store Not Found' }

    return {
        title: store.name,
        description: `Welcome to ${store.name}`,
        icons: {
            icon: store.logo_url || '/icons/ambajizon-192.png'
        },
        manifest: `/api/manifest/${params.store}/manifest.json`,
        themeColor: store.primary_color || '#3b82f6',
        appleWebApp: {
            capable: true,
            statusBarStyle: 'default',
            title: store.name,
        }
    }
}

export default async function StoreLayout({ children, params }: Props) {
    const store = await getStoreBySlug(params.store)

    if (!store) {
        return notFound()
    }

    const themeFont = fonts[store.font_family?.toLowerCase()] || inter
    const primaryColor = store.primary_color || '#3b82f6'

    return (
        <div
            className={`${themeFont.variable} font-sans min-h-screen bg-gray-50`}
            style={{
                '--primary-color': primaryColor
            } as React.CSSProperties}
        >
            <AnalyticsRecorder storeId={store.id} />

            {/* Main Content */}
            <main className="w-full max-w-md md:max-w-5xl lg:max-w-7xl mx-auto bg-white min-h-screen md:shadow-xl shadow-2xl overflow-x-hidden relative pb-20 md:pb-0">
                {store.is_live === false ? (
                    <div className="flex flex-col items-center justify-center min-h-[80vh] p-6 text-center animate-in fade-in zoom-in duration-500">
                        <div className="w-24 h-24 bg-gray-50 rounded-full flex items-center justify-center text-5xl mb-6 shadow-lg shadow-gray-200/50 border-4 border-white">
                            🏪
                        </div>
                        <h2 className="text-2xl font-black text-gray-900 mb-2 tracking-tight">Shop Temporarily Closed</h2>
                        <p className="text-gray-500 mb-8 max-w-[280px] font-medium leading-relaxed">
                            We'll be back soon! The store owner has temporarily paused online orders.
                        </p>

                        <div className="flex flex-col gap-3 w-full max-w-[280px]">
                            {store.whatsapp_number && (
                                <a
                                    href={`https://wa.me/91${store.whatsapp_number.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="flex items-center justify-center gap-2.5 bg-[#25D366] text-white py-3.5 rounded-2xl font-bold shadow-lg shadow-green-500/30 hover:bg-green-600 transition-all active:scale-[0.98]"
                                >
                                    <MessageCircle size={20} /> Contact on WhatsApp
                                </a>
                            )}
                            {store.phone_number && (
                                <a
                                    href={`tel:${store.phone_number.replace(/\D/g, '')}`}
                                    className="flex items-center justify-center gap-2.5 bg-white border-2 border-gray-100 text-gray-700 py-3.5 rounded-2xl font-bold hover:bg-gray-50 transition-all active:scale-[0.98]"
                                >
                                    <Phone size={20} className="text-gray-400" /> Call Store
                                </a>
                            )}
                        </div>
                    </div>
                ) : (
                    children
                )}
            </main>
            <MobileBottomNav storeSlug={params.store} />
            <PwaRegister />
        </div>
    )
}
