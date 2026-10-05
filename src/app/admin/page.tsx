'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Shield, ArrowLeft, Building2, Calendar, Phone, CheckCircle2, AlertTriangle, Power, ExternalLink } from 'lucide-react'
import type { Empresa } from '@/types'
import { toDateBR } from '@/lib/formatters'
import { toast } from 'sonner'

export default function AdminPage() {
  const [empresas, setEmpresas] = useState<Empresa[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/admin/empresas')
        if (res.ok) {
          const data = await res.json()
          setEmpresas(data)
        }
      } catch {
        toast.error('Erro ao carregar empresas.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  async function toggleStatus(id: string) {
    try {
      const res = await fetch('/api/admin/empresas', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })
      if (res.ok) {
        const data = await res.json()
        setEmpresas(empresas.map(e => (e.id === id ? data.empresa : e)))
        toast.success(
          `Empresa "${data.empresa.nome}" ${data.empresa.ativo ? 'reativada' : 'suspensa'} com sucesso!`
        )
      } else {
        toast.error('Erro ao alternar status.')
      }
    } catch {
      toast.error('Erro de conexão ao alterar status.')
    }
  }

  const ativas = empresas.filter(e => e.ativo).length
  const suspensas = empresas.filter(e => !e.ativo).length

  return (
    <div className="min-h-screen bg-slate-100 py-6 px-4 sm:px-6 lg:px-8">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Top Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-5 sm:p-6 rounded-3xl border border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shadow-2xs">
              <Shield size={24} />
            </div>
            <div>
              <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                Painel Super Admin
              </h1>
              <p className="text-xs text-slate-500 mt-0.5">
                Gestão central multi-tenant: empresas parceiras, assinaturas e status
              </p>
            </div>
          </div>

          <Link
            href="/novo"
            className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-2xl border border-slate-200 text-xs font-bold text-slate-700 bg-slate-50 hover:bg-slate-100 transition-colors shadow-2xs"
          >
            <ArrowLeft size={15} />
            <span>Voltar ao Sistema</span>
          </Link>
        </div>

        {/* KPIs Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
              Total de Empresas
            </span>
            <p className="text-3xl font-black text-slate-900">{empresas.length}</p>
            <span className="text-[11px] text-slate-400">Instâncias cadastradas</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-emerald-200/90 bg-emerald-50/20 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-600 block">
              Empresas Ativas
            </span>
            <p className="text-3xl font-black text-emerald-700">{ativas}</p>
            <span className="text-[11px] text-emerald-600">Acesso normal liberado</span>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-amber-200/90 bg-amber-50/20 shadow-sm space-y-1">
            <span className="text-xs font-bold uppercase tracking-wider text-amber-600 block">
              Bloqueadas / Suspensas
            </span>
            <p className="text-3xl font-black text-amber-700">{suspensas}</p>
            <span className="text-[11px] text-amber-600">Aguardando regularização</span>
          </div>
        </div>

        {/* Lista de Empresas */}
        <div className="space-y-3">
          <div className="flex items-center justify-between px-1">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Empresas Contratantes ({empresas.length})
            </span>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-400 text-xs">Carregando empresas...</div>
          ) : (
            <div className="grid grid-cols-1 gap-3">
              {empresas.map(emp => (
                <div
                  key={emp.id}
                  className="bg-white rounded-3xl p-5 sm:p-6 border border-slate-200/90 shadow-sm hover:shadow-md transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded-full shrink-0 shadow-xs"
                        style={{ background: emp.cor_primaria || '#0F62FE' }}
                      />
                      <h3 className="font-extrabold text-slate-900 text-base">{emp.nome}</h3>
                      <span
                        className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full ${
                          emp.ativo
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                            : 'bg-red-50 text-red-600 border border-red-200/80'
                        }`}
                      >
                        {emp.ativo ? 'Ativa' : 'Suspensa'}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-x-5 gap-y-1 text-xs text-slate-500">
                      {emp.whatsapp && (
                        <span className="flex items-center gap-1.5">
                          <Phone size={13} className="text-slate-400" />
                          <span>{emp.whatsapp}</span>
                        </span>
                      )}
                      {emp.pago_ate && (
                        <span className="flex items-center gap-1.5">
                          <Calendar size={13} className="text-slate-400" />
                          <span>Mensalidade paga até: {toDateBR(emp.pago_ate)}</span>
                        </span>
                      )}
                      {emp.observacoes_admin && (
                        <span className="text-slate-400 italic">
                          ({emp.observacoes_admin})
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                    <button
                      type="button"
                      onClick={() => toggleStatus(emp.id)}
                      className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all active:scale-95 ${
                        emp.ativo
                          ? 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200/70'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/70'
                      }`}
                    >
                      <Power size={14} />
                      <span>{emp.ativo ? 'Suspender Acesso' : 'Reativar Empresa'}</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
