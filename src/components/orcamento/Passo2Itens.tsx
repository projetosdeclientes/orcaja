'use client'
import { useState, useEffect } from 'react'
import { Trash2, Plus, Minus, ArrowLeft, ArrowRight, Layers, Ruler, DollarSign, CheckCircle2 } from 'lucide-react'
import { nanoid } from 'nanoid'
import { toast } from 'sonner'
import type { Produto, Opcao, ItemRascunho } from '@/types'
import { calcularItem, calcularDescricao, r2 } from '@/lib/calculos'
import { toBRL } from '@/lib/formatters'

interface Props {
  produtos: Produto[]
  itens: ItemRascunho[]
  onItensChange: (itens: ItemRascunho[]) => void
  onBack: () => void
  onNext: () => void
}

function buildOpcoesSelecionadas(produto: Produto): Record<string, Opcao> {
  const result: Record<string, Opcao> = {}
  for (const grupo of produto.grupos ?? []) {
    const first = grupo.opcoes?.find(o => o.ativo)
    if (first) result[grupo.id] = first
  }
  return result
}

export default function Passo2Itens({ produtos, itens, onItensChange, onBack, onNext }: Props) {
  const [produtoId, setProdutoId] = useState(produtos[0]?.id ?? '')
  const [opcoesSelecionadas, setOpcoesSelecionadas] = useState<Record<string, Opcao>>({})
  const [largura, setLargura] = useState('')
  const [altura, setAltura] = useState('')
  const [quantidade, setQuantidade] = useState(1)
  const [erroMedida, setErroMedida] = useState<string | null>(null)

  const produto = produtos.find(p => p.id === produtoId) ?? produtos[0]

  useEffect(() => {
    if (produto) {
      setOpcoesSelecionadas(buildOpcoesSelecionadas(produto))
    }
  }, [produtoId])

  // Cálculo em tempo real
  const larguraN = largura ? parseFloat(largura.replace(',', '.')) : null
  const alturaN = altura ? parseFloat(altura.replace(',', '.')) : null

  const calculado = produto
    ? calcularItem({
        produto,
        largura_cm: larguraN,
        altura_cm: alturaN,
        quantidade,
        opcoesSelecionadas: Object.values(opcoesSelecionadas),
      })
    : { area_m2: null, valor_unitario: 0, valor_total: 0 }

  function validarMedidas(): boolean {
    if (!produto) return false
    const erros = []
    if (produto.tipo_cobranca !== 'unidade') {
      if (!larguraN || !alturaN) {
        erros.push('Informe a largura e a altura do item.')
      } else {
        if (produto.largura_min && larguraN < produto.largura_min)
          erros.push(`Largura mínima permitida: ${produto.largura_min} cm.`)
        if (produto.largura_max && larguraN > produto.largura_max)
          erros.push(`Largura máxima permitida: ${produto.largura_max} cm.`)
        if (produto.altura_min && alturaN < produto.altura_min)
          erros.push(`Altura mínima permitida: ${produto.altura_min} cm.`)
        if (produto.altura_max && alturaN > produto.altura_max)
          erros.push(`Altura máxima permitida: ${produto.altura_max} cm.`)
      }
    }
    for (const grupo of produto.grupos ?? []) {
      if (grupo.obrigatorio && !opcoesSelecionadas[grupo.id])
        erros.push(`Selecione uma opção para ${grupo.nome}.`)
    }
    if (erros.length > 0) {
      setErroMedida(erros.join(' '))
      return false
    }
    setErroMedida(null)
    return true
  }

  function adicionarItem() {
    if (!produto) return
    if (!validarMedidas()) {
      toast.error(erroMedida || 'Verifique as medidas do item.')
      return
    }
    const descricao = calcularDescricao(Object.values(opcoesSelecionadas))
    const item: ItemRascunho = {
      tempId: nanoid(),
      produto,
      produto_nome: produto.nome,
      opcoesSelecionadas,
      largura_cm: larguraN,
      altura_cm: alturaN,
      quantidade,
      ...calculado,
      descricao,
      snapshot: {
        produto_id: produto.id,
        produto_nome: produto.nome,
        tipo_cobranca: produto.tipo_cobranca,
        preco_base: produto.preco_base,
        area_minima: produto.area_minima,
        valor_minimo: produto.valor_minimo,
        largura_cm: larguraN,
        altura_cm: alturaN,
        area_m2: calculado.area_m2,
        opcoes_selecionadas: Object.values(opcoesSelecionadas).map(o => ({
          grupo_id: o.grupo_id,
          grupo_nome: produto.grupos?.find(g => g.id === o.grupo_id)?.nome ?? '',
          opcao_id: o.id,
          opcao_nome: o.nome,
          tipo_acrescimo: o.tipo_acrescimo,
          valor: o.valor,
        })),
      },
    }
    onItensChange([...itens, item])
    setLargura('')
    setAltura('')
    setQuantidade(1)
    setErroMedida(null)
    toast.success(`${produto.nome} adicionado com sucesso!`)
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
      {/* Coluna 1 (Desktop 7 cols): Formulário de Configuração do Item */}
      <div className="lg:col-span-7 space-y-5 bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm">
        <div>
          <h3 className="text-lg font-bold text-slate-900 tracking-tight">
            Configurar Item do Orçamento
          </h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Escolha o modelo, informe as dimensões e selecione os acabamentos.
          </p>
        </div>

        {/* Produto */}
        <div>
          <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
            Tipo de Produto / Serviço
          </label>
          <div className="relative">
            <select
              id="select-produto"
              value={produtoId}
              onChange={e => setProdutoId(e.target.value)}
              className="w-full pl-4 pr-10 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-sm font-semibold focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
            >
              {produtos.map(p => (
                <option key={p.id} value={p.id}>
                  {p.nome} — a partir de {toBRL(p.preco_base)} {p.tipo_cobranca === 'area' ? '/m²' : ''}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Grupos de Opções */}
        {produto?.grupos && produto.grupos.length > 0 && (
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Opções & Acabamentos
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {produto.grupos.map(grupo => (
                <div key={grupo.id}>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    {grupo.nome} {grupo.obrigatorio && <span className="text-red-500">*</span>}
                  </label>
                  <select
                    id={`grupo-${grupo.id}`}
                    value={opcoesSelecionadas[grupo.id]?.id ?? ''}
                    onChange={e => {
                      const opcao = grupo.opcoes?.find(o => o.id === e.target.value)
                      if (opcao) setOpcoesSelecionadas(prev => ({ ...prev, [grupo.id]: opcao }))
                    }}
                    className="w-full px-3.5 py-3 rounded-xl border border-slate-200 bg-slate-50/50 text-slate-900 text-xs font-medium focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                  >
                    {!grupo.obrigatorio && <option value="">Nenhuma / Padrão</option>}
                    {grupo.opcoes?.filter(o => o.ativo).map(o => (
                      <option key={o.id} value={o.id}>
                        {o.nome} {o.valor > 0 ? `(+${toBRL(o.valor)})` : ''}
                      </option>
                    ))}
                  </select>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Medidas (se cobrança por área ou linear) */}
        {produto?.tipo_cobranca !== 'unidade' && (
          <div className="pt-2 border-t border-slate-100 space-y-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Medidas em Centímetros
            </span>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Largura (cm)
                </label>
                <div className="relative">
                  <input
                    id="largura-cm"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={largura}
                    onChange={e => setLargura(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-base font-bold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                    cm
                  </span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Altura (cm)
                </label>
                <div className="relative">
                  <input
                    id="altura-cm"
                    type="number"
                    inputMode="decimal"
                    min="1"
                    value={altura}
                    onChange={e => setAltura(e.target.value)}
                    className="w-full px-4 py-3.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-slate-900 text-base font-bold text-center focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                    placeholder="0"
                  />
                  <span className="absolute right-3.5 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold pointer-events-none">
                    cm
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quantidade */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Quantidade de Peças
            </label>
            <span className="text-xs text-slate-400">Total de unidades deste item</span>
          </div>

          <div className="flex items-center gap-3 bg-slate-100 p-1.5 rounded-2xl">
            <button
              type="button"
              onClick={() => setQuantidade(q => Math.max(1, q - 1))}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs active:scale-95 transition-transform"
            >
              <Minus size={16} />
            </button>
            <span className="text-lg font-black text-slate-800 w-8 text-center">{quantidade}</span>
            <button
              type="button"
              onClick={() => setQuantidade(q => q + 1)}
              className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-slate-700 hover:text-slate-900 shadow-2xs active:scale-95 transition-transform"
            >
              <Plus size={16} />
            </button>
          </div>
        </div>

        {erroMedida && (
          <p className="text-red-600 text-xs bg-red-50 p-3 rounded-xl border border-red-100 font-medium">
            {erroMedida}
          </p>
        )}
      </div>

      {/* Coluna 2 (Desktop 5 cols): Cálculo em Tempo Real & Lista de Itens */}
      <div className="lg:col-span-5 space-y-4 lg:sticky lg:top-24">
        {/* Card de Cálculo em Tempo Real */}
        <div
          className="rounded-3xl p-5 sm:p-6 text-white shadow-lg space-y-3"
          style={{
            background: 'linear-gradient(135deg, var(--cor-primaria) 0%, #1e40af 100%)',
          }}
        >
          <div className="flex justify-between items-center text-blue-100 text-xs">
            <span className="font-semibold uppercase tracking-wider">Cálculo do Item</span>
            {calculado.area_m2 != null && (
              <span className="bg-white/20 px-2 py-0.5 rounded-md font-bold">
                {calculado.area_m2.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} m²
              </span>
            )}
          </div>

          <div>
            <span className="text-xs text-blue-200 block">Subtotal deste produto:</span>
            <span className="text-3xl sm:text-4xl font-black tracking-tight block">
              {toBRL(calculado.valor_total)}
            </span>
            {quantidade > 1 && (
              <span className="text-xs text-blue-200 block mt-1">
                {quantidade} peças × {toBRL(calculado.valor_unitario)} cada
              </span>
            )}
          </div>

          <button
            id="btn-adicionar-item"
            type="button"
            onClick={adicionarItem}
            className="w-full py-3.5 px-4 rounded-2xl font-black text-slate-900 bg-white hover:bg-slate-50 shadow-md active:scale-[0.99] transition-all text-sm flex items-center justify-center gap-2 mt-2"
          >
            <Plus size={18} strokeWidth={2.5} />
            <span>Adicionar ao Orçamento</span>
          </button>
        </div>

        {/* Lista de Itens Já Adicionados */}
        <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-3">
          <div className="flex justify-between items-center">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Itens no Orçamento ({itens.length})
            </span>
            <span className="text-xs font-bold text-slate-800">
              Total: {toBRL(itens.reduce((acc, i) => acc + i.valor_total, 0))}
            </span>
          </div>

          {itens.length === 0 ? (
            <div className="py-6 text-center text-slate-400 text-xs border-2 border-dashed border-slate-100 rounded-2xl">
              Nenhum item adicionado ainda. Preencha as medidas ao lado e clique em adicionar.
            </div>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
              {itens.map((item, idx) => (
                <div
                  key={item.tempId}
                  className="flex items-center gap-3 bg-slate-50 rounded-2xl p-3 border border-slate-100 text-xs"
                >
                  <div className="flex-1 min-w-0">
                    <p className="font-bold text-slate-900 truncate">
                      {item.quantidade}x {item.produto_nome}
                    </p>
                    {item.largura_cm && item.altura_cm && (
                      <p className="text-[11px] text-slate-500">
                        {item.largura_cm} × {item.altura_cm} cm
                      </p>
                    )}
                    <p className="font-bold text-slate-800 mt-0.5">{toBRL(item.valor_total)}</p>
                  </div>
                  <button
                    id={`btn-remover-item-${idx}`}
                    type="button"
                    onClick={() => onItensChange(itens.filter(i => i.tempId !== item.tempId))}
                    className="p-2 text-slate-400 hover:text-red-600 rounded-xl hover:bg-red-50 transition-colors"
                    title="Remover item"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Navegação Voltar / Avançar */}
          <div className="pt-2 flex gap-2.5">
            <button
              id="btn-voltar-p2"
              type="button"
              onClick={onBack}
              className="flex-1 py-3.5 rounded-2xl font-bold border border-slate-200 text-slate-600 hover:bg-slate-50 text-xs transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft size={16} />
              <span>Voltar</span>
            </button>
            <button
              id="btn-continuar-p2"
              type="button"
              onClick={() => {
                if (itens.length === 0) {
                  toast.error('Adicione ao menos um item ao orçamento antes de continuar.')
                  return
                }
                onNext()
              }}
              className="flex-2 py-3.5 rounded-2xl font-bold text-white text-xs shadow-md transition-all active:scale-[0.99] flex items-center justify-center gap-1.5"
              style={{ background: 'var(--cor-primaria)' }}
            >
              <span>Avançar para Resumo</span>
              <ArrowRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
