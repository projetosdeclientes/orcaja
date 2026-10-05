import { NextResponse } from 'next/server'
import { localStore, isSupabaseConfigured } from '@/lib/store'
import { getCurrentSession } from '@/lib/auth-server'

export async function GET(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = params

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*, itens:orcamento_itens(*)')
        .eq('id', id)
        .single()
      if (!error && data) return NextResponse.json(data)
    } catch {}
  }

  const orc = localStore.getOrcamentoById(id)
  if (!orc) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  return NextResponse.json(orc)
}

export async function PATCH(request: Request, props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  const { id } = params
  const body = await request.json()
  const { status } = body

  if (!['enviado', 'aprovado', 'perdido'].includes(status)) {
    return NextResponse.json({ error: 'Status inválido' }, { status: 400 })
  }

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { error } = await supabase
        .from('orcamentos')
        .update({ status })
        .eq('id', id)
      if (!error) return NextResponse.json({ success: true, status })
    } catch {}
  }

  const updated = localStore.updateOrcamentoStatus(id, status)
  if (!updated) {
    return NextResponse.json({ error: 'Orçamento não encontrado' }, { status: 404 })
  }

  return NextResponse.json({ success: true, status })
}
