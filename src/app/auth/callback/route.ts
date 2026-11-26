import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse, type NextRequest } from 'next/server'
import { API_URL } from '../../lib/api'

export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  const errorParam = searchParams.get('error')
  const next = searchParams.get('next') ?? '/dashboard'

  if (errorParam) {
    console.error('OAuth provider error:', errorParam, searchParams.get('error_description'))
    return NextResponse.redirect(`${origin}/login?error=oauth_failed`)
  }

  if (!code) {
    return NextResponse.redirect(`${origin}/login?error=missing_code`)
  }

  const cookieStore = await cookies()
  const redirectUrl = new URL(next, origin)
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
    return NextResponse.redirect(`${origin}/login?error=session_exchange_failed`)
  }

  const user = data.session.user
  const token = data.session.access_token
  const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const firstName = googleName.split(' ')[0]

  try {
    await fetch(`${API_URL}/api/users/sync`, {
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
  } catch (e) {
    console.error('Google user sync error with backend:', e)
  }

  return response
}