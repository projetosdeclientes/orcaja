'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Search,
  Plus,
  MessageSquare,
  ChevronRight,
  TrendingUp,
  FileCheck2,
  Clock,
  FileText,
  DollarSign,
  Phone,
} from 'lucide-react'
import type { Orcamento, StatusOrcamento } from '@/types'
import StatusBadge from '@/components/shared/StatusBadge'
import { toBRL, formatarNumero, toRelativo, waLink, toDateBR } from '@/lib/formatters'

export default function OrcamentosPage() {
  const [orcamentos, setOrcamentos] = useState<Orcamento[]>([])
  const [loading, setLoading] = useState(true)
  const [filtroStatus, setFiltroStatus] = useState<string>('todos')
  const [busca, setBusca] = useState('')

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/orcamentos')
        if (res.ok) {
          const data = await res.json()
          setOrcamentos(data)
        }
      } catch (err) {
        console.error('Erro ao carregar orçamentos:', err)
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  const filtrados = orcamentos.filter(orc => {
    const matchesStatus = filtroStatus === 'todos' || orc.status === filtroStatus
    const term = busca.toLowerCase()
    const matchesBusca =
      !busca ||
      orc.cliente_nome.toLowerCase().includes(term) ||
      String(orc.numero).includes(term) ||
      (orc.cliente_telefone && orc.cliente_telefone.includes(term))
    return matchesStatus && matchesBusca
  })

  // Métricas
  const totalGeral = orcamentos.reduce((acc, o) => acc + o.total, 0)
  const aprovados = orcamentos.filter(o => o.status === 'aprovado')
  const totalAprovado = aprovados.reduce((acc, o) => acc + o.total, 0)
  const pendentes = orcamentos.filter(o => o.status === 'enviado')
  const ticketMedio = orcamentos.length > 0 ? totalGeral / orcamentos.length : 0

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Orçamentos
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Gerenciamento e acompanhamento de propostas comerciais emitidas
          </p>
        </div>

        <Link
          href="/novo"
          className="inline-flex items-center justify-center gap-2 px-5 py-3 rounded-2xl font-bold text-white text-sm shadow-md shadow-blue-600/20 transition-all hover:brightness-110 active:scale-95"
          style={{ background: 'var(--cor-primaria)' }}
        >
          <Plus size={18} strokeWidth={2.5} />
          <span>Criar Novo Orçamento</span>
        </Link>
      </div>

      {/* KPI Cards Grid (4 colunas no Desktop) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Total Orçado</span>
            <DollarSign size={18} className="text-blue-600" />
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            {toBRL(totalGeral)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium block">
            {orcamentos.length} propostas cadastradas
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-emerald-200/90 bg-emerald-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-emerald-600">
            <span className="text-xs font-bold uppercase tracking-wider">Aprovados</span>
            <FileCheck2 size={18} />
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-emerald-700 tracking-tight truncate">
            {toBRL(totalAprovado)}
          </p>
          <span className="text-[11px] text-emerald-600 font-semibold block">
            {aprovados.length} pedidos fechados
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-blue-200/90 bg-blue-50/20 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-blue-600">
            <span className="text-xs font-bold uppercase tracking-wider">Aguardando</span>
            <Clock size={18} />
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-blue-700 tracking-tight truncate">
            {pendentes.length}
          </p>
          <span className="text-[11px] text-blue-500 font-medium block">
            Em negociação com cliente
          </span>
        </div>

        <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-bold uppercase tracking-wider">Ticket Médio</span>
            <TrendingUp size={18} className="text-slate-600" />
          </div>
          <p className="text-lg sm:text-2xl font-extrabold text-slate-900 tracking-tight truncate">
            {toBRL(ticketMedio)}
          </p>
          <span className="text-[11px] text-slate-400 font-medium block">
            Média por orçamento
          </span>
        </div>
      </div>

      {/* Barra de Filtros e Busca */}
      <div className="bg-white rounded-3xl p-4 border border-slate-200/90 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Input de Busca */}
        <div className="relative flex-1 max-w-md">
          <input
            type="text"
            value={busca}
            onChange={e => setBusca(e.target.value)}
            placeholder="Buscar por cliente, nº do orçamento ou telefone..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl border border-slate-200 bg-slate-50/50 text-sm focus:bg-white focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)] transition-all"
          />
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
        </div>

        {/* Filtros em Abas */}
        <div className="flex gap-1 overflow-x-auto pb-1 md:pb-0 text-xs font-bold no-scrollbar">
          {[
            { key: 'todos', label: `Todos (${orcamentos.length})` },
            { key: 'enviado', label: `Enviados (${pendentes.length})` },
            { key: 'aprovado', label: `Aprovados (${aprovados.length})` },
            { key: 'perdido', label: 'Perdidos' },
          ].map(f => (
            <button
              key={f.key}
              type="button"
              onClick={() => setFiltroStatus(f.key)}
              className={`px-3.5 py-2 rounded-xl transition-all whitespace-nowrap shrink-0 ${
                filtroStatus === f.key
                  ? 'bg-slate-900 text-white shadow-xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid de Orçamentos (Cards responsivos 1 col mobile, 2 ou 3 cols desktop) */}
      {loading ? (
        <div className="py-16 text-center text-slate-400 text-sm">Carregando lista de orçamentos...</div>
      ) : filtrados.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3 shadow-xs">
          <FileText className="mx-auto text-slate-300 w-12 h-12" />
          <h3 className="font-bold text-slate-800 text-base">Nenhum orçamento encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {busca || filtroStatus !== 'todos'
              ? 'Nenhum resultado corresponde aos filtros aplicados.'
              : 'Você ainda não possui orçamentos cadastrados. Crie o seu primeiro agora.'}
          </p>
          <div className="pt-2">
            <Link
              href="/novo"
              className="inline-flex items-center gap-1.5 text-xs font-bold text-white px-5 py-2.5 rounded-2xl shadow-md"
              style={{ background: 'var(--cor-primaria)' }}
            >
              <Plus size={16} />
              <span>Novo Orçamento</span>
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtrados.map(orc => (
            <div
              key={orc.id}
              className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm hover:shadow-md hover:border-slate-300 transition-all flex flex-col justify-between gap-4 group"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <span className="text-xs font-black text-slate-400 bg-slate-100 px-2 py-0.5 rounded-lg">
                    #{formatarNumero(orc.numero)}
                  </span>
                  <StatusBadge status={orc.status} />
                </div>

                <h3 className="font-extrabold text-slate-900 text-base group-hover:text-blue-600 transition-colors line-clamp-1">
                  {orc.cliente_nome}
                </h3>

                <div className="flex items-center gap-3 text-xs text-slate-400 mt-1">
                  <span>{toDateBR(orc.created_at)}</span>
                  <span>·</span>
                  <span>{toRelativo(orc.created_at)}</span>
                </div>

                {orc.itens && orc.itens.length > 0 && (
                  <p className="text-xs text-slate-500 mt-2 line-clamp-2 bg-slate-50 p-2 rounded-xl border border-slate-100/80">
                    {orc.itens.map(i => `${i.quantidade}x ${i.produto_nome}`).join(', ')}
                  </p>
                )}
              </div>

              <div>
                <div className="pt-3 border-t border-slate-100 flex items-baseline justify-between mb-3">
                  <span className="text-xs uppercase font-bold text-slate-400">Total</span>
                  <span
                    className="text-xl font-black text-slate-900"
                    style={{ color: 'var(--cor-primaria)' }}
                  >
                    {toBRL(orc.total)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {orc.cliente_telefone ? (
                    <a
                      href={waLink(
                        orc.cliente_telefone,
                        `Olá, ${orc.cliente_nome}! Segue seu orçamento nº ${formatarNumero(
                          orc.numero
                        )}. Acesse aqui: ${typeof window !== 'undefined' ? window.location.origin : ''}/o/${orc.token_publico}`
                      )}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex-1 py-2.5 px-3 rounded-xl font-bold text-xs text-emerald-700 bg-emerald-50 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <MessageSquare size={14} />
                      <span>WhatsApp</span>
                    </a>
                  ) : (
                    <span className="flex-1 py-2.5 px-3 rounded-xl font-medium text-xs text-slate-400 bg-slate-50 text-center">
                      Sem telefone
                    </span>
                  )}

                  <Link
                    href={`/orcamentos/${orc.id}`}
                    className="py-2.5 px-4 rounded-xl font-bold text-xs text-slate-700 bg-slate-100 hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                  >
                    <span>Detalhes</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
