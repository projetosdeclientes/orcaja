import { NextResponse } from 'next/server'
import { DEMO_USER } from '@/lib/mock-data'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, password } = body

    // Verifica credenciais solicitadas pelo usuário: lpaulinoperfetti@gmail.com / 123456
    const isValidDemoUser =
      (email?.toLowerCase() === 'lpaulinoperfetti@gmail.com' && password === '123456') ||
      (email?.toLowerCase() === 'admin@orcaja.com.br' && password === '123456')

    if (!isValidDemoUser) {
      // Se não for o usuário demo padrão, verifica se é admin demo
      return NextResponse.json(
        { error: 'E-mail ou senha incorretos. Use lpaulinoperfetti@gmail.com e senha 123456.' },
        { status: 401 }
      )
    }

    const isSuperAdmin = email?.toLowerCase().includes('admin')
    const sessionData = {
      id: DEMO_USER.id,
      email: DEMO_USER.email,
      nome: DEMO_USER.nome,
      papel: isSuperAdmin ? 'super_admin' : 'dono',
      empresa_id: DEMO_USER.empresa_id,
    }

    const response = NextResponse.json({ success: true, user: sessionData })

    // "Login infinito": 10 anos de validade (315360000 segundos)
    response.cookies.set({
      name: 'orcaja_session',
      value: JSON.stringify(sessionData),
      maxAge: 315360000,
      path: '/',
      sameSite: 'lax',
      httpOnly: false, // acessível no client para reatividade
    })

    return response
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro interno'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
