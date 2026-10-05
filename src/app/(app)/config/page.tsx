'use client'
import { useState, useEffect } from 'react'
import { Save, Building2, Palette, Phone, MapPin, Calendar, Clock, CreditCard, Tag, Sparkles } from 'lucide-react'
import type { Empresa, Produto, Adicional } from '@/types'
import { toBRL, aplicarCorPrimaria } from '@/lib/formatters'
import { toast } from 'sonner'

const CORES_SUGERIDAS = [
  { nome: 'Azul Real', hex: '#0F62FE' },
  { nome: 'Esmeralda', hex: '#059669' },
  { nome: 'Índigo Nobre', hex: '#4F46E5' },
  { nome: 'Violeta', hex: '#7C3AED' },
  { nome: 'Grafite', hex: '#334155' },
  { nome: 'Terracota', hex: '#EA580C' },
]

export default function ConfigPage() {
  const [empresa, setEmpresa] = useState<Empresa | null>(null)
  const [produtos, setProdutos] = useState<Produto[]>([])
  const [adicionais, setAdicionais] = useState<Adicional[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [abaAtiva, setAbaAtiva] = useState<'empresa' | 'produtos' | 'adicionais'>('empresa')

  useEffect(() => {
    async function carregar() {
      try {
        const res = await fetch('/api/config')
        if (res.ok) {
          const data = await res.json()
          setEmpresa(data.empresa)
          setProdutos(data.produtos)
          setAdicionais(data.adicionais)
        }
      } catch {
        toast.error('Erro ao carregar configurações.')
      } finally {
        setLoading(false)
      }
    }
    carregar()
  }, [])

  function atualizarEmpresa(campo: keyof Empresa, valor: any) {
    if (!empresa) return
    const atualizada = { ...empresa, [campo]: valor }
    setEmpresa(atualizada)
    if (campo === 'cor_primaria') {
      aplicarCorPrimaria(valor)
    }
  }

  async function handleSalvar(e: React.FormEvent) {
    e.preventDefault()
    if (!empresa) return
    setSaving(true)

    try {
      const res = await fetch('/api/config', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ empresa, produtos, adicionais }),
      })

      if (res.ok) {
        toast.success('Configurações da empresa salvas com sucesso!')
        if (empresa.cor_primaria) {
          aplicarCorPrimaria(empresa.cor_primaria)
        }
      } else {
        toast.error('Erro ao salvar alterações.')
      }
    } catch {
      toast.error('Erro de conexão ao salvar.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center text-slate-400 text-sm">
        Carregando configurações da empresa...
      </div>
    )
  }

  if (!empresa) return null

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4 sm:py-6 space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
          Configurações da Empresa
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Personalize a identidade da sua marca, padrões comerciais e catálogo de serviços.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 p-1.5 bg-white rounded-2xl border border-slate-200/90 shadow-2xs max-w-md text-xs font-bold">
        <button
          type="button"
          onClick={() => setAbaAtiva('empresa')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
            abaAtiva === 'empresa'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Identidade & Dados
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('produtos')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
            abaAtiva === 'produtos'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Produtos ({produtos.length})
        </button>
        <button
          type="button"
          onClick={() => setAbaAtiva('adicionais')}
          className={`flex-1 py-2.5 px-3 rounded-xl transition-all ${
            abaAtiva === 'adicionais'
              ? 'bg-slate-900 text-white shadow-xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Taxas & Serviços ({adicionais.length})
        </button>
      </div>

      <form onSubmit={handleSalvar} className="space-y-6">
        {abaAtiva === 'empresa' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: Identidade Visual e Contato */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Identidade Visual & Contato
              </span>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Nome da Empresa
                </label>
                <input
                  type="text"
                  required
                  value={empresa.nome}
                  onChange={e => atualizarEmpresa('nome', e.target.value)}
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Cor Principal do Sistema
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="color"
                    value={empresa.cor_primaria}
                    onChange={e => atualizarEmpresa('cor_primaria', e.target.value)}
                    className="w-12 h-12 rounded-2xl cursor-pointer border border-slate-200 p-1"
                  />
                  <div className="flex flex-wrap gap-2 flex-1">
                    {CORES_SUGERIDAS.map(c => (
                      <button
                        key={c.hex}
                        type="button"
                        onClick={() => atualizarEmpresa('cor_primaria', c.hex)}
                        className={`w-8 h-8 rounded-xl border-2 transition-transform active:scale-95 ${
                          empresa.cor_primaria === c.hex ? 'scale-110 border-slate-900 shadow-sm' : 'border-transparent'
                        }`}
                        style={{ background: c.hex }}
                        title={c.nome}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  WhatsApp Comercial (somente números)
                </label>
                <input
                  type="text"
                  value={empresa.whatsapp || ''}
                  onChange={e => atualizarEmpresa('whatsapp', e.target.value)}
                  placeholder="5511999999999"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Endereço Físico Completo
                </label>
                <input
                  type="text"
                  value={empresa.endereco || ''}
                  onChange={e => atualizarEmpresa('endereco', e.target.value)}
                  placeholder="Rua, número, cidade - UF"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                />
              </div>
            </div>

            {/* Card 2: Padrões Comerciais dos Orçamentos */}
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200/90 shadow-sm space-y-4">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block">
                Padrões dos Orçamentos
              </span>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Condições de Pagamento Padrão
                </label>
                <input
                  type="text"
                  value={empresa.condicoes_pagamento || ''}
                  onChange={e => atualizarEmpresa('condicoes_pagamento', e.target.value)}
                  placeholder="Ex.: 50% de entrada + 50% na conclusão"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Prazo Padrão
                  </label>
                  <input
                    type="text"
                    value={empresa.prazo_entrega_padrao || ''}
                    onChange={e => atualizarEmpresa('prazo_entrega_padrao', e.target.value)}
                    placeholder="Ex.: 10 a 15 dias"
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                    Validade (Dias)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="90"
                    value={empresa.validade_dias || 7}
                    onChange={e => atualizarEmpresa('validade_dias', parseInt(e.target.value) || 7)}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-bold focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                  />
                </div>
              </div>

              <div className="pt-2">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5">
                  Título Superior nos Orçamentos
                </label>
                <input
                  type="text"
                  value={empresa.texto_topo || ''}
                  onChange={e => atualizarEmpresa('texto_topo', e.target.value)}
                  placeholder="Ex.: Orçamento Especial sob Medida"
                  className="w-full px-4 py-3 rounded-2xl border border-slate-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[var(--cor-primaria)]"
                />
              </div>
            </div>
          </div>
        )}

        {abaAtiva === 'produtos' && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Catálogo de Produtos Cadastrados ({produtos.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {produtos.map(p => (
                <div
                  key={p.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex flex-col justify-between gap-3"
                >
                  <div>
                    <span className="text-xs font-bold text-blue-600 block mb-1">
                      {p.categoria || 'Geral'} · Cobrança por{' '}
                      {p.tipo_cobranca === 'area'
                        ? 'm² (Área)'
                        : p.tipo_cobranca === 'linear'
                        ? 'metro linear'
                        : 'unidade'}
                    </span>
                    <h3 className="font-extrabold text-slate-900 text-base">{p.nome}</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Preço base: <strong className="text-slate-800">{toBRL(p.preco_base)}</strong>{' '}
                      {p.tipo_cobranca === 'area' ? '/m²' : ''}
                    </p>
                  </div>
                  <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-400">
                      {p.grupos?.length || 0} grupos de opções
                    </span>
                    <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-lg">
                      Ativo
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {abaAtiva === 'adicionais' && (
          <div className="space-y-4">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block px-1">
              Serviços e Taxas Opcionais ({adicionais.length})
            </span>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {adicionais.map(ad => (
                <div
                  key={ad.id}
                  className="bg-white rounded-3xl p-5 border border-slate-200/90 shadow-sm flex items-center justify-between gap-4"
                >
                  <div>
                    <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">
                      {ad.nome}
                    </h3>
                    <span className="text-xs text-slate-400 block mt-0.5">
                      Tipo: {ad.tipo === 'fixo' ? 'Valor Fixo (R$)' : 'Percentual sobre Subtotal (%)'}
                    </span>
                    {ad.marcado_por_padrao && (
                      <span className="text-[10px] text-blue-600 font-bold block mt-1">
                        ✓ Marcado por padrão nos novos orçamentos
                      </span>
                    )}
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-lg font-black text-slate-900 block">
                      {ad.tipo === 'fixo' ? toBRL(ad.valor) : `${ad.valor}%`}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="pt-2">
          <button
            type="submit"
            disabled={saving}
            className="w-full sm:w-auto px-8 py-4 rounded-2xl font-bold text-white text-sm sm:text-base flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:brightness-110 active:scale-[0.99] disabled:opacity-60"
            style={{ background: 'var(--cor-primaria)' }}
          >
            <Save size={18} />
            <span>{saving ? 'Gravando dados...' : 'Salvar Todas as Configurações'}</span>
          </button>
        </div>
      </form>
    </div>
  )
}
