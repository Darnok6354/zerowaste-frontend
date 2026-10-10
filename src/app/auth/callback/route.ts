import { NextResponse } from 'next/server'
import { createClient } from '../../lib/server' // Zaktualizuj ścieżkę do swojego server.ts, jeśli używasz aliasów, lub użyj '../lib/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  // Zmień "/dashboard" na adres Twojej głównej strony z lodówką, np. "/"
  const next = searchParams.get('next') ?? '/dashboard' 

  if (code) {
    const supabase = await createClient()
    const { data, error } = await supabase.auth.exchangeCodeForSession(code)

    if (!error && data.session) {
      const user = data.session.user
      const token = data.session.access_token
      
      // Google przechowuje imię i nazwisko w full_name lub name
      const googleName = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
      const firstName = googleName.split(' ')[0] // Pobieramy tylko pierwsze słowo

      try {
        // Synchronizacja ze Spring Bootem
        await fetch('http://localhost:8080/api/users/sync', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            id: user.id,
            email: user.email,
            firstName: firstName
          })
        });
      } catch (e) {
        console.error("Google user login error with the backend:", e);
      }
    }
  }

  // Przekierowanie na docelową stronę po udanej autoryzacji i synchronizacji
  return NextResponse.redirect(`${origin}${next}`)
}