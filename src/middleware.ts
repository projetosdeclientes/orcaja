import { NextResponse, type NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const path = request.nextUrl.pathname

  // Rotas públicas
  if (
    path.startsWith('/o/') ||
    path === '/login' ||
    path === '/termos' ||
    path === '/privacidade' ||
    path.startsWith('/api/public') ||
    path.startsWith('/api/auth')
  ) {
    // Se já estiver logado e tentar acessar /login, manda para /novo
    if (path === '/login') {
      const session = request.cookies.get('orcaja_session')
      if (session?.value) {
        return NextResponse.redirect(new URL('/novo', request.url))
      }
    }
    return NextResponse.next()
  }

  // Verifica cookie de sessão local/demo
  const sessionCookie = request.cookies.get('orcaja_session')
  let userSession: { email: string; papel: string; empresa_id: string } | null = null

  if (sessionCookie?.value) {
    try {
      userSession = JSON.parse(decodeURIComponent(sessionCookie.value))
    } catch {
      try {
        userSession = JSON.parse(sessionCookie.value)
      } catch {}
    }
  }

  // Se o Supabase estiver configurado com credenciais válidas, tenta validar também
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasValidSupabase =
    supabaseUrl &&
    !supabaseUrl.includes('SEU-PROJETO') &&
    supabaseUrl.startsWith('https://') &&
    supabaseKey &&
    !supabaseKey.includes('sua-anon-key')

  if (!userSession && hasValidSupabase) {
    try {
      const { createServerClient } = await import('@supabase/ssr')
      let supabaseResponse = NextResponse.next({ request })
      const supabase = createServerClient(supabaseUrl, supabaseKey, {
        cookies: {
          getAll() {
            return request.cookies.getAll()
          },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
            supabaseResponse = NextResponse.next({ request })
            cookiesToSet.forEach(({ name, value, options }) =>
              supabaseResponse.cookies.set(name, value, options)
            )
          },
        },
      })
      const {
        data: { user },
      } = await supabase.auth.getUser()
      if (user) {
        const { data: perfil } = await supabase
          .from('perfis')
          .select('papel, empresa_id')
          .eq('id', user.id)
          .single()
        if (perfil) {
          userSession = {
            email: user.email ?? 'lpaulinoperfetti@gmail.com',
            papel: perfil.papel,
            empresa_id: perfil.empresa_id,
          }
        }
      }
    } catch {
      // Ignora falhas de conexão de rede
    }
  }

  // Sem sessão → login
  if (!userSession) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // Super admin → /admin (ou dono simulando admin)
  if (path.startsWith('/admin') && userSession.papel !== 'super_admin' && userSession.papel !== 'dono') {
    return NextResponse.redirect(new URL('/novo', request.url))
  }

  // Vendedor não acessa /config
  if (path.startsWith('/config') && userSession.papel === 'vendedor') {
    return NextResponse.redirect(new URL('/novo', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
