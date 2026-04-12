import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
    const res = NextResponse.next()

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                get(name) {
                    return request.cookies.get(name)?.value
                },
                set(name, value, options) {
                    res.cookies.set({ name, value, ...options })
                },
                remove(name, options) {
                    res.cookies.set({ name, value: '', ...options })
                },
            },
        }
    )

    // IMPORTANT: Do not run code between createServerClient and getUser().
    // Session refresh tokens are rotated here — any code in between can cause
    // users to be randomly logged out.
    const { data: { user } } = await supabase.auth.getUser()

    const isAuthPage = request.nextUrl.pathname.startsWith('/auth')
    const isAppPage  = request.nextUrl.pathname.startsWith('/app')
    const isRoot     = request.nextUrl.pathname === '/'

    // Unauthenticated → block /app, send to login
    if (!user && isAppPage) {
        return NextResponse.redirect(new URL('/auth/login', request.url))
    }

    // Authenticated → redirect away from landing page and auth pages
    if (user && (isRoot || isAuthPage)) {
        return NextResponse.redirect(new URL('/app', request.url))
    }

    return res
}
