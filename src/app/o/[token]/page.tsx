'use client'
import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import {
  MessageSquare,
  Printer,
  Calendar,
  MapPin,
  Clock,
  CreditCard,
  CheckCircle2,
  Shield,
  Building2,
  Phone,
} from 'lucide-react'
import type { OrcamentoPublico, OrcamentoItem } from '@/types'
import { toBRL, toDateBR, formatarNumero, waLink, aplicarCorPrimaria } from '@/lib/formatters'

export default function OrcamentoPublicoPage() {
  const params = useParams()
  const token = params?.token as string

  const [data, setData] = useState<OrcamentoPublico | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch(`/api/public/orcamento/${token}`)
        if (res.ok) {
          const json = await res.json()
          setData(json)
          if (json.empresa?.cor_primaria) {
            aplicarCorPrimaria(json.empresa.cor_primaria)
          }
        } else {
          setError('Orçamento não encontrado ou link expirado.')
        }
      } catch {
        setError('Erro ao carregar proposta comercial.')
      } finally {
        setLoading(false)
      }
    }
    if (token) carregar()
  }, [token])

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="text-center space-y-2">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-slate-500 text-sm font-medium">Carregando orçamento...</p>
        </div>
      </div>
    )
  }

  if (error || !data) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="bg-white max-w-md w-full rounded-2xl p-8 border border-slate-200 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto">
            !
          </div>
          <h2 className="text-lg font-bold text-slate-800">Orçamento Indisponível</h2>
          <p className="text-sm text-slate-500">{error || 'Link não encontrado.'}</p>
        </div>
      </div>
    )
  }

  const { orcamento, itens, empresa } = data

  const mensagemAprovacao = `Olá! Gostaria de confirmar e aprovar o orçamento nº ${formatarNumero(
    orcamento.numero
  )} no valor de ${toBRL(orcamento.total)} emitido para ${orcamento.cliente_nome}. Como podemos prosseguir?`

  return (
    <div className="min-h-screen bg-slate-100 py-6 sm:py-10 px-4 sm:px-6 lg:px-8 print:bg-white print:p-0">
      <div className="max-w-4xl mx-auto space-y-6 print-container">
        {/* Top actions bar - hidden on print */}
        <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-4 rounded-3xl border border-slate-200/90 shadow-sm">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
            Proposta Comercial Interativa
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors shadow-2xs"
            >
              <Printer size={15} />
              <span>Imprimir / PDF</span>
            </button>
            {empresa.whatsapp && (
              <a
                href={waLink(empresa.whatsapp, mensagemAprovacao)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-2xl font-bold text-xs text-white shadow-sm transition-transform active:scale-95 bg-emerald-600 hover:bg-emerald-700"
              >
                <MessageSquare size={15} />
                <span>Aprovar no WhatsApp</span>
              </a>
            )}
          </div>
        </div>

        {/* Main Proposal Document */}
        <div className="bg-white rounded-3xl p-6 md:p-8 border border-slate-200/90 shadow-sm space-y-6">
          {/* Header Empresa & Número */}
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 pb-6 border-b border-slate-100">
            <div className="flex items-center gap-3.5">
              {empresa.logo_url ? (
                <img
                  src={empresa.logo_url}
                  alt={empresa.nome}
                  className="w-14 h-14 object-contain rounded-2xl border border-slate-100"
                />
              ) : (
                <div
                  className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-xl shadow-md"
                  style={{ background: 'var(--cor-primaria)' }}
                >
                  {empresa.nome[0] ?? 'O'}
                </div>
              )}
              <div>
                <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
                  {empresa.nome}
                </h1>
                {empresa.endereco && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin size={12} className="text-slate-400 shrink-0" />
                    <span>{empresa.endereco}</span>
                  </p>
                )}
                {empresa.whatsapp && (
                  <p className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <Phone size={12} className="text-slate-400 shrink-0" />
                    <span>WhatsApp: {empresa.whatsapp}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="sm:text-right">
              <span className="inline-block text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 mb-1">
                Orçamento Nº {formatarNumero(orcamento.numero)}
              </span>
              <p className="text-xs text-slate-400">
                Emissão: {toDateBR(orcamento.created_at)}
              </p>
              {orcamento.validade_ate && (
                <p className="text-xs font-semibold text-emerald-600 mt-0.5">
                  Válido até {toDateBR(orcamento.validade_ate)}
                </p>
              )}
            </div>
          </div>

          {/* Dados do Cliente */}
          <div className="bg-slate-50/80 rounded-2xl p-4 border border-slate-100 space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400 block">
              Preparado para:
            </span>
            <p className="text-base font-bold text-slate-900">{orcamento.cliente_nome}</p>
            {orcamento.cliente_telefone && (
              <p className="text-xs text-slate-600">{orcamento.cliente_telefone}</p>
            )}
            {orcamento.cliente_endereco && (
              <p className="text-xs text-slate-500">{orcamento.cliente_endereco}</p>
            )}
          </div>

          {/* Tabela de Itens */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3">
              Detalhamento dos Itens
            </h3>
            <div className="divide-y divide-slate-100 border border-slate-100 rounded-2xl overflow-hidden">
              {itens.map((item, idx) => (
                <div key={item.id || idx} className="p-4 flex justify-between items-start text-sm">
                  <div className="pr-4 space-y-0.5">
                    <div className="font-bold text-slate-900">
                      {item.quantidade}x {item.produto_nome}
                    </div>
                    {item.largura_cm && item.altura_cm && (
                      <div className="text-xs text-slate-500 font-medium">
                        Medidas: {item.largura_cm} × {item.altura_cm} cm
                        {item.area_m2 ? ` (${item.area_m2} m²)` : ''}
                      </div>
                    )}
                    {item.descricao && (
                      <div className="text-xs text-slate-400">{item.descricao}</div>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="font-bold text-slate-900 text-base">
                      {toBRL(item.valor_total)}
                    </span>
                    {item.quantidade > 1 && (
                      <span className="text-xs text-slate-400 block">
                        {toBRL(item.valor_unitario)} cada
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Resumo Financeiro */}
          <div className="bg-slate-50/90 rounded-2xl p-5 border border-slate-100 space-y-2.5 text-sm">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{toBRL(orcamento.subtotal)}</span>
            </div>

            {orcamento.adicionais_snapshot
              ?.filter(a => a.marcado)
              .map(ad => (
                <div key={ad.id} className="flex justify-between text-slate-600 text-xs">
                  <span>{ad.nome}</span>
                  <span>+ {toBRL(ad.valor_calculado)}</span>
                </div>
              ))}

            {orcamento.desconto_total > 0 && (
              <div className="flex justify-between text-emerald-600 font-semibold text-xs">
                <span>Desconto especial</span>
                <span>- {toBRL(orcamento.desconto_total)}</span>
              </div>
            )}

            <div className="pt-3 border-t border-slate-200 flex justify-between items-baseline">
              <span className="text-base font-extrabold text-slate-900">Valor Total</span>
              <span
                className="text-2xl font-black"
                style={{ color: 'var(--cor-primaria)' }}
              >
                {toBRL(orcamento.total)}
              </span>
            </div>
          </div>

          {/* Condições de Pagamento e Prazo */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            {empresa.condicoes_pagamento && (
              <div className="bg-blue-50/50 border border-blue-100/80 rounded-2xl p-3.5 space-y-1">
                <span className="font-bold text-blue-900 flex items-center gap-1.5">
                  <CreditCard size={14} className="text-blue-600" />
                  Condições de Pagamento
                </span>
                <p className="text-blue-800/80">{empresa.condicoes_pagamento}</p>
              </div>
            )}

            {empresa.prazo_entrega_padrao && (
              <div className="bg-emerald-50/50 border border-emerald-100/80 rounded-2xl p-3.5 space-y-1">
                <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                  <Clock size={14} className="text-emerald-600" />
                  Prazo de Entrega
                </span>
                <p className="text-emerald-800/80">{empresa.prazo_entrega_padrao}</p>
              </div>
            )}
          </div>

          {/* Observações */}
          {orcamento.observacoes && (
            <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-100 text-xs text-slate-600">
              <span className="font-bold text-slate-700 block mb-1">Observações:</span>
              <p>{orcamento.observacoes}</p>
            </div>
          )}

          {/* CTA Box de Aprovação - hidden on print */}
          {empresa.whatsapp && (
            <div className="no-print pt-2">
              <a
                href={waLink(empresa.whatsapp, mensagemAprovacao)}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full py-4 px-6 rounded-2xl font-bold text-white text-base flex items-center justify-center gap-2.5 shadow-lg shadow-emerald-600/25 transition-transform active:scale-[0.99] bg-emerald-600 hover:bg-emerald-700"
              >
                <CheckCircle2 size={22} />
                <span>Aprovar Este Orçamento via WhatsApp</span>
              </a>
              <p className="text-center text-xs text-slate-400 mt-2">
                Ao clicar, você enviará uma mensagem direta para {empresa.nome}.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
