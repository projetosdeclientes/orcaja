import { NextResponse } from 'next/server'
import { localStore, isSupabaseConfigured } from '@/lib/store'
import { getCurrentSession } from '@/lib/auth-server'

export async function GET() {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const empresa = session.empresa || localStore.getEmpresa()
  const produtos = localStore.getProdutos()
  const adicionais = localStore.getAdicionais()

  return NextResponse.json({
    empresa,
    produtos,
    adicionais,
  })
}

export async function PUT(request: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { empresa, produtos, adicionais } = body

    if (empresa) {
      localStore.updateEmpresa(empresa)
    }
    if (produtos) {
      localStore.updateProdutos(produtos)
    }
    if (adicionais) {
      localStore.updateAdicionais(adicionais)
    }

    return NextResponse.json({
      success: true,
      empresa: localStore.getEmpresa(),
      produtos: localStore.getProdutos(),
      adicionais: localStore.getAdicionais(),
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
