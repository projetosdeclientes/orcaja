import { DEMO_USER, DEMO_EMPRESA, DEMO_PRODUTOS, DEMO_ADICIONAIS, DEMO_ORCAMENTOS } from './mock-data'
import type { Empresa, Perfil, Produto, Adicional, Orcamento } from '@/types'

// In-memory global singleton for local dev / mock mode so edits survive across requests
declare global {
  // eslint-disable-next-line no-var
  var __ORCAJA_STORE: {
    empresa: Empresa
    produtos: Produto[]
    adicionais: Adicional[]
    orcamentos: Orcamento[]
    empresasAdmin: Empresa[]
  } | undefined
}

function initStore() {
  if (!globalThis.__ORCAJA_STORE) {
    globalThis.__ORCAJA_STORE = {
      empresa: { ...DEMO_EMPRESA },
      produtos: JSON.parse(JSON.stringify(DEMO_PRODUTOS)),
      adicionais: JSON.parse(JSON.stringify(DEMO_ADICIONAIS)),
      orcamentos: JSON.parse(JSON.stringify(DEMO_ORCAMENTOS)),
      empresasAdmin: [
        { ...DEMO_EMPRESA },
        {
          id: 'empresa-marmoraria-02',
          nome: 'Granitos & Mármores Nobres',
          slug: 'marmoraria-nobres',
          logo_url: null,
          cor_primaria: '#059669',
          whatsapp: '5511977770000',
          endereco: 'Campinas - SP',
          texto_topo: 'Marmoraria de Alto Padrão',
          condicoes_pagamento: 'À vista ou 3x sem juros',
          prazo_entrega_padrao: '15 dias',
          validade_dias: 7,
          ativo: true,
          pago_ate: '2027-06-30',
          observacoes_admin: 'Plano Pro Ativo',
          created_at: new Date('2026-02-10').toISOString(),
        },
        {
          id: 'empresa-cortinas-03',
          nome: 'Cortinas & Persianas Decor',
          slug: 'cortinas-decor',
          logo_url: null,
          cor_primaria: '#7C3AED',
          whatsapp: '5511966660000',
          endereco: 'Santo André - SP',
          texto_topo: 'Persianas Motorizadas e Cortinas',
          condicoes_pagamento: 'Cartão até 6x',
          prazo_entrega_padrao: '20 dias',
          validade_dias: 15,
          ativo: false,
          pago_ate: '2026-03-01',
          observacoes_admin: 'Mensalidade pendente',
          created_at: new Date('2026-03-01').toISOString(),
        },
      ],
    }
  }
  return globalThis.__ORCAJA_STORE
}

export function isSupabaseConfigured(): boolean {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  return !!(
    url &&
    !url.includes('SEU-PROJETO') &&
    url.startsWith('https://') &&
    key &&
    !key.includes('sua-anon-key')
  )
}

export const localStore = {
  getEmpresa(): Empresa {
    return initStore().empresa
  },
  updateEmpresa(data: Partial<Empresa>): Empresa {
    const store = initStore()
    store.empresa = { ...store.empresa, ...data }
    return store.empresa
  },
  getProdutos(): Produto[] {
    return initStore().produtos
  },
  updateProdutos(produtos: Produto[]): void {
    initStore().produtos = produtos
  },
  getAdicionais(): Adicional[] {
    return initStore().adicionais
  },
  updateAdicionais(adicionais: Adicional[]): void {
    initStore().adicionais = adicionais
  },
  getOrcamentos(): Orcamento[] {
    return initStore().orcamentos
  },
  getOrcamentoById(id: string): Orcamento | undefined {
    return initStore().orcamentos.find(o => o.id === id)
  },
  getOrcamentoByToken(token: string): Orcamento | undefined {
    return initStore().orcamentos.find(o => o.token_publico === token)
  },
  addOrcamento(orc: Orcamento): Orcamento {
    const store = initStore()
    store.orcamentos.unshift(orc)
    return orc
  },
  updateOrcamentoStatus(id: string, status: 'enviado' | 'aprovado' | 'perdido'): Orcamento | undefined {
    const store = initStore()
    const orc = store.orcamentos.find(o => o.id === id)
    if (orc) {
      orc.status = status
    }
    return orc
  },
  getEmpresasAdmin(): Empresa[] {
    return initStore().empresasAdmin
  },
  toggleEmpresaAtivo(id: string): Empresa | undefined {
    const store = initStore()
    const emp = store.empresasAdmin.find(e => e.id === id)
    if (emp) {
      emp.ativo = !emp.ativo
      if (emp.id === store.empresa.id) {
        store.empresa.ativo = emp.ativo
      }
    }
    return emp
  },
}
