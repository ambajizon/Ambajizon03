import { createServerClient, type CookieOptions } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name: string) {
                    return request.cookies.get(name)?.value
                },
                set(name: string, value: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value,
                        ...options,
                    })
                },
                remove(name: string, options: CookieOptions) {
                    request.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                    response = NextResponse.next({
                        request: {
                            headers: request.headers,
                        },
                    })
                    response.cookies.set({
                        name,
                        value: '',
                        ...options,
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // Role Protection & Redirection Logic
    const path = request.nextUrl.pathname

    // 1. Admin Route Protection
    if (path.startsWith('/admin')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login?role=admin', request.url))
        }

        // strict role check
        const role = user.user_metadata?.role
        if (role !== 'admin') {
            // unauthorized for admin area
            return NextResponse.redirect(new URL('/auth/login?error=unauthorized', request.url))
        }
    }

    // 2. Shopkeeper Dashboard Protection
    if (path.startsWith('/dashboard')) {
        if (!user) {
            return NextResponse.redirect(new URL('/auth/login?role=shopkeeper', request.url))
        }

        // db checking for trial status
        const { data: shopkeeper } = await supabase
            .from('shopkeepers')
            .select('subscription_status, trial_end_date')
            .eq('id', user.id)
            .single()

        if (shopkeeper) {
            const now = new Date()
            const trialEnd = new Date(shopkeeper.trial_end_date)
            const isTrialExpired = now > trialEnd
            const isSubscriptionExpired = shopkeeper.subscription_status === 'expired'

            if (isSubscriptionExpired || (shopkeeper.subscription_status === 'trial' && isTrialExpired)) {
                // redirect to pricing if trial expired
                // exclude /pricing from this check if it was under /dashboard (it is not, it is root /pricing)
                return NextResponse.redirect(new URL('/pricing?reason=trial_expired', request.url))
            }
        }
    }

    // 3. Custom Domain Routing Logic
    const hostname = request.headers.get('host') || ''
    const baseDomain = process.env.NODE_ENV === 'production' ? 'ambajizon.in' : 'localhost:3000'

    // Check if it's a core platform domain
    const isBaseDomain =
        hostname === baseDomain ||
        hostname === `www.${baseDomain}` ||
        hostname.endsWith('.vercel.app') ||
        hostname === 'localhost:3000' ||
        hostname.startsWith('127.0.0.1')

    if (!isBaseDomain) {
        let storeIdentifier = hostname

        // Extract subdomain if using the platform's root domain (.ambajizon.in)
        if (hostname.endsWith(`.${baseDomain}`)) {
            storeIdentifier = hostname.replace(`.${baseDomain}`, '')
        }

        // Exclude Next.js system and admin routes from being rewritten to a storefront
        const isSystemPath = path.startsWith('/api') ||
            path.startsWith('/_next') ||
            path.startsWith('/admin') ||
            path.startsWith('/dashboard') ||
            path.startsWith('/auth')

        // If it's a storefront page load on a custom domain, rewrite it to /[store]
        if (!isSystemPath) {
            // e.g. /shop -> /rajeshhandicrafts.com/shop
            const rewriteUrl = new URL(`/${storeIdentifier}${path}`, request.url)
            const rewriteResponse = NextResponse.rewrite(rewriteUrl, {
                request: { headers: request.headers }
            })

            // Preserve Supabase session cookies
            if (response.headers.has('set-cookie')) {
                const cookies = response.headers.getSetCookie()
                cookies.forEach(c => rewriteResponse.headers.append('set-cookie', c))
            }

            return rewriteResponse
        }
    }

    return response
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * Feel free to modify this pattern to include more paths.
         */
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
