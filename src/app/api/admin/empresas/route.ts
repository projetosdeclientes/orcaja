import { NextResponse } from 'next/server'
import { localStore } from '@/lib/store'
import { getCurrentSession } from '@/lib/auth-server'

export async function GET() {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const empresas = localStore.getEmpresasAdmin()
  return NextResponse.json(empresas)
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const { id } = await request.json()
    const updated = localStore.toggleEmpresaAtivo(id)
    if (!updated) {
      return NextResponse.json({ error: 'Empresa não encontrada' }, { status: 404 })
    }
    return NextResponse.json({ success: true, empresa: updated })
  } catch {
    return NextResponse.json({ error: 'Erro ao alterar status' }, { status: 500 })
  }
}
