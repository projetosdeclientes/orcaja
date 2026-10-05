export type Papel = 'super_admin' | 'dono' | 'vendedor'
export type StatusOrcamento = 'enviado' | 'aprovado' | 'perdido'
export type TipoCobranca = 'area' | 'linear' | 'unidade'
export type TipoAcrescimo = 'fixo' | 'por_m2' | 'percentual'
export type TipoAdicional = 'fixo' | 'percentual'
export type TipoDesconto = 'valor' | 'percentual'

export interface Empresa {
  id: string
  nome: string
  slug: string
  logo_url: string | null
  cor_primaria: string
  whatsapp: string | null
  endereco: string | null
  texto_topo: string | null
  condicoes_pagamento: string | null
  prazo_entrega_padrao: string | null
  validade_dias: number
  ativo: boolean
  pago_ate: string | null
  observacoes_admin: string | null
  created_at: string
}

export interface Perfil {
  id: string
  empresa_id: string | null
  nome: string
  papel: Papel
}

export interface Produto {
  id: string
  empresa_id: string
  nome: string
  categoria: string | null
  tipo_cobranca: TipoCobranca
  preco_base: number
  area_minima: number
  valor_minimo: number
  largura_min: number | null
  largura_max: number | null
  altura_min: number | null
  altura_max: number | null
  ativo: boolean
  ordem: number
  grupos?: GrupoOpcao[]
}

export interface GrupoOpcao {
  id: string
  produto_id: string
  nome: string
  obrigatorio: boolean
  ordem: number
  opcoes?: Opcao[]
}

export interface Opcao {
  id: string
  grupo_id: string
  nome: string
  tipo_acrescimo: TipoAcrescimo
  valor: number
  ativo: boolean
  ordem: number
}

export interface Adicional {
  id: string
  empresa_id: string
  nome: string
  tipo: TipoAdicional
  valor: number
  marcado_por_padrao: boolean
  ativo: boolean
  ordem: number
}

export interface AdicionalSnapshot {
  id: string
  nome: string
  tipo: TipoAdicional
  valor: number
  marcado: boolean
  valor_calculado: number
}

export interface OrcamentoItem {
  id?: string
  orcamento_id?: string
  produto_nome: string
  descricao: string
  largura_cm: number | null
  altura_cm: number | null
  quantidade: number
  area_m2: number | null
  valor_unitario: number
  valor_total: number
  snapshot: OrcamentoItemSnapshot
}

export interface OrcamentoItemSnapshot {
  produto_id: string
  produto_nome: string
  tipo_cobranca: TipoCobranca
  preco_base: number
  area_minima: number
  valor_minimo: number
  largura_cm: number | null
  altura_cm: number | null
  area_m2: number | null
  opcoes_selecionadas: OpcaoSnapshot[]
}

export interface OpcaoSnapshot {
  grupo_id: string
  grupo_nome: string
  opcao_id: string
  opcao_nome: string
  tipo_acrescimo: TipoAcrescimo
  valor: number
}

export interface Orcamento {
  id: string
  empresa_id: string
  numero: number
  token_publico: string
  cliente_nome: string
  cliente_telefone: string | null
  cliente_endereco: string | null
  status: StatusOrcamento
  subtotal: number
  desconto_tipo: TipoDesconto | null
  desconto_valor: number
  desconto_total: number
  adicionais_snapshot: AdicionalSnapshot[]
  total: number
  validade_ate: string | null
  observacoes: string | null
  criado_por: string | null
  created_at: string
  itens?: OrcamentoItem[]
}

export interface OrcamentoPublico {
  orcamento: Omit<Orcamento, 'empresa_id' | 'criado_por' | 'itens'>
  itens: OrcamentoItem[]
  empresa: Pick<Empresa, 'nome' | 'logo_url' | 'cor_primaria' | 'whatsapp' | 'endereco' | 'texto_topo' | 'condicoes_pagamento' | 'prazo_entrega_padrao'>
}

export interface ItemRascunho {
  tempId: string
  produto: Produto
  produto_nome: string
  opcoesSelecionadas: Record<string, Opcao>
  largura_cm: number | null
  altura_cm: number | null
  quantidade: number
  area_m2: number | null
  valor_unitario: number
  valor_total: number
  descricao: string
  snapshot: OrcamentoItemSnapshot
}
