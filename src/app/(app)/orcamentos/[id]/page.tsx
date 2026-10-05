'use client'
import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  MessageSquare,
  Printer,
  ExternalLink,
  Copy,
  Check,
  Calendar,
  MapPin,
  Phone,
  User,
  Clock,
} from 'lucide-react'
import type { Orcamento, StatusOrcamento } from '@/types'
import StatusBadge from '@/components/shared/StatusBadge'
import { toBRL, toDateBR, formatarNumero, waLink } from '@/lib/formatters'
import { toast } from 'sonner'

export default function OrcamentoDetalhePage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [orcamento, setOrcamento] = useState<Orcamento | null>(null)
  const [loading, setLoading] = useState(true)
  const [updatingStatus, setUpdatingStatus] = useState(false)
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/orcamentos/${id}`)
        if (res.ok) {
          const data = await res.json()
          setOrcamento(data)
        } else {
          toast.error('Orçamento não encontrado.')
          router.push('/orcamentos')
        }
      } catch {
        toast.error('Erro ao carregar orçamento.')
      } finally {
        setLoading(false)
      }
    }
    if (id) carregar()
  }, [id, router])

  async function mudarStatus(novoStatus: StatusOrcamento) {
    if (!orcamento) return
    setUpdatingStatus(true)
    try {
      const res = await fetch(`/api/orcamentos/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: novoStatus }),
      })
      if (res.ok) {
        setOrcamento({ ...orcamento, status: novoStatus })
        toast.success(`Status atualizado para "${novoStatus.toUpperCase()}"!`)
      } else {
        toast.error('Erro ao alterar status.')
      }
    } catch {
      toast.error('Erro de conexão ao alterar status.')
    } finally {
      setUpdatingStatus(false)
    }
  }

  function copiarLinkPublico() {
    if (!orcamento) return
    const url = `${window.location.origin}/o/${orcamento.token_publico}`
    navigator.clipboard.writeText(url)
    setCopied(true)
    toast.success('Link público copiado para a área de transferência!')
    setTimeout(() => setCopied(false), 2500)
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Carregando detalhes da proposta...
      </div>
    )
  }

  if (!orcamento) return null

  const linkPublico = `${typeof window !== 'undefined' ? window.location.origin : ''}/o/${orcamento.token_publico}`
  const whatsMsg = `Olá, ${orcamento.cliente_nome}! Segue seu orçamento nº ${formatarNumero(
    orcamento.numero
  )} no valor de ${toBRL(orcamento.total)}. Veja todos os detalhes aqui: ${linkPublico}`

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Top Bar Navigation */}
      <div className="flex items-center justify-between">
        <Link
          href="/orcamentos"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-slate-900 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs transition-colors"
        >
          <ArrowLeft size={16} />
          <span>Voltar para Orçamentos</span>
        </Link>

        <div className="flex items-center gap-2">
          <StatusBadge status={orcamento.status} />
          <button
            type="button"
            onClick={() => window.print()}
            className="hidden sm:inline-flex items-center gap-1.5 text-xs font-bold text-slate-700 bg-white px-3.5 py-2 rounded-2xl border border-slate-200/90 shadow-2xs hover:bg-slate-50 transition-colors"
          >
            <Printer size={15} />
            <span>Imprimir</span>
          </button>
        </div>
      </div>

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-5 sm:p-7 border border-slate-200/90 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">
            Orçamento Comercial #{formatarNumero(orcamento.numero)}
          </span>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight mt-0.5">
            {orcamento.cliente_nome}
          </h1>
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
            <Clock size={13} />
            <span>Criado em {toDateBR(orcamento.created_at)}</span>
            {orcamento.validade_ate && (
              <>
                <span>·</span>
                <span className="text-emerald-600 font-semibold">
                  Válido até {toDateBR(orcamento.validade_ate)}
                </span>
              </>
            )}
          </div>
        </div>

        <div className="sm:text-right pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <span className="text-xs uppercase font-bold text-slate-400 block">Valor Total</span>
          <span
            className="text-3xl sm:text-4xl font-black text-slate-900 block"
            style={{ color: 'var(--cor-primaria)' }}
          >
            {toBRL(orcamento.total)}
          </span>
        </div>
      </div>

      {/* Grid Responsivo (2 Colunas no Desktop) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Coluna Principal (7 cols): Dados do Cliente, Itens e Observações */}
        <div className="lg:col-span-7 space-y-5">
          {/* Dados do Cliente */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Dados do Cliente
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div className="flex items-center gap-2 text-slate-700">
                <User size={16} className="text-slate-400 shrink-0" />
                <span className="font-bold">{orcamento.cliente_nome}</span>
              </div>
              {orcamento.cliente_telefone && (
                <div className="flex items-center gap-2 text-slate-600">
                  <Phone size={16} className="text-slate-400 shrink-0" />
                  <span className="font-semibold">{orcamento.cliente_telefone}</span>
                </div>
              )}
            </div>
            {orcamento.cliente_endereco && (
              <div className="flex items-center gap-2 text-xs text-slate-500 pt-2 border-t border-slate-100">
                <MapPin size={15} className="text-slate-400 shrink-0" />
                <span>{orcamento.cliente_endereco}</span>
              </div>
            )}
          </div>

          {/* Itens do Pedido */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Itens da Proposta ({orcamento.itens?.length || 0})
            </span>

            <div className="divide-y divide-slate-100">
              {orcamento.itens?.map((item, idx) => (
                <div key={item.id || idx} className="py-3.5 flex justify-between items-start text-sm">
                  <div className="pr-4 space-y-1">
                    <div className="font-bold text-slate-900 text-base">
                      {item.quantidade}x {item.produto_nome}
                    </div>
                    {item.largura_cm && item.altura_cm && (
                      <div className="text-xs text-slate-500 font-medium">
                        Dimensões: {item.largura_cm} × {item.altura_cm} cm
                        {item.area_m2 ? ` (${item.area_m2} m²)` : ''}
                      </div>
                    )}
                    {item.descricao && (
                      <div className="text-xs text-slate-400">{item.descricao}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-black text-slate-900 text-base block">
                      {toBRL(item.valor_total)}
                    </span>
                    {item.quantidade > 1 && (
                      <span className="text-xs text-slate-400 block mt-0.5">
                        {toBRL(item.valor_unitario)} cada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Observações */}
          {orcamento.observacoes && (
            <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Observações Adicionais
              </span>
              <p className="text-xs sm:text-sm text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100 leading-relaxed">
                {orcamento.observacoes}
              </p>
            </div>
          )}
        </div>

        {/* Coluna Lateral (5 cols): Status, Ações e Resumo Financeiro */}
        <div className="lg:col-span-5 space-y-5 lg:sticky lg:top-24">
          {/* Alterar Status */}
          <div className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm space-y-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Status Comercial
            </span>
            <div className="grid grid-cols-3 gap-2">
              {(['enviado', 'aprovado', 'perdido'] as StatusOrcamento[]).map(st => {
                const isCurrent = orcamento.status === st
                return (
                  <button
                    key={st}
                    type="button"
                    disabled={updatingStatus}
                    onClick={() => mudarStatus(st)}
                    className={`py-2.5 px-2 text-xs font-bold rounded-xl transition-all capitalize ${
                      isCurrent
                        ? st === 'aprovado'
                          ? 'bg-emerald-600 text-white shadow-xs'
                          : st === 'perdido'
                          ? 'bg-red-600 text-white shadow-xs'
                          : 'bg-blue-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    {st}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm space-y-3 text-sm">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Composição Financeira
            </span>
            <div className="flex justify-between text-slate-600 text-xs">
              <span>Subtotal dos itens</span>
              <span className="font-semibold">{toBRL(orcamento.subtotal)}</span>
            </div>

            {orcamento.adicionais_snapshot
              ?.filter(a => a.marcado)
              .map(ad => (
                <div key={ad.id} className="flex justify-between text-slate-600 text-xs">
                  <span>{ad.nome}</span>
                  <span className="font-semibold">+ {toBRL(ad.valor_calculado)}</span>
                </div>
              ))}

            {orcamento.desconto_total > 0 && (
              <div className="flex justify-between text-emerald-600 font-bold text-xs">
                <span>Desconto especial</span>
                <span>- {toBRL(orcamento.desconto_total)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Total</span>
              <span
                className="text-2xl font-black"
                style={{ color: 'var(--cor-primaria)' }}
              >
                {toBRL(orcamento.total)}
              </span>
            </div>
          </div>

          {/* Ações Rápidas */}
          <div className="space-y-2.5">
            {orcamento.cliente_telefone && (
              <a
                href={waLink(orcamento.cliente_telefone, whatsMsg)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-4 rounded-2xl font-bold text-white text-sm flex items-center justify-center gap-2 shadow-md shadow-emerald-600/20 transition-all hover:brightness-105 active:scale-[0.99] bg-emerald-600"
              >
                <MessageSquare size={18} />
                <span>Enviar Proposta no WhatsApp</span>
              </a>
            )}

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={copiarLinkPublico}
                className="py-3 px-3 rounded-2xl font-bold text-slate-700 text-xs flex items-center justify-center gap-1.5 border border-slate-200 bg-white hover:bg-slate-50 transition-colors shadow-2xs"
              >
                {copied ? <Check size={16} className="text-emerald-600" /> : <Copy size={16} />}
                <span>{copied ? 'Copiado!' : 'Copiar Link'}</span>
              </button>

              <Link
                href={`/o/${orcamento.token_publico}`}
                target="_blank"
                className="py-3 px-3 rounded-2xl font-bold text-xs flex items-center justify-center gap-1.5 border border-blue-200 text-blue-700 bg-blue-50 hover:bg-blue-100 transition-colors shadow-2xs"
              >
                <ExternalLink size={15} />
                <span>Ver Proposta</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
