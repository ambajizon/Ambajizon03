import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// Use a Service Role or Anon key for read-only public access
const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function GET(
    request: Request,
    { params }: { params: { store: string } }
) {
    const slug = params.store

    try {
        const safeIdentifier = slug.replace(/[^a-zA-Z0-9.\-]/g, '')
        // Fetch store info
        const { data: store, error } = await supabase
            .from('stores')
            .select('name, logo_url, theme_config')
            .or(`slug.eq.${safeIdentifier},theme_config->>custom_domain.eq.${safeIdentifier}`)
            .single()

        if (error || !store) {
            return new NextResponse('Store not found', { status: 404 })
        }

        const fallbackColor = store.theme_config?.primary_color || '#3b82f6'
        const logo = store.logo_url || '/icon-512x512.png'

        // Construct PWA Manifest
        const manifest = {
            name: store.name,
            short_name: store.name.substring(0, 12),
            description: `Shop online at ${store.name}`,
            start_url: `/${slug}`,
            display: 'standalone',
            background_color: '#F9FAFB', // gray-50
            theme_color: fallbackColor,
            icons: [
                {
                    src: logo,
                    sizes: '192x192',
                    type: 'image/png',
                    purpose: 'any'
                },
                {
                    src: logo,
                    sizes: '512x512',
                    type: 'image/png',
                    purpose: 'any maskable'
                }
            ]
        }

        return NextResponse.json(manifest, {
            headers: {
                'Content-Type': 'application/manifest+json',
                'Cache-Control': 'public, max-age=86400, stale-while-revalidate=43200'
            }
        })

    } catch (e: any) {
        return new NextResponse(e.message, { status: 500 })
    }
}
