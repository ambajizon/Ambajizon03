import { getStoreBySlug } from '@/app/actions/storefront'
import { NextResponse } from 'next/server'

export async function GET(
    request: Request,
    { params }: { params: { 'store': string } }
) {
    const slug = params['store']
    const store = await getStoreBySlug(slug)

    if (!store) {
        return new NextResponse('Store not found', { status: 404 })
    }

    const manifest = {
        name: store.name,
        short_name: store.name.substring(0, 12),
        description: `Shop at ${store.name}`,
        start_url: `/${store.slug}/shop`,
        scope: `/${store.slug}`,
        display: "standalone",
        orientation: "portrait",
        theme_color: store.primary_color || "#3b82f6",
        background_color: store.primary_color || "#3b82f6",
        icons: [
            {
                src: store.logo_url || "/icons/ambajizon-192.png",
                sizes: "192x192",
                type: "image/png",
                purpose: "any maskable"
            },
            {
                src: store.logo_url || "/icons/ambajizon-512.png",
                sizes: "512x512",
                type: "image/png",
                purpose: "any maskable"
            }
        ]
    }

    return NextResponse.json(manifest)
}
