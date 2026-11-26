import { createServerClient } from '@supabase/ssr'
import { cookies, headers } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { API_URL } from '../../lib/api'

function resolveBaseUrl(request: NextRequest, headerStore: Awaited<ReturnType<typeof headers>>): string {
  const forwardedHost = headerStore.get('x-forwarded-host')
  const forwardedProto = headerStore.get('x-forwarded-proto') ?? 'https'

  if (forwardedHost) {
    return `${forwardedProto}://${forwardedHost}`
  }

  return new URL(request.url).origin
}

function sanitizeNextPath(rawNext: string | null): string {
  if (!rawNext || !rawNext.startsWith('/') || rawNext.startsWith('//')) {
    return '/dashboard'
  }
  return rawNext
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const headerStore = await headers()
  const baseUrl = resolveBaseUrl(request, headerStore)

  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const nextPath = sanitizeNextPath(searchParams.get('next'))

  if (errorParam) {
    console.error('OAuth provider error:', errorParam, searchParams.get('error_description'))
    return NextResponse.redirect(`${baseUrl}/login?error=oauth_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${baseUrl}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const redirectUrl = new URL(nextPath, baseUrl)
  const response = NextResponse.redirect(redirectUrl)

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            cookieStore.set(name, value, options)
            response.cookies.set(name, value, options)
          })
        },
      },
    }
  )

  const { data, error } = await supabase.auth.exchangeCodeForSession(code)

  if (error || !data.session) {
    console.error('exchangeCodeForSession failed:', error?.message)
    return NextResponse.redirect(`${baseUrl}/login?error=session_exchange_failed`)
  }

  const user = data.session.user
  const token = data.session.access_token
  const googleName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split('@')[0] ||
    'User'
  const firstName = googleName.trim().split(/\s+/)[0] || 'User'

  try {
    const syncResponse = await fetch(`${API_URL}/api/users/sync`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
      },
      body: JSON.stringify({
        id: user.id,
        email: user.email,
        firstName,
      }),
    })

    if (!syncResponse.ok) {
      const errorText = await syncResponse.text().catch(() => '')
      console.error('Backend /api/users/sync non-OK status:', syncResponse.status, errorText)
    }
  } catch (e) {
    console.error('Google user sync error with backend:', e)
  }

  return response
}