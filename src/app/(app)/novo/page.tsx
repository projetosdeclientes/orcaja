import { redirect } from 'next/navigation'
import { getCurrentSession } from '@/lib/auth-server'
import { localStore, isSupabaseConfigured } from '@/lib/store'
import NovoOrcamentoWizard from '@/components/orcamento/NovoOrcamentoWizard'
import type { Produto, Adicional } from '@/types'

export default async function NovoPage() {
  const session = await getCurrentSession()
  if (!session) redirect('/login')

  let empresa = session.empresa || localStore.getEmpresa()
  let produtos: Produto[] = []
  let adicionais: Adicional[] = []

  if (isSupabaseConfigured() && session.perfil.empresa_id) {
    try {
      const { createClient } = await import('@/lib/supabase/server')
      const supabase = await createClient()

      const { data: empData } = await supabase
        .from('empresas')
        .select('*')
        .eq('id', session.perfil.empresa_id)
        .single()
      if (empData) empresa = empData

      const { data: prods } = await supabase
        .from('produtos')
        .select('*, grupos_opcao(*, opcoes(*))')
        .eq('empresa_id', session.perfil.empresa_id)
        .eq('ativo', true)
        .order('ordem')
      if (prods) produtos = prods

      const { data: adcs } = await supabase
        .from('adicionais')
        .select('*')
        .eq('empresa_id', session.perfil.empresa_id)
        .eq('ativo', true)
        .order('ordem')
      if (adcs) adicionais = adcs
    } catch {}
  }

  // Fallback demo store se banco vazio ou não conectado
  if (produtos.length === 0) {
    produtos = localStore.getProdutos()
  }
  if (adicionais.length === 0) {
    adicionais = localStore.getAdicionais()
  }

  return (
    <NovoOrcamentoWizard
      empresa={empresa}
      produtos={produtos}
      adicionais={adicionais}
      userId={session.user.id}
    />
  )
}
