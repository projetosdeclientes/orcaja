import { NextResponse } from 'next/server'
import { localStore, isSupabaseConfigured } from '@/lib/store'

export async function GET(request: Request, props: { params: Promise<{ token: string }> }) {
  const params = await props.params
  const { token } = params

  if (isSupabaseConfigured()) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()
      const { data, error } = await supabase.rpc('get_orcamento_publico', { p_token: token })
      if (!error && data) return NextResponse.json(data)
    } catch {}
  }

  // Fallback demo store
  const orc = localStore.getOrcamentoByToken(token)
  if (!orc) {
    return NextResponse.json({ error: 'Orçamento não encontrado ou expirado' }, { status: 404 })
  }

  const empresa = localStore.getEmpresa()

  return NextResponse.json({
    orcamento: {
      id: orc.id,
      numero: orc.numero,
      token_publico: orc.token_publico,
      cliente_nome: orc.cliente_nome,
      cliente_telefone: orc.cliente_telefone,
      cliente_endereco: orc.cliente_endereco,
      status: orc.status,
      subtotal: orc.subtotal,
      desconto_tipo: orc.desconto_tipo,
      desconto_valor: orc.desconto_valor,
      desconto_total: orc.desconto_total,
      adicionais_snapshot: orc.adicionais_snapshot,
      total: orc.total,
      validade_ate: orc.validade_ate,
      observacoes: orc.observacoes,
      created_at: orc.created_at,
    },
    itens: orc.itens ?? [],
    empresa: {
      nome: empresa.nome,
      logo_url: empresa.logo_url,
      cor_primaria: empresa.cor_primaria,
      whatsapp: empresa.whatsapp,
      endereco: empresa.endereco,
      texto_topo: empresa.texto_topo,
      condicoes_pagamento: empresa.condicoes_pagamento,
      prazo_entrega_padrao: empresa.prazo_entrega_padrao,
    },
  })
}
