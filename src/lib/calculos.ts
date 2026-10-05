import type { Produto, Opcao, AdicionalSnapshot, ItemRascunho, TipoAcrescimo } from '@/types'

// ─── Arredondamento ──────────────────────────────────────────
export function r2(n: number): number {
  return Math.round(n * 100) / 100
}

// ─── Cálculo de item individual ─────────────────────────────
export interface CalcItemInput {
  produto: Pick<Produto, 'tipo_cobranca' | 'preco_base' | 'area_minima' | 'valor_minimo'>
  largura_cm: number | null
  altura_cm: number | null
  quantidade: number
  opcoesSelecionadas: Opcao[]
}

export interface CalcItemResult {
  area_m2: number | null
  valor_unitario: number
  valor_total: number
}

export function calcularItem(input: CalcItemInput): CalcItemResult {
  const { produto, largura_cm, altura_cm, quantidade, opcoesSelecionadas } = input

  // 1. Área
  const area_m2 =
    largura_cm != null && altura_cm != null
      ? r2((largura_cm * altura_cm) / 10000)
      : null

  // 2. Área efetiva (respeitando mínimo)
  const areaEfetiva =
    area_m2 != null
      ? Math.max(area_m2, produto.area_minima ?? 0)
      : null

  // 3. Valor base do produto
  let valorBase = 0
  switch (produto.tipo_cobranca) {
    case 'area':
      valorBase = r2(produto.preco_base * (areaEfetiva ?? 0))
      break
    case 'linear':
      valorBase = r2(produto.preco_base * ((largura_cm ?? 0) / 100))
      break
    case 'unidade':
      valorBase = r2(produto.preco_base)
      break
  }

  // 4. Acréscimos de opções
  let acrescimos = 0
  for (const opcao of opcoesSelecionadas) {
    switch (opcao.tipo_acrescimo as TipoAcrescimo) {
      case 'fixo':
        acrescimos = r2(acrescimos + opcao.valor)
        break
      case 'por_m2':
        acrescimos = r2(acrescimos + opcao.valor * (areaEfetiva ?? 0))
        break
      case 'percentual':
        acrescimos = r2(acrescimos + (opcao.valor / 100) * valorBase)
        break
    }
  }

  // 5. Valor unitário (respeitando valor mínimo)
  const valorUnitario = r2(Math.max(valorBase + acrescimos, produto.valor_minimo ?? 0))

  // 6. Valor total
  const valorTotal = r2(valorUnitario * quantidade)

  return { area_m2, valor_unitario: valorUnitario, valor_total: valorTotal }
}

// ─── Cálculo de descrição do item ────────────────────────────
export function calcularDescricao(opcoesSelecionadas: Opcao[]): string {
  return opcoesSelecionadas.map(o => o.nome).join(', ')
}

// ─── Cálculo do orçamento completo ───────────────────────────
export interface CalcOrcamentoInput {
  itens: Array<{ valor_total: number }>
  adicionais: AdicionalSnapshot[]
  desconto_tipo: 'valor' | 'percentual' | null
  desconto_valor: number
}

export interface CalcOrcamentoResult {
  subtotal: number
  adicionais_total: number
  desconto_total: number
  total: number
}

export function calcularOrcamento(input: CalcOrcamentoInput): CalcOrcamentoResult {
  const { itens, adicionais, desconto_tipo, desconto_valor } = input

  // 6. Subtotal
  const subtotal = r2(itens.reduce((acc, i) => acc + i.valor_total, 0))

  // 7. Adicionais
  let adicionais_total = 0
  for (const ad of adicionais) {
    if (!ad.marcado) continue
    if (ad.tipo === 'fixo') {
      adicionais_total = r2(adicionais_total + ad.valor)
    } else {
      adicionais_total = r2(adicionais_total + (ad.valor / 100) * subtotal)
    }
  }

  const baseDesconto = r2(subtotal + adicionais_total)

  // 8. Desconto
  let desconto_total = 0
  if (desconto_tipo === 'valor') {
    desconto_total = r2(Math.min(desconto_valor, baseDesconto))
  } else if (desconto_tipo === 'percentual') {
    desconto_total = r2((desconto_valor / 100) * baseDesconto)
  }

  // 9. Total
  const total = r2(Math.max(0, baseDesconto - desconto_total))

  return { subtotal, adicionais_total, desconto_total, total }
}

// ─── Calcular adicionais snapshot ────────────────────────────
export function calcularAdicionaisSnapshot(
  adicionais: Array<{ id: string; nome: string; tipo: 'fixo' | 'percentual'; valor: number; marcado_por_padrao: boolean; ativo: boolean }>,
  subtotal: number,
  marcados?: Record<string, boolean>
): AdicionalSnapshot[] {
  return adicionais.filter(a => a.ativo).map(a => {
    const marcado = marcados != null ? (marcados[a.id] ?? a.marcado_por_padrao) : a.marcado_por_padrao
    const valor_calculado = marcado
      ? (a.tipo === 'fixo' ? r2(a.valor) : r2((a.valor / 100) * subtotal))
      : 0
    return { id: a.id, nome: a.nome, tipo: a.tipo, valor: a.valor, marcado, valor_calculado }
  })
}
