import { NextResponse } from 'next/server'
import { localStore, isSupabaseConfigured } from '@/lib/store'
import { getCurrentSession } from '@/lib/auth-server'
import { nanoid } from 'nanoid'
import type { Orcamento } from '@/types'

export async function GET() {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase
        .from('orcamentos')
        .select('*')
        .eq('empresa_id', session.perfil.empresa_id)
        .order('numero', { ascending: false })
      if (!error && data) {
        return NextResponse.json(data)
      }
    } catch {}
  }

  // Fallback demo store
  const orcs = localStore.getOrcamentos()
  return NextResponse.json(orcs)
}

export async function POST(request: Request) {
  const session = await getCurrentSession()
  if (!session) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      cliente_nome,
      cliente_telefone,
      cliente_endereco,
      subtotal,
      desconto_tipo,
      desconto_valor,
      desconto_total,
      adicionais_snapshot,
      total,
      validade_ate,
      observacoes,
      itens,
    } = body

    const empresa = session.empresa || localStore.getEmpresa()

    if (isSupabaseConfigured()) {
      try {
        const { createClient } = await import('@/lib/supabase/server')
        const supabase = await createClient()
        const token = nanoid(40)

        const { data: orc, error } = await supabase
          .from('orcamentos')
          .insert({
            empresa_id: empresa.id,
            token_publico: token,
            cliente_nome,
            cliente_telefone,
            cliente_endereco,
            status: 'enviado',
            subtotal,
            desconto_tipo,
            desconto_valor,
            desconto_total,
            adicionais_snapshot,
            total,
            validade_ate,
            observacoes,
            criado_por: session.user.id,
          })
          .select('id, numero, token_publico')
          .single()

        if (!error && orc) {
          if (itens?.length) {
            const itensPrepared = itens.map((it: any) => ({
              orcamento_id: orc.id,
              produto_nome: it.produto_nome,
              descricao: it.descricao,
              largura_cm: it.largura_cm,
              altura_cm: it.altura_cm,
              quantidade: it.quantidade,
              area_m2: it.area_m2,
              valor_unitario: it.valor_unitario,
              valor_total: it.valor_total,
              snapshot: it.snapshot,
            }))
            await supabase.from('orcamento_itens').insert(itensPrepared)
          }
          return NextResponse.json(orc)
        }
      } catch {}
    }

    // Local Store fallback
    const allOrcs = localStore.getOrcamentos()
    const maxNum = allOrcs.reduce((acc, curr) => Math.max(acc, curr.numero), 0)
    const novoNumero = maxNum + 1
    const token = nanoid(32)
    const orcId = `orc-${nanoid(8)}`

    const novoOrcamento: Orcamento = {
      id: orcId,
      empresa_id: empresa.id,
      numero: novoNumero,
      token_publico: token,
      cliente_nome,
      cliente_telefone,
      cliente_endereco,
      status: 'enviado',
      subtotal,
      desconto_tipo,
      desconto_valor,
      desconto_total,
      adicionais_snapshot,
      total,
      validade_ate,
      observacoes,
      criado_por: session.user.id,
      created_at: new Date().toISOString(),
      itens: (itens || []).map((it: any, idx: number) => ({
        id: `item-${nanoid(6)}`,
        orcamento_id: orcId,
        produto_nome: it.produto_nome,
        descricao: it.descricao,
        largura_cm: it.largura_cm,
        altura_cm: it.altura_cm,
        quantidade: it.quantidade,
        area_m2: it.area_m2,
        valor_unitario: it.valor_unitario,
        valor_total: it.valor_total,
        snapshot: it.snapshot,
      })),
    }

    localStore.addOrcamento(novoOrcamento)

    return NextResponse.json({
      id: novoOrcamento.id,
      numero: novoOrcamento.numero,
      token_publico: novoOrcamento.token_publico,
    })
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : 'Erro ao salvar'
    return NextResponse.json({ error: msg }, { status: 500 })
  }
}
